--------------------------------------------------------------------------------
-- Harden Vignette Create RPC RLS Boundary
--------------------------------------------------------------------------------
-- The catalog-copy RPC creates a parent vignette_encounter row and then copies
-- child setup rows into the active encounter tables. Authenticated callers are
-- still required, and the function assigns ownership from auth.uid(), but the
-- copy process itself must not be interrupted by table RLS while it is creating
-- the active graph for that owner.

alter function public.create_vignette_encounter_from_catalog(uuid, int)
	security definer;

revoke all on function public.create_vignette_encounter_from_catalog(uuid, int)
from public;
revoke execute on function public.create_vignette_encounter_from_catalog(uuid, int)
from anon;
grant execute on function public.create_vignette_encounter_from_catalog(uuid, int) to authenticated;
