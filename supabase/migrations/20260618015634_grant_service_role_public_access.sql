--------------------------------------------------------------------------------
-- Grant Service Role Public Schema Access
--
-- The service_role JWT bypasses RLS, but PostgREST still requires the
-- underlying SQL role to have table/function privileges. CI starts from a fresh
-- local stack, so make those privileges explicit instead of relying on implicit
-- local defaults or legacy admin RLS policies.
--------------------------------------------------------------------------------

grant usage on schema public to service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;
