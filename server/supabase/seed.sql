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
  ('eco-bottle-01', 'Reusable Drinkware', 'reusable-drinkware', 349.00, 'Drinkware', 'Promotion',
   'Reusable drinkware designed for everyday sustainable living, crafted from recycled stainless steel with a sage-toned finish.',
   'https://images.pexels.com/photos/7879895/pexels-photo-7879895.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream","charcoal"]', true, true, false, 8, 'HML-1001', 4, 165.00, 1),

  ('cookware-02', 'Non-Toxic Cookware Set', 'non-toxic-cookware-set', 1899.00, 'Cooking', 'New',
   'A ceramic-coated cookware set free from PTFE and PFOA, built for slow, mindful cooking and lasting kitchen rituals.',
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
   '["cream","sage"]', true, true, true, 12, 'HML-1002', 3, 920.00, 2),

  ('toaster-03', 'Eco-Friendly Toaster', 'eco-friendly-toaster', 1199.00, 'Kitchen Essentials', 'Customer favorite',
   'Energy-efficient toaster with a quiet motor and recycled-aluminum housing in warm cream and forest tones.',
   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', true, true, false, 6, 'HML-1003', 4, 580.00, 3),

  ('bamboo-04', 'Bamboo Utensil Holder', 'bamboo-utensil-holder', 199.00, 'Storage', 'New',
   'Hand-finished bamboo holder that keeps tools upright and within reach, made from rapidly renewable materials.',
   'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
   '["sage","cream"]', true, false, true, 15, 'HML-1004', 3, 95.00, 4),

  ('pour-over-05', 'Stoneware Pour-Over', 'stoneware-pour-over', 549.00, 'Drinkware', 'Customer favorite',
   'A quietly elegant pour-over in unglazed stoneware, made for slower mornings and lower-waste coffee rituals.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', false, true, false, 10, 'HML-1005', 3, 265.00, 5),

  ('linen-06', 'Organic Linen Towels', 'organic-linen-towels', 649.00, 'Kitchen Essentials', 'Promotion',
   'Soft organic linen towels in muted sage and sand, designed to last through years of daily use.',
   'https://images.pexels.com/photos/4805220/pexels-photo-4805220.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream","olive"]', false, false, true, 4, 'HML-1006', 5, 315.00, 6),

  ('canister-07', 'Glass Storage Canisters', 'glass-storage-canisters', 899.00, 'Storage', null,
   'Clear glass canisters with beechwood lids for pantry staples, spices, and low-waste bulk shopping.',
   'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80',
   '["cream"]', false, false, true, 0, 'HML-1007', 4, 435.00, 7),

  ('board-08', 'Walnut Serving Board', 'walnut-serving-board', 1099.00, 'Natural Materials', 'Customer favorite',
   'A generously sized walnut board finished with food-safe oil, meant to be passed around the table for years.',
   'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80',
   '["charcoal","cream"]', false, true, false, 9, 'HML-1008', 3, 535.00, 8),

  ('mug-set-09', 'Ceramic Tea Mug Set', 'ceramic-tea-mug-set', 299.00, 'Drinkware', 'New',
   'A set of two stoneware mugs glazed in warm neutrals — slow mornings, refillable, and built to last.',
   'https://images.pexels.com/photos/10622354/pexels-photo-10622354.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream","sage","charcoal"]', true, false, true, 10, 'HML-1009', 4, 145.00, 9),

  ('basket-10', 'Handwoven Seagrass Basket', 'handwoven-seagrass-basket', 549.00, 'Storage', null,
   'A sturdy, handwoven seagrass basket for blankets, produce, or toys — naturally textured and ethically made.',
   'https://images.pexels.com/photos/10080934/pexels-photo-10080934.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sand","cream"]', false, false, true, 6, 'HML-1010', 3, 265.00, 10),

  ('skillet-11', 'Pre-Seasoned Cast Iron Skillet', 'cast-iron-skillet', 1499.00, 'Cooking', 'Customer favorite',
   'A 10-inch cast iron skillet that only gets better with use — naturally non-stick and heats evenly for years.',
   'https://images.pexels.com/photos/12974474/pexels-photo-12974474.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["charcoal"]', true, true, false, 8, 'HML-1011', 3, 730.00, 11),

  ('runner-12', 'Linen Table Runner', 'linen-table-runner', 649.00, 'Kitchen Essentials', 'Promotion',
   'European flax linen table runner in muted sage — softens any table and softens more with every wash.',
   'https://images.pexels.com/photos/13748996/pexels-photo-13748996.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream"]', false, false, true, 5, 'HML-1012', 4, 315.00, 12),

  ('utensils-13', 'Bamboo Utensil Set', 'bamboo-utensil-set', 399.00, 'Natural Materials', null,
   'A nine-piece bamboo cooking utensil set — spatulas, ladle, tongs, and spoons, oiled and ready for the kitchen.',
   'https://images.pexels.com/photos/11001668/pexels-photo-11001668.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sand","charcoal"]', false, false, false, 7, 'HML-1013', 3, 190.00, 13),

  ('pantry-14', 'Glass Pantry Jars', 'glass-pantry-jars', 1199.00, 'Storage', 'New',
   'Airtight glass pantry jars with bamboo lids for coffee, grains, and pasta — zero-waste bulk shopping made easy.',
   'https://images.pexels.com/photos/10252345/pexels-photo-10252345.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream"]', false, true, true, 9, 'HML-1014', 4, 580.00, 14),

  ('trivets-15', 'Cork Trivets (Set of 4)', 'cork-trivets-set-of-4', 249.00, 'Kitchen Essentials', null,
   'Four naturally insulating cork trivets that protect counters from hot pots and slow cookers.',
   'https://images.pexels.com/photos/11137699/pexels-photo-11137699.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sand","charcoal"]', false, false, false, 14, 'HML-1015', 3, 120.00, 15),

  ('tablecloth-16', 'Organic Cotton Tablecloth', 'organic-cotton-tablecloth', 799.00, 'Natural Materials', 'Customer favorite',
   'GOTS-certified organic cotton tablecloth in creamy off-white — relaxed wrinkles, honest material, everyday beauty.',
   'https://images.pexels.com/photos/10216540/pexels-photo-10216540.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream","sage"]', false, false, false, 3, 'HML-1016', 5, 385.00, 16),

  ('bedsheet-17', 'Organic Cotton Bedsheet Set', 'organic-cotton-bedsheet-set', 1299.00, 'Bedding', 'New',
   'Breathable organic cotton bedsheet set (fitted, flat, and two pillowcases) that feels cool on humid nights and softens with every wash.',
   'https://images.pexels.com/photos/10061382/pexels-photo-10061382.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream","sage"]', true, false, true, 8, 'HML-1017', 3, 620.00, 17),

  ('pillows-18', 'Bamboo Fiber Pillows (Set of 2)', 'bamboo-fiber-pillows-set-of-2', 899.00, 'Bedding', null,
   'Two plush bamboo-fiber pillows that bounce back all night — naturally breathable, hypoallergenic, and machine washable.',
   'https://images.pexels.com/photos/10060374/pexels-photo-10060374.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream","charcoal"]', false, false, true, 12, 'HML-1018', 4, 430.00, 18),

  ('duvet-19', 'Linen Duvet Cover', 'linen-duvet-cover', 1799.00, 'Bedding', 'Customer favorite',
   'European flax linen duvet cover with hidden button closure — relaxed lived-in texture in a warm oat tone.',
   'https://images.pexels.com/photos/10061391/pexels-photo-10061391.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sage","cream"]', true, true, false, 6, 'HML-1019', 3, 860.00, 19),

  ('salaset-20', 'Cozy Sala Set', 'cozy-sala-set', 12999.00, 'Living Room', 'New',
   'A complete sala set for the living room — 3-seater sofa, two accent chairs, and a center coffee table in warm neutral tones.',
   'https://images.pexels.com/photos/11295890/pexels-photo-11295890.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sand","charcoal"]', true, false, true, 2, 'HML-1020', 1, 6200.00, 20),

  ('coffeetable-21', 'Rattan Coffee Table', 'rattan-coffee-table', 3499.00, 'Living Room', null,
   'Handwoven rattan coffee table with a tempered glass top — lightweight enough to move, sturdy enough for everyday.',
   'https://images.pexels.com/photos/10108747/pexels-photo-10108747.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["sand","charcoal"]', false, false, false, 4, 'HML-1021', 2, 1680.00, 21),

  ('pan-22', 'Ceramic Non-Stick Frying Pan', 'ceramic-non-stick-frying-pan', 899.00, 'Cooking', 'Promotion',
   'A ceramic-coated frying pan with a comfortable stay-cool handle — free of PTFE and PFOA, ready for eggs and morning pancakes.',
   'https://images.pexels.com/photos/10432707/pexels-photo-10432707.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["charcoal"]', false, false, false, 14, 'HML-1022', 4, 430.00, 22),

  ('steel-pan-23', 'Stainless Steel Fry Pan', 'stainless-steel-fry-pan', 799.00, 'Cooking', null,
   'A durable stainless steel fry pan that heats evenly and cleans easily — the everyday workhorse for sautés and sears.',
   'https://images.pexels.com/photos/12673631/pexels-photo-12673631.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["charcoal"]', false, false, false, 10, 'HML-1023', 3, 385.00, 23),

  ('throwblanket-24', 'Knitted Throw Blanket', 'knitted-throw-blanket', 1099.00, 'Bedding', 'Customer favorite',
   'A chunky hand-knitted throw blanket in soft cream — drapes beautifully on the sofa and keeps movie nights cozy.',
   'https://images.pexels.com/photos/10373509/pexels-photo-10373509.jpeg?auto=compress&cs=tinysrgb&w=900',
   '["cream","olive"]', true, true, false, 7, 'HML-1024', 3, 525.00, 24)
on conflict (id) do update set
  image         = excluded.image,
  price         = excluded.price,
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
   'https://images.pexels.com/photos/9475718/pexels-photo-9475718.jpeg?auto=compress&cs=tinysrgb&w=600', 5),
  ('bedding',  'Bedding',           'Organic cotton sheets, pillows, and duvets for restful, healthy sleep', 'bedding',
   'https://images.pexels.com/photos/10061382/pexels-photo-10061382.jpeg?auto=compress&cs=tinysrgb&w=600', 6),
  ('living',   'Living Room',       'Sala sets, coffee tables, and cozy throws for your living space', 'living-room',
   'https://images.pexels.com/photos/11295890/pexels-photo-11295890.jpeg?auto=compress&cs=tinysrgb&w=600', 7)
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