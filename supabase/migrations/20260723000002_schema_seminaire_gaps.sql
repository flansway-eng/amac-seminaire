-- Comble les écarts entre le schéma existant et le cahier des charges du
-- séminaire national (§6) : statut de cotisation des sections et
-- verrouillage RLS du droit de vote pour les sections non à jour, écriture
-- des décisions ouverte au scribe.

-- 1. Statut de cotisation par section (condition statutaire du vote)
alter table sections
  add column if not exists a_jour_cotisation boolean not null default true;

-- 2. Le scribe peut désormais écrire les décisions, au même titre que
--    admin/ben (module 5 : "Adopter la rédaction" est réservé au scribe).
drop policy if exists "Decisions modifiables par admin et ben" on decisions;
create policy "Decisions modifiables par admin, ben et scribe" on decisions
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben', 'scribe'))
    );

-- 3. Une section non à jour de sa cotisation peut lire les réponses mais
--    ne peut pas voter : condition vérifiée dans la policy elle-même, pas
--    seulement dans l'interface.
drop policy if exists "Reponses modifiables par l'auteur" on reponses;
create policy "Reponses inserees uniquement par sections a jour" on reponses
    for insert to authenticated with check (
        profile_id = auth.uid()
        and exists (
            select 1 from profiles p
            join sections s on s.id = p.section_id
            where p.id = auth.uid() and s.a_jour_cotisation = true
        )
    );
create policy "Reponses modifiables par l'auteur si section a jour" on reponses
    for update to authenticated using (
        profile_id = auth.uid()
        and exists (
            select 1 from profiles p
            join sections s on s.id = p.section_id
            where p.id = auth.uid() and s.a_jour_cotisation = true
        )
    );
