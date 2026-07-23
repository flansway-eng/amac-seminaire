-- Ajoute les rôles manquants à l'enum user_role (delegue, scribe).
-- Isolé dans sa propre migration : "ALTER TYPE ... ADD VALUE" ne peut pas
-- être utilisé dans la même transaction qu'une instruction qui référence
-- la nouvelle valeur (erreur Postgres "unsafe use of new value of enum
-- type"), et chaque fichier de migration Supabase s'exécute dans sa
-- propre transaction.
alter type user_role add value if not exists 'delegue';
alter type user_role add value if not exists 'scribe';
