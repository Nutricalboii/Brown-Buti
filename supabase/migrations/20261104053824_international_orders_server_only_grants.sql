revoke all on table public.international_orders from anon, authenticated, service_role;
grant select, insert, update on table public.international_orders to service_role;
