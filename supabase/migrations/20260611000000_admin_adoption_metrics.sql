--------------------------------------------------------------------------------
-- Admin Adoption Metrics
--
-- Internal adoption reporting stays inside Postgres: no external event host,
-- no client-side analytics beacon, and no raw Auth/user data sent to the
-- browser. Admin routes call this helper with the service-role client and get
-- aggregate metrics for the dashboard.
--------------------------------------------------------------------------------
create or replace function public.get_admin_adoption_metrics() returns jsonb language sql security definer
set search_path = '' as $$ with users_base as (
    select id,
      created_at,
      email_confirmed_at,
      confirmed_at,
      last_sign_in_at
    from auth.users
    where deleted_at is null
  ),
  settlements_base as (
    select id,
      user_id,
      created_at,
      campaign_type::text as campaign_type
    from public.settlement
  ),
  survivors_base as (
    select sv.id,
      sv.created_at,
      sv.settlement_id,
      s.user_id
    from public.survivor sv
      join public.settlement s on s.id = sv.settlement_id
  ),
  first_settlements as (
    select user_id,
      min(created_at) as first_settlement_at
    from settlements_base
    group by user_id
  ),
  first_survivors as (
    select user_id,
      min(created_at) as first_survivor_at
    from survivors_base
    group by user_id
  ),
  user_rollups as (
    select u.id,
      u.created_at,
      coalesce(u.confirmed_at, u.email_confirmed_at) as confirmed_at,
      u.last_sign_in_at,
      count(distinct s.id)::int as settlement_count,
      count(distinct sv.id)::int as survivor_count
    from users_base u
      left join settlements_base s on s.user_id = u.id
      left join survivors_base sv on sv.user_id = u.id
    group by u.id,
      u.created_at,
      u.confirmed_at,
      u.email_confirmed_at,
      u.last_sign_in_at
  ),
  settlement_depth as (
    select s.id,
      count(sv.id)::int as survivor_count
    from settlements_base s
      left join survivors_base sv on sv.settlement_id = s.id
    group by s.id
  ),
  daily_series as (
    select day::date as day,
      (
        select count(*)::int
        from users_base u
        where u.created_at >= day
          and u.created_at < day + interval '1 day'
      ) as signups,
      (
        select count(*)::int
        from settlements_base s
        where s.created_at >= day
          and s.created_at < day + interval '1 day'
      ) as settlements,
      (
        select count(*)::int
        from survivors_base sv
        where sv.created_at >= day
          and sv.created_at < day + interval '1 day'
      ) as survivors
    from generate_series(
        (current_date - interval '29 days')::date,
        current_date,
        interval '1 day'
      ) as day
  ),
  campaign_mix as (
    select campaign_type,
      count(*)::int as settlement_count
    from settlements_base
    group by campaign_type
  ),
  subscription_mix as (
    select plan_id,
      status,
      count(*)::int as user_count
    from public.user_subscription
    group by plan_id,
      status
  )
select jsonb_build_object(
    'generated_at',
    now(),
    'totals',
    jsonb_build_object(
      'users',
      (
        select count(*)::int
        from users_base
      ),
      'confirmed_users',
      (
        select count(*)::int
        from user_rollups
        where confirmed_at is not null
      ),
      'settlement_creators',
      (
        select count(*)::int
        from user_rollups
        where settlement_count > 0
      ),
      'survivor_creators',
      (
        select count(*)::int
        from user_rollups
        where survivor_count > 0
      ),
      'settlements',
      (
        select count(*)::int
        from settlements_base
      ),
      'survivors',
      (
        select count(*)::int
        from survivors_base
      ),
      'shared_settlements',
      (
        select count(distinct settlement_id)::int
        from public.settlement_shared_user
      ),
      'sharing_relationships',
      (
        select count(*)::int
        from public.settlement_shared_user
      ),
      'collaborating_users',
      (
        select count(distinct shared_user_id)::int
        from public.settlement_shared_user
      ),
      'active_subscriptions',
      (
        select count(*)::int
        from public.user_subscription
        where status in ('active', 'trialing')
      ),
      'paid_subscriptions',
      (
        select count(*)::int
        from public.user_subscription
        where plan_id <> 'free'
          and status in ('active', 'trialing')
      )
    ),
    'recent',
    jsonb_build_object(
      'new_users_7d',
      (
        select count(*)::int
        from users_base
        where created_at >= now() - interval '7 days'
      ),
      'new_users_30d',
      (
        select count(*)::int
        from users_base
        where created_at >= now() - interval '30 days'
      ),
      'new_settlements_7d',
      (
        select count(*)::int
        from settlements_base
        where created_at >= now() - interval '7 days'
      ),
      'new_settlements_30d',
      (
        select count(*)::int
        from settlements_base
        where created_at >= now() - interval '30 days'
      ),
      'new_survivors_7d',
      (
        select count(*)::int
        from survivors_base
        where created_at >= now() - interval '7 days'
      ),
      'new_survivors_30d',
      (
        select count(*)::int
        from survivors_base
        where created_at >= now() - interval '30 days'
      )
    ),
    'activity',
    jsonb_build_object(
      'active_users_7d',
      (
        select count(*)::int
        from users_base
        where last_sign_in_at >= now() - interval '7 days'
      ),
      'active_users_30d',
      (
        select count(*)::int
        from users_base
        where last_sign_in_at >= now() - interval '30 days'
      ),
      'never_signed_in_users',
      (
        select count(*)::int
        from users_base
        where last_sign_in_at is null
      )
    ),
    'depth',
    jsonb_build_object(
      'average_settlements_per_creator',
      (
        select round(avg(settlement_count)::numeric, 1)
        from user_rollups
        where settlement_count > 0
      ),
      'average_survivors_per_settlement',
      (
        select round(avg(survivor_count)::numeric, 1)
        from settlement_depth
      ),
      'max_survivors_in_settlement',
      (
        select coalesce(max(survivor_count), 0)::int
        from settlement_depth
      ),
      'settlements_with_four_plus_survivors',
      (
        select count(*)::int
        from settlement_depth
        where survivor_count >= 4
      )
    ),
    'timing',
    jsonb_build_object(
      'average_days_to_first_settlement',
      (
        select round(
            avg(
              extract(
                epoch
                from (fs.first_settlement_at - u.created_at)
              ) / 86400
            )::numeric,
            1
          )
        from users_base u
          join first_settlements fs on fs.user_id = u.id
        where fs.first_settlement_at >= u.created_at
      ),
      'average_days_to_first_survivor',
      (
        select round(
            avg(
              extract(
                epoch
                from (fsv.first_survivor_at - u.created_at)
              ) / 86400
            )::numeric,
            1
          )
        from users_base u
          join first_survivors fsv on fsv.user_id = u.id
        where fsv.first_survivor_at >= u.created_at
      )
    ),
    'daily_series',
    coalesce(
      (
        select jsonb_agg(
            jsonb_build_object(
              'date',
              to_char(day, 'YYYY-MM-DD'),
              'signups',
              signups,
              'settlements',
              settlements,
              'survivors',
              survivors
            )
            order by day
          )
        from daily_series
      ),
      '[]'::jsonb
    ),
    'campaign_mix',
    coalesce(
      (
        select jsonb_agg(
            jsonb_build_object(
              'campaign_type',
              campaign_type,
              'settlement_count',
              settlement_count
            )
            order by settlement_count desc,
              campaign_type
          )
        from campaign_mix
      ),
      '[]'::jsonb
    ),
    'subscription_mix',
    coalesce(
      (
        select jsonb_agg(
            jsonb_build_object(
              'plan_id',
              plan_id,
              'status',
              status,
              'user_count',
              user_count
            )
            order by user_count desc,
              plan_id,
              status
          )
        from subscription_mix
      ),
      '[]'::jsonb
    )
  );
$$;
revoke all on function public.get_admin_adoption_metrics()
from public;
grant execute on function public.get_admin_adoption_metrics() to service_role;