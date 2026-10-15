-- ============================================================
-- Homeline — extra seed reviews (one per product that has none)
-- How to run: Supabase Dashboard -> SQL Editor -> New query
-- -> paste this file -> Run
-- Safe to run multiple times: each insert is skipped when the
-- product already has at least one review.
-- ============================================================

-- cookware-02
insert into public.reviews (product_id, customer_name, rating, comment)
select 'cookware-02', 'Rosa Villanueva', 5, 'Coating feels quality, nothing sticks and cleanup is so easy. Worth it.'
where not exists (select 1 from public.reviews where product_id = 'cookware-02');

-- toaster-03
insert into public.reviews (product_id, customer_name, rating, comment)
select 'toaster-03', 'Mark Aquino', 4, 'Quiet and even browning. Matches our cream kitchen perfectly.'
where not exists (select 1 from public.reviews where product_id = 'toaster-03');

-- bamboo-04
insert into public.reviews (product_id, customer_name, rating, comment)
select 'bamboo-04', 'Jenny Lim', 5, 'Sturdy and pretty on the counter. Holds all our cooking tools.'
where not exists (select 1 from public.reviews where product_id = 'bamboo-04');

-- pour-over-05
insert into public.reviews (product_id, customer_name, rating, comment)
select 'pour-over-05', 'Carlos Tan', 5, 'Makes a clean, slow cup every morning. Beautiful stoneware.'
where not exists (select 1 from public.reviews where product_id = 'pour-over-05');

-- linen-06
insert into public.reviews (product_id, customer_name, rating, comment)
select 'linen-06', 'Sofia Reyes', 4, 'Absorbent and softens with every wash. Love the sage color.'
where not exists (select 1 from public.reviews where product_id = 'linen-06');

-- canister-07
insert into public.reviews (product_id, customer_name, rating, comment)
select 'canister-07', 'Paula Domingo', 5, 'Airtight seal keeps our coffee beans fresh. Pantry looks so tidy now.'
where not exists (select 1 from public.reviews where product_id = 'canister-07');

-- basket-10
insert into public.reviews (product_id, customer_name, rating, comment)
select 'basket-10', 'Katrina Uy', 4, 'Handwoven texture is lovely. Sturdy enough for blankets and toys.'
where not exists (select 1 from public.reviews where product_id = 'basket-10');

-- runner-12
insert into public.reviews (product_id, customer_name, rating, comment)
select 'runner-12', 'Bianca Cruz', 5, 'Elevates the whole dining table. Linen quality is excellent.'
where not exists (select 1 from public.reviews where product_id = 'runner-12');

-- utensils-13
insert into public.reviews (product_id, customer_name, rating, comment)
select 'utensils-13', 'Diego Santos', 4, 'Complete set, smooth finish, gentle on our pans. Good value.'
where not exists (select 1 from public.reviews where product_id = 'utensils-13');

-- pantry-14
insert into public.reviews (product_id, customer_name, rating, comment)
select 'pantry-14', 'Angela Mora', 5, 'Bamboo lids seal tight. Our grains and pasta stay fresh for weeks.'
where not exists (select 1 from public.reviews where product_id = 'pantry-14');

-- trivets-15
insert into public.reviews (product_id, customer_name, rating, comment)
select 'trivets-15', 'Jose Ramos', 4, 'Simple and does the job. Protects the counter from hot pots.'
where not exists (select 1 from public.reviews where product_id = 'trivets-15');

-- tablecloth-16
insert into public.reviews (product_id, customer_name, rating, comment)
select 'tablecloth-16', 'Lorna Diaz', 5, 'Certified organic cotton you can feel. Drapes beautifully.'
where not exists (select 1 from public.reviews where product_id = 'tablecloth-16');

-- pillows-18
insert into public.reviews (product_id, customer_name, rating, comment)
select 'pillows-18', 'Marco Perez', 5, 'Cool and breathable even on humid nights. Neck pain gone.'
where not exists (select 1 from public.reviews where product_id = 'pillows-18');

-- coffeetable-21
insert into public.reviews (product_id, customer_name, rating, comment)
select 'coffeetable-21', 'Hannah Go', 4, 'Lightweight rattan, easy to move for cleaning. Glass top is thick.'
where not exists (select 1 from public.reviews where product_id = 'coffeetable-21');

-- pan-22
insert into public.reviews (product_id, customer_name, rating, comment)
select 'pan-22', 'Enrico Sy', 5, 'Perfect for eggs every morning. Handle stays cool, truly non-stick.'
where not exists (select 1 from public.reviews where product_id = 'pan-22');

-- steel-pan-23
insert into public.reviews (product_id, customer_name, rating, comment)
select 'steel-pan-23', 'Dennis Chua', 4, 'Heats evenly and sears well. Our everyday pan now.'
where not exists (select 1 from public.reviews where product_id = 'steel-pan-23');
