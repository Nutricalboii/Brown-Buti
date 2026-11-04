alter table public.international_orders
  add column if not exists sync_lease_until timestamptz;
