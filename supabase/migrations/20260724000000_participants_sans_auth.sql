-- Suppression de l'authentification Supabase Auth au profit d'un modèle
-- "participant" sans compte : cookie signé côté serveur, sans auth.uid().
--
-- Cette migration :
-- 1. ajoute un slug lisible aux sections (liens de diffusion /rejoindre) ;
-- 2. crée `participants`, qui remplace `profiles` pour tout ce qui touche
--    à la session ;
-- 3. migre les données existantes de `profiles` vers `participants` (le cas
--    échéant) et renomme les colonnes d'auteur vers `participant_id` ;
-- 4. supprime toutes les policies RLS fondées sur `auth.uid()` (qui n'a
--    plus de sens sans Supabase Auth) et les remplace par un modèle
--    lecture-seule pour la clé anon, les écritures passant exclusivement
--    par des Server Actions utilisant la clé service_role ;
-- 5. supprime `profiles` et les triggers qui lui sont propres.

-- ==============================================================================
-- 1. SLUG DES SECTIONS (pour /rejoindre?section=<slug> et /ben/liens)
-- ==============================================================================
alter table sections add column if not exists slug text unique;

create or replace function public.slugify(input text)
returns text as $$
  select trim(both '-' from
    regexp_replace(
      lower(
        translate(
          input,
          'àâäáãåèéêëìíîïòóôöõùúûüçñÀÂÄÁÃÅÈÉÊËÌÍÎÏÒÓÔÖÕÙÚÛÜÇÑ',
          'aaaaaaeeeeiiiiooooouuuucnAAAAAAEEEEIIIIOOOOOUUUUCN'
        )
      ),
      '[^a-z0-9]+', '-', 'g'
    )
  );
$$ language sql immutable;

update sections set slug = public.slugify(nom) where slug is null;

alter table sections alter column slug set not null;

create or replace function public.sections_set_slug()
returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(new.nom);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_sections_set_slug on sections;
create trigger on_sections_set_slug
  before insert on sections
  for each row execute procedure public.sections_set_slug();

-- ==============================================================================
-- 2. TABLE PARTICIPANTS
-- ==============================================================================
create table participants (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  section_id integer references sections(id),
  role text not null default 'delegue'
    check (role in ('delegue', 'observateur', 'scribe', 'ben', 'admin')),
  seance text,
  cree_le timestamptz not null default now(),
  vu_le timestamptz not null default now()
);

-- ==============================================================================
-- 3. MIGRATION DES DONNÉES EXISTANTES profiles -> participants
-- Les identifiants sont conservés tels quels : les colonnes qui référencent
-- profiles(id) continuent de référencer les mêmes UUID, désormais dans
-- participants(id), sans table de correspondance nécessaire.
-- ==============================================================================
insert into participants (id, nom, section_id, role, cree_le)
select
  id,
  nom,
  section_id,
  case role::text
    when 'ben' then 'ben'
    when 'admin' then 'admin'
    when 'scribe' then 'scribe'
    when 'delegue' then 'delegue'
    else 'observateur'
  end,
  created_at
from profiles
on conflict (id) do nothing;

-- reponses.profile_id -> reponses.participant_id
alter table reponses drop constraint if exists reponses_profile_id_fkey;
alter table reponses rename column profile_id to participant_id;
alter table reponses add constraint reponses_participant_id_fkey
  foreign key (participant_id) references participants(id) on delete cascade;

-- Un participant BEN ou observateur n'a pas de section (section_id null) :
-- la contrainte NOT NULL héritée du modèle "profiles" (où chaque membre
-- appartenait forcément à une section) n'a plus lieu d'être.
alter table reponses alter column section_id drop not null;

-- propositions.auteur_id -> propositions.participant_id
alter table propositions drop constraint if exists propositions_auteur_id_fkey;
alter table propositions rename column auteur_id to participant_id;
alter table propositions add constraint propositions_participant_id_fkey
  foreign key (participant_id) references participants(id) on delete set null;

-- decisions : nouvelle colonne traçant qui (scribe/BEN) a enregistré la
-- décision. N'existait pas dans le schéma précédent (aucune colonne
-- profile_id sur cette table) ; ajoutée ici pour la traçabilité.
alter table decisions add column if not exists participant_id uuid
  references participants(id) on delete set null;

-- ==============================================================================
-- 4. SUPPRESSION DES TRIGGERS ET FONCTIONS PROPRES À SUPABASE AUTH / profiles
-- ==============================================================================
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop trigger if exists on_profiles_prevent_self_escalation on profiles;
drop function if exists public.prevent_self_privilege_escalation();

-- ==============================================================================
-- 5. SUPPRESSION DE TOUTES LES POLICIES FONDÉES SUR auth.uid()
-- ==============================================================================
drop policy if exists "Sections consultables par tous les connectes" on sections;
drop policy if exists "Sections modifiables par admin et ben" on sections;

drop policy if exists "Textes consultables par tous" on textes;
drop policy if exists "Textes modifiables par admin et ben" on textes;

drop policy if exists "Articles consultables par tous" on articles;
drop policy if exists "Articles modifiables par admin et ben" on articles;

drop policy if exists "Enjeux consultables par tous" on enjeux;
drop policy if exists "Enjeux modifiables par admin et ben" on enjeux;

drop policy if exists "Questions consultables par tous" on questions;
drop policy if exists "Questions modifiables par admin et ben" on questions;

drop policy if exists "Reponses consultables par tous" on reponses;
drop policy if exists "Reponses modifiables par l'auteur" on reponses;
drop policy if exists "Reponses inserees uniquement par sections a jour" on reponses;
drop policy if exists "Reponses modifiables par l'auteur si section a jour" on reponses;

drop policy if exists "Propositions consultables par tous" on propositions;
drop policy if exists "Propositions insertables par tous les connectes" on propositions;
drop policy if exists "Propositions modifiables par l'auteur en brouillon ou soumise" on propositions;

drop policy if exists "Decisions consultables par tous" on decisions;
drop policy if exists "Decisions modifiables par admin et ben" on decisions;
drop policy if exists "Decisions modifiables par admin, ben et scribe" on decisions;

drop policy if exists "Seminaire session consultable par tous" on seminaire_session;
drop policy if exists "Seminaire session modifiable par admin et ben" on seminaire_session;

-- ==============================================================================
-- 6. SUPPRESSION DE profiles (données déjà migrées vers participants)
-- ==============================================================================
drop table if exists profiles;

-- Type devenu orphelin : plus aucune colonne ne s'appuie sur l'enum
-- user_role maintenant que profiles est supprimée. participants.role est
-- une colonne text avec sa propre contrainte check, plus restreinte.
drop type if exists user_role;

-- ==============================================================================
-- 7. NOUVEAU MODÈLE RLS
--
-- - articles/enjeux/questions/sections/textes : lecture seule pour la clé
--   anon (aucune écriture directe, jamais).
-- - reponses/seminaire_session : lecture seule pour la clé anon également —
--   nécessaire techniquement pour que les abonnements Supabase Realtime
--   utilisés par le mode séminaire (vote en direct, écran de projection)
--   fonctionnent depuis le navigateur, qui ne peut s'authentifier qu'avec
--   la clé anon. Conséquence assumée : les réponses (y compris commentaires
--   libres) sont lisibles par quiconque dispose de la clé anon publique,
--   pas seulement par les participants ayant un cookie valide — voir le
--   rapport pour ce compromis.
-- - participants/propositions/decisions : aucune policy pour anon =
--   accès refusé par défaut. Toute lecture ou écriture passe par les
--   Server Actions (src/lib/supabase/admin.ts, clé service_role, qui
--   contourne RLS et ne s'exécute jamais côté client).
-- ==============================================================================
create policy "Lecture publique sections" on sections
  for select to anon, authenticated using (true);
create policy "Lecture publique textes" on textes
  for select to anon, authenticated using (true);
create policy "Lecture publique articles" on articles
  for select to anon, authenticated using (true);
create policy "Lecture publique enjeux" on enjeux
  for select to anon, authenticated using (true);
create policy "Lecture publique questions" on questions
  for select to anon, authenticated using (true);

create policy "Lecture publique reponses (necessaire au Realtime)" on reponses
  for select to anon, authenticated using (true);
create policy "Lecture publique seminaire_session (necessaire au Realtime)" on seminaire_session
  for select to anon, authenticated using (true);

alter table participants enable row level security;
-- Aucune policy sur participants : accès refusé pour anon/authenticated,
-- y compris en lecture (les Server Actions lisent via service_role).
