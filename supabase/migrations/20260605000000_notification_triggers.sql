--------------------------------------------------------------------------------
-- Notification Triggers
--
-- Emits notification rows when settlement shares are granted or revoked.
-- These run as SECURITY DEFINER because authenticated users are intentionally
-- blocked from inserting into `notification` directly; the trigger layer is the
-- trusted producer for inbox events.
--
-- Reference: GitHub issue #176 ([E4.6]).
--------------------------------------------------------------------------------
create or replace function public.write_settlement_share_notification() returns trigger language plpgsql security definer
set search_path = '' as $$
declare target_settlement record;
begin if TG_OP = 'INSERT' then
select s.id as settlement_id,
  s.settlement_name,
  s.user_id as owner_user_id,
  us.username as owner_username into target_settlement
from public.settlement s
  left join public.user_settings us on us.user_id = s.user_id
where s.id = NEW.settlement_id;
if not found then return NEW;
end if;
insert into public.notification (recipient_user_id, kind, payload)
values (
    NEW.shared_user_id,
    'settlement_shared_with_you',
    jsonb_build_object(
      'settlement_id',
      target_settlement.settlement_id,
      'settlement_name',
      target_settlement.settlement_name,
      'owner_user_id',
      target_settlement.owner_user_id,
      'owner_username',
      target_settlement.owner_username
    )
  );
return NEW;
end if;
if TG_OP = 'DELETE' then
select s.id as settlement_id,
  s.settlement_name into target_settlement
from public.settlement s
where s.id = OLD.settlement_id;
if not found then return OLD;
end if;
insert into public.notification (recipient_user_id, kind, payload)
values (
    OLD.shared_user_id,
    'removed_from_settlement',
    jsonb_build_object(
      'settlement_id',
      target_settlement.settlement_id,
      'settlement_name',
      target_settlement.settlement_name
    )
  );
return OLD;
end if;
return null;
end;
$$;
-- Trigger firing does not require runtime EXECUTE on the function. Revoke the
-- default RPC surface so this SECURITY DEFINER producer is not anon-callable.
revoke execute on function public.write_settlement_share_notification()
from public;
revoke execute on function public.write_settlement_share_notification()
from anon;
drop trigger if exists notify_settlement_shared_user_insert on public.settlement_shared_user;
create trigger notify_settlement_shared_user_insert
after
insert on public.settlement_shared_user for each row execute function public.write_settlement_share_notification();
drop trigger if exists notify_settlement_shared_user_delete on public.settlement_shared_user;
create trigger notify_settlement_shared_user_delete
after delete on public.settlement_shared_user for each row execute function public.write_settlement_share_notification();