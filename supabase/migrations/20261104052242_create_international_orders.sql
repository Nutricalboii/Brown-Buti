create table if not exists public.international_orders (
  reference_id text primary key,
  status text not null default 'pending',
  razorpay_payment_link_id text,
  razorpay_payment_id text,
  currency text not null check (currency = 'USD'),
  amount_minor bigint not null check (amount_minor > 0),
  total_usd numeric(12, 2) not null check (total_usd > 0),
  shipping_usd numeric(12, 2) not null check (shipping_usd >= 0),
  country_code text not null check (country_code ~ '^[A-Z]{2}$' and country_code <> 'IN'),
  email text not null,
  items jsonb not null,
  shipping_address jsonb not null,
  payment_url text,
  shopify_order_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  synced_at timestamptz,
  last_error text
);

create unique index if not exists international_orders_razorpay_link_idx
  on public.international_orders (razorpay_payment_link_id)
  where razorpay_payment_link_id is not null;

alter table public.international_orders enable row level security;

comment on table public.international_orders is
  'Server-only pending and paid records for Brown Buti USD Razorpay Payment Links.';
