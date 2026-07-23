-- Habilitation des extensions
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('membre', 'responsable_section', 'ben', 'comite_controle', 'cac', 'admin');
create type texte_code as enum ('STATUTS', 'RI');
create type enjeu_type as enum ('contradiction', 'renvoi_errone', 'lacune', 'risque_gouvernance', 'incoherence_numerotation', 'modernisation');
create type enjeu_gravite as enum ('critique', 'majeur', 'mineur');
create type question_type as enum ('choix_ab', 'choix_multiple', 'echelle', 'texte_libre');
create type proposition_statut as enum ('brouillon', 'soumise', 'pre_arbitree', 'adoptee', 'rejetee', 'fusionnee');
create type decision_vote as enum ('adopte', 'rejete', 'reporte');

-- 2. SECTIONS
create table sections (
    id serial primary key,
    nom text not null unique,
    ville text not null,
    responsable text,
    actif boolean default true not null
);

-- 3. PROFILS
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    nom text not null,
    role user_role default 'membre'::user_role not null,
    section_id integer references sections(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Active le profil automatique lors de la création d'un utilisateur auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nom, role, section_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', 'Nouvel utilisateur'),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'membre'::user_role),
    (new.raw_user_meta_data->>'section_id')::integer
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. TEXTES
create table textes (
    id serial primary key,
    code texte_code not null unique,
    titre text not null,
    date_adoption date not null
);

-- 5. ARTICLES
create table articles (
    id serial primary key,
    texte_id integer references textes(id) on delete cascade not null,
    numero integer not null,
    numero_affiche text not null,
    titre text,
    contenu_actuel text not null,
    titre_parent text,
    chapitre text,
    ordre integer not null,
    search_vector tsvector generated always as (
        to_tsvector('french', coalesce(titre, '') || ' ' || contenu_actuel)
    ) stored
);

create index articles_search_idx on articles using gin(search_vector);
create index articles_texte_numero_idx on articles(texte_id, numero);

-- 6. ENJEUX (Non-concordances pré-chargées)
create table enjeux (
    id serial primary key,
    article_id integer references articles(id) on delete cascade not null,
    type enjeu_type not null,
    gravite enjeu_gravite not null,
    description text not null,
    base_legale text,
    articles_lies integer[] -- Références d'articles concernés
);

-- 7. QUESTIONS DE MODERNISATION
create table questions (
    id serial primary key,
    article_id integer references articles(id) on delete cascade not null,
    ordre integer not null,
    intitule text not null,
    type question_type not null,
    options jsonb default '{}'::jsonb not null, -- Ex: {"option_a": "...", "option_b": "..."}
    obligatoire boolean default false not null
);

-- 8. RÉPONSES DES PARTICIPANTS
create table reponses (
    id uuid default gen_random_uuid() primary key,
    question_id integer references questions(id) on delete cascade not null,
    profile_id uuid references profiles(id) on delete cascade not null,
    section_id integer references sections(id) on delete cascade not null,
    valeur jsonb not null, -- Ex: {"reponse": "A"} ou {"note": 4}
    commentaire text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(question_id, profile_id)
);

-- 9. PROPOSITIONS DE RÉDACTION AMENDÉE
create table propositions (
    id uuid default gen_random_uuid() primary key,
    article_id integer references articles(id) on delete cascade not null,
    auteur_id uuid references profiles(id) on delete set null,
    texte_propose text not null,
    expose_motifs text not null,
    statut proposition_statut default 'brouillon'::proposition_statut not null,
    version text default 'V0.1' not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. DÉCISIONS DU SÉMINAIRE (Mode séminaire en direct)
create table decisions (
    id uuid default gen_random_uuid() primary key,
    article_id integer references articles(id) on delete cascade not null,
    proposition_id uuid references propositions(id) on delete set null,
    decision decision_vote not null,
    quorum_atteint boolean default true not null,
    votes_pour integer default 0 not null,
    votes_contre integer default 0 not null,
    abstentions integer default 0 not null,
    seance text default 'Séminaire National 2026' not null,
    decided_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activer la RLS sur toutes les tables
alter table sections enable row level security;
alter table profiles enable row level security;
alter table textes enable row level security;
alter table articles enable row level security;
alter table enjeux enable row level security;
alter table questions enable row level security;
alter table reponses enable row level security;
alter table propositions enable row level security;
alter table decisions enable row level security;

-- POLICIES

-- sections
create policy "Sections consultables par tous les connectes" on sections
    for select to authenticated using (true);
create policy "Sections modifiables par admin et ben" on sections
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- profiles
create policy "Profils consultables par tous les connectes" on profiles
    for select to authenticated using (true);
create policy "Profils modifiables par admin ou soi-meme" on profiles
    for all to authenticated using (
        id = auth.uid() or
        exists (select 1 from profiles where profiles.id = auth.uid() and role = 'admin')
    );

-- textes
create policy "Textes consultables par tous" on textes
    for select to authenticated using (true);
create policy "Textes modifiables par admin et ben" on textes
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- articles
create policy "Articles consultables par tous" on articles
    for select to authenticated using (true);
create policy "Articles modifiables par admin et ben" on articles
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- enjeux
create policy "Enjeux consultables par tous" on enjeux
    for select to authenticated using (true);
create policy "Enjeux modifiables par admin et ben" on enjeux
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- questions
create policy "Questions consultables par tous" on questions
    for select to authenticated using (true);
create policy "Questions modifiables par admin et ben" on questions
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- reponses
create policy "Reponses consultables par tous" on reponses
    for select to authenticated using (true);
create policy "Reponses modifiables par l'auteur" on reponses
    for all to authenticated using (
        profile_id = auth.uid()
    );

-- propositions
create policy "Propositions consultables par tous" on propositions
    for select to authenticated using (true);
create policy "Propositions insertables par tous les connectes" on propositions
    for insert to authenticated with check (
        auteur_id = auth.uid()
    );
create policy "Propositions modifiables par l'auteur en brouillon ou soumise" on propositions
    for update to authenticated using (
        (auteur_id = auth.uid() and statut in ('brouillon', 'soumise')) or
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben', 'comite_controle'))
    );

-- decisions
create policy "Decisions consultables par tous" on decisions
    for select to authenticated using (true);
create policy "Decisions modifiables par admin et ben" on decisions
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );
