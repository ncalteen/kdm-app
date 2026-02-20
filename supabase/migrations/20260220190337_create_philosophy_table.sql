-- Philosophy
create table philosophy (
    id uuid primary key default gen_random_uuid(),
    philosophy_name varchar not null
);
alter table philosophy enable row level security;
create policy "Allow authenticated read" on philosophy for
select using (auth.role () = 'authenticated');