-- Verrouillage de l'auto-élévation de privilège sur profiles.
--
-- La policy "Profils modifiables par admin ou soi-meme" autorise un
-- utilisateur à mettre à jour sa propre ligne (id = auth.uid()), mais ne
-- restreint pas les colonnes modifiables : sans ce trigger, n'importe quel
-- membre authentifié pourrait s'attribuer le rôle 'admin' ou 'ben' via une
-- simple requête UPDATE sur sa propre ligne. L'application ne doit jamais
-- être la seule ligne de défense (cf. Header / switchUserRoleAndSection,
-- qui sont maintenant limités au mode démonstration hors-ligne) : la policy
-- doit l'empêcher elle-même.

create or replace function public.prevent_self_privilege_escalation()
returns trigger as $$
declare
  is_privileged boolean;
begin
  -- Un admin ou un membre du BEN peut modifier le rôle/la section de
  -- n'importe quel profil (y compris le sien).
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'ben')
  ) into is_privileged;

  if is_privileged then
    return new;
  end if;

  -- Un utilisateur non privilégié ne peut modifier ni son rôle ni sa
  -- section via une auto-mise à jour.
  if new.role is distinct from old.role or new.section_id is distinct from old.section_id then
    raise exception 'Modification du rôle ou de la section réservée aux administrateurs et au BEN';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profiles_prevent_self_escalation on profiles;

create trigger on_profiles_prevent_self_escalation
  before update on profiles
  for each row execute procedure public.prevent_self_privilege_escalation();
