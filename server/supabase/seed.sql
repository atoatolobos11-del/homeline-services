-- ============================================================
-- Homeline — Supabase schema + seed data
-- How to run: Supabase Dashboard -> SQL Editor -> New query
-- -> paste this file -> Run
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.products (
  id          text primary key,
  name        text not null,
  slug        text not null unique,
  price       numeric(10, 2) not null,
  category    text not null,
  badge       text,
  description text,
  image       text,
  colors      jsonb not null default '[]'::jsonb,
  featured    boolean not null default false,
  best_seller boolean not null default false,
  new_arrival boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

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

-- ---------- Seed: products ----------

insert into public.products
  (id, name, slug, price, category, badge, description, image, colors, featured, best_seller, new_arrival, sort_order)
values
  ('eco-bottle-01', 'Reusable Drinkware', 'reusable-drinkware', 43.85, 'Drinkware', 'Promotion',
   'Reusable drinkware designed for everyday sustainable living, crafted from recycled stainless steel with a sage-toned finish.',
   'https://images.unsplash.com/photo-1602143407151-011eace89837?auto=format&fit=crop&w=900&q=80',
   '["sage","cream","charcoal"]', true, true, false, 1),

  ('cookware-02', 'Non-Toxic Cookware Set', 'non-toxic-cookware-set', 189.00, 'Cooking', 'New',
   'A ceramic-coated cookware set free from PTFE and PFOA, built for slow, mindful cooking and lasting kitchen rituals.',
   'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
   '["cream","sage"]', true, true, true, 2),

  ('toaster-03', 'Eco-Friendly Toaster', 'eco-friendly-toaster', 76.50, 'Kitchen Essentials', 'Customer favorite',
   'Energy-efficient toaster with a quiet motor and recycled-aluminum housing in warm cream and forest tones.',
   'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', true, true, false, 3),

  ('bamboo-04', 'Bamboo Utensil Holder', 'bamboo-utensil-holder', 28.40, 'Storage', 'New',
   'Hand-finished bamboo holder that keeps tools upright and within reach, made from rapidly renewable materials.',
   'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=80',
   '["sage","cream"]', true, false, true, 4),

  ('pour-over-05', 'Stoneware Pour-Over', 'stoneware-pour-over', 54.00, 'Drinkware', 'Customer favorite',
   'A quietly elegant pour-over in unglazed stoneware, made for slower mornings and lower-waste coffee rituals.',
   'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
   '["cream","charcoal"]', false, true, false, 5),

  ('linen-06', 'Organic Linen Towels', 'organic-linen-towels', 36.00, 'Kitchen Essentials', 'Promotion',
   'Soft organic linen towels in muted sage and sand, designed to last through years of daily use.',
   'https://images.unsplash.com/photo-1582735689369-4fe89c594006?auto=format&fit=crop&w=900&q=80',
   '["sage","cream","olive"]', false, false, true, 6),

  ('canister-07', 'Glass Storage Canisters', 'glass-storage-canisters', 48.20, 'Storage', null,
   'Clear glass canisters with beechwood lids for pantry staples, spices, and low-waste bulk shopping.',
   'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80',
   '["cream"]', false, false, true, 7),

  ('board-08', 'Walnut Serving Board', 'walnut-serving-board', 62.00, 'Natural Materials', 'Customer favorite',
   'A generously sized walnut board finished with food-safe oil, meant to be passed around the table for years.',
   'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=900&q=80',
   '["charcoal","cream"]', false, true, false, 8)
on conflict (id) do nothing;

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
   'https://images.unsplash.com/photo-1556911220-bff31c987cd3?auto=format&fit=crop&w=600&q=80', 5)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  slug        = excluded.slug,
  image       = excluded.image,
  sort_order  = excluded.sort_order;

-- ---------- Row Level Security ----------
-- The catalog is public: anyone may read products/categories.
-- The forms are public: anyone may insert into newsletter/contact tables.

alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

drop policy if exists "anon can view products" on public.products;
create policy "anon can view products" on public.products for select using (true);

drop policy if exists "anon can view categories" on public.categories;
create policy "anon can view categories" on public.categories for select using (true);

drop policy if exists "anon can subscribe" on public.newsletter_subscribers;
create policy "anon can subscribe" on public.newsletter_subscribers for insert with check (true);

drop policy if exists "anon can send messages" on public.contact_messages;
create policy "anon can send messages" on public.contact_messages for insert with check (true);