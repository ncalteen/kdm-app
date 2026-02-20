-- Weapon Type
create table weapon_type (
    id uuid primary key default gen_random_uuid(),
    type_name varchar not null
);
alter table weapon_type enable row level security;
create policy "Allow authenticated read" on weapon_type for
select using (auth.role() = 'authenticated');