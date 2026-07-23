-- Seminar Session State Table
create table seminaire_session (
    id integer primary key default 1,
    article_actif_id integer references articles(id) on delete set null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table seminaire_session enable row level security;

-- Policies
create policy "Seminaire session consultable par tous" on seminaire_session
    for select to authenticated using (true);

create policy "Seminaire session modifiable par admin et ben" on seminaire_session
    for all to authenticated using (
        exists (select 1 from profiles where profiles.id = auth.uid() and role in ('admin', 'ben'))
    );

-- Insert singleton default row
insert into seminaire_session (id, article_actif_id) values (1, 1)
on conflict (id) do nothing;

-- Add to Realtime replication
alter publish to supabase_realtime add table seminaire_session;
