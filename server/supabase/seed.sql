-- ============================================================
-- Homeline — Supabase schema + seed data
-- How to run: Supabase Dashboard -> SQL Editor -> New query
-- -> paste this file -> Run
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.products (
  id           text primary key,
  name         text not null,
  slug         text not null unique,
  price        numeric(10, 2) not null,
  category     text not null,
  badge        text,
  description  text,
  image        text,
  colors       jsonb not null default '[]'::jsonb,
  featured     boolean not null default false,
  best_seller  boolean not null default false,
  new_arrival  boolean not null default false,
  stock        integer not null default 12,
  sku          text,
  reorder_level integer not null default 3,
  cost_price   numeric(10, 2),
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- Upgrade existing databases that predate the extra columns
alter table public.products add column if not exists stock integer not null default 12;
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists reorder_level integer not null default 3;
alter table public.products add column if not exists cost_price numeric(10, 2);

create table if not exists public.categories (
  id          text primary key,
  name        text not null,
  description text,
  slug        text,
  image       text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- Upgrade existing databases that predate the extra columns
alter table public.categories add column if not exists description text;
alter table public.categories add column if not exists slug text;

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

-- Every checkout becomes an order so sales history is never lost.
create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  order_number   text not null unique,
  customer_name  text not null,
  customer_email text,
  total          numeric(10, 2) not null default 0,
  status         text not null default 'completed',
  created_at     timestamptz not null default now()
);

create table if not exists public.order_items (
  id           bigint generated always as identity primary key,
  order_id     bigint not null references public.orders(id) on delete cascade,
  product_id   text not null references public.products(id),
  product_name text not null,
  unit_price   numeric(10, 2) not null,
  quantity     integer not null,
  subtotal     numeric(10, 2) not null,
  created_at   timestamptz not null default now()
);

-- Audit trail for every stock change: why it changed and what the balance is.
create table if not exists public.stock_movements (
  id          bigint generated always as identity primary key,
  product_id  text not null references public.products(id),
  change_type text not null check (change_type in ('sale', 'restock', 'adjustment')),
  quantity    integer not null check (quantity <> 0),
  reason      text,
  stock_after integer not null,
  created_at  timestamptz not null default now()
);

-- ---------- Seed: products ----------

insert into public.products
  (id, name, slug, price, category, badge, description, image, colors, featured, best_seller, new_arrival, stock, sku, reorder_level, cost_price, sort_order)
values
  ('eco-bottle-01', 'Reusable Drinkware', 'reusable-drinkware', 43.85, 'Drinkware', 'Promotion',
   'Reusable drinkware designed for everyday sustainable living, crafted from recycled stainless steel with a sage-toned finish.',
   'https://images.pexels.com/photos/7879895/pexels-photo-7879895.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream","charcoal"]', true, true, false, 8, 'HML-1001', 4, 20.00, 1),

  ('cookware-02', 'Non-Toxic Cookware Set', 'non-toxic-cookware-set', 189.00, 'Cooking', 'New',
   'A ceramic-coated cookware set free from PTFE and PFOA, built for slow, mindful cooking and lasting kitchen rituals.',
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
   '["cream","sage"]', true, true, true, 12, 'HML-1002', 3, 92.00, 2),

  ('toaster-03', 'Eco-Friendly Toaster', 'eco-friendly-toaster', 76.50, 'Kitchen Essentials', 'Customer favorite',
   'Energy-efficient toaster with a quiet motor and recycled-aluminum housing in warm cream and forest tones.',
   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', true, true, false, 6, 'HML-1003', 4, 38.00, 3),

  ('bamboo-04', 'Bamboo Utensil Holder', 'bamboo-utensil-holder', 28.40, 'Storage', 'New',
   'Hand-finished bamboo holder that keeps tools upright and within reach, made from rapidly renewable materials.',
   'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
   '["sage","cream"]', true, false, true, 15, 'HML-1004', 3, 12.50, 4),

  ('pour-over-05', 'Stoneware Pour-Over', 'stoneware-pour-over', 54.00, 'Drinkware', 'Customer favorite',
   'A quietly elegant pour-over in unglazed stoneware, made for slower mornings and lower-waste coffee rituals.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', false, true, false, 10, 'HML-1005', 3, 26.00, 5),

  ('linen-06', 'Organic Linen Towels', 'organic-linen-towels', 36.00, 'Kitchen Essentials', 'Promotion',
   'Soft organic linen towels in muted sage and sand, designed to last through years of daily use.',
   'https://images.pexels.com/photos/4805220/pexels-photo-4805220.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream","olive"]', false, false, true, 4, 'HML-1006', 5, 17.00, 6),

  ('canister-07', 'Glass Storage Canisters', 'glass-storage-canisters', 48.20, 'Storage', null,
   'Clear glass canisters with beechwood lids for pantry staples, spices, and low-waste bulk shopping.',
   'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80',
   '["cream"]', false, false, true, 0, 'HML-1007', 4, 23.00, 7),

  ('board-08', 'Walnut Serving Board', 'walnut-serving-board', 62.00, 'Natural Materials', 'Customer favorite',
   'A generously sized walnut board finished with food-safe oil, meant to be passed around the table for years.',
   'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80',
   '["charcoal","cream"]', false, true, false, 9, 'HML-1008', 3, 30.00, 8)
on conflict (id) do update set
  image         = excluded.image,
  stock         = excluded.stock,
  sku           = excluded.sku,
  reorder_level = excluded.reorder_level,
  cost_price    = excluded.cost_price;

-- ---------- Seed: categories ----------

insert into public.categories (id, name, description, slug, image, sort_order)
values
  ('drinkware', 'Coffee & Drinkware', 'Sustainable cups, mugs, and reusable bottles for your daily beverages', 'coffee-drinkware',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80', 1),
  ('cooking',   'Cooking',           'Non-toxic cookware and eco-friendly cooking tools for healthy meals', 'cooking',
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', 2),
  ('natural',   'Natural Materials', 'Bamboo, wood, and ceramic products crafted from sustainable sources', 'natural-materials',
   'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=600&q=80', 3),
  ('storage',   'Storage',           'Organize your kitchen with eco-friendly containers and organizers', 'storage',
   'https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=600&q=80', 4),
  ('essentials','Kitchen Essentials','Everything you need for a sustainable, well-equipped kitchen', 'kitchen-essentials',
   'https://images.pexels.com/photos/9475718/pexels-photo-9475718.jpeg?auto=compress&cs=tinysrgb&w=600', 5)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  slug        = excluded.slug,
  image       = excluded.image,
  sort_order  = excluded.sort_order;

-- ---------- Row Level Security ----------
-- The catalog is public: anyone may read products/categories.
-- The forms are public: anyone may insert into newsletter/contact tables.
-- Sales history and stock movements are readable (the Inventory dashboard
-- needs them), but they can only ever be written by the functions below.

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "anon can view products" on public.products;
create policy "anon can view products" on public.products for select using (true);

-- Product management from the Inventory dashboard (add/edit products).
-- Note: this is a portfolio demo — the dashboard "login" is client-side, so the
-- public key can write to products. Swap this for an authenticated role policy
-- when real admin auth is added.
drop policy if exists "anon can insert products" on public.products;
create policy "anon can insert products" on public.products for insert with check (true);
drop policy if exists "anon can update products" on public.products;
create policy "anon can update products" on public.products for update using (true) with check (true);

drop policy if exists "anon can view categories" on public.categories;
create policy "anon can view categories" on public.categories for select using (true);

drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe" on public.newsletter_subscribers for insert with check (true);

drop policy if exists "anon can send messages" on public.contact_messages;
create policy "anon can send messages" on public.contact_messages for insert with check (true);

drop policy if exists "anon can view orders" on public.orders;
create policy "anon can view orders" on public.orders for select using (true);

drop policy if exists "anon can view order items" on public.order_items;
create policy "anon can view order items" on public.order_items for select using (true);

drop policy if exists "anon can view stock movements" on public.stock_movements;
create policy "anon can view stock movements" on public.stock_movements for select using (true);

-- ---------- Inventory ----------
-- All stock + order writes happen inside these SECURITY DEFINER functions
-- (owned by postgres, run outside RLS). The anon key therefore can never edit
-- stock or orders directly — it can only call the functions, and every call is
-- atomic: either the whole operation succeeds or nothing happens.

-- Order numbers look like HML-20260928-0001.
create sequence if not exists public.order_number_seq start 1000;

-- Checkout: validates stock for every item, creates the order + line items,
-- reduces stock and writes a "sale" movement for each product — all in one
-- transaction. Returns {ok:false, insufficient:[...]} if anything is unavailable.
create or replace function public.record_order(
  p_customer_name text,
  p_customer_email text default null,
  p_total numeric default 0,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id     bigint;
  v_order_number text;
  v_item         jsonb;
  v_stock        integer;
  v_missing      text[] := '{}';
begin
  if p_customer_name is null or p_customer_name = '' then
    raise exception 'customer name is required';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    select stock into v_stock
      from public.products
     where id = (v_item->>'id');
    if v_stock is null or v_stock < ((v_item->>'quantity')::int) then
      v_missing := v_missing || (v_item->>'id');
    end if;
  end loop;

  if cardinality(v_missing) > 0 then
    return jsonb_build_object('ok', false, 'insufficient', to_jsonb(v_missing));
  end if;

  v_order_number := 'HML-' || to_char(now(), 'YYYYMMDD') || '-'
                    || lpad(nextval('public.order_number_seq')::text, 4, '0');

  -- p_total is what the customer actually paid (includes tax/shipping)
  insert into public.orders (order_number, customer_name, customer_email, total)
  values (v_order_number, p_customer_name, p_customer_email, greatest(coalesce(p_total, 0), 0))
  returning id into v_order_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    update public.products
       set stock = stock - ((v_item->>'quantity')::int)
     where id = (v_item->>'id')
     returning stock into v_stock;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
    values (
      v_order_id,
      v_item->>'id',
      v_item->>'name',
      ((v_item->>'price')::numeric),
      ((v_item->>'quantity')::int),
      round(((v_item->>'price')::numeric * (v_item->>'quantity')::int), 2)
    );

    insert into public.stock_movements (product_id, change_type, quantity, reason, stock_after)
    values (v_item->>'id', 'sale', -((v_item->>'quantity')::int), 'Order ' || v_order_number, v_stock);
  end loop;

  return jsonb_build_object(
    'ok', true,
    'order_number', v_order_number,
    'order_id', v_order_id,
    'total', greatest(coalesce(p_total, 0), 0)
  );
end $$;

-- Restock or adjust: applies a signed delta to stock and logs a movement.
-- The whole call rolls back if the new balance would be negative.
create or replace function public.adjust_stock(
  p_product_id  text,
  p_delta       integer,
  p_change_type text,
  p_reason      text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_stock integer;
begin
  if p_change_type not in ('restock', 'adjustment', 'sale') then
    raise exception 'invalid change type: %', p_change_type;
  end if;

  update public.products
     set stock = stock + p_delta
   where id = p_product_id
   returning stock into v_stock;

  if not found then
    raise exception 'product not found';
  end if;

  if v_stock < 0 then
    raise exception 'insufficient stock — cannot reduce below 0';
  end if;

  insert into public.stock_movements (product_id, change_type, quantity, reason, stock_after)
  values (p_product_id, p_change_type, p_delta, coalesce(nullif(p_reason, ''), p_change_type), v_stock);

  return v_stock;
end $$;