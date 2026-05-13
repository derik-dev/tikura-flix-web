-- Tikura Flix database schema for Supabase.
-- Run this file in Supabase SQL Editor before testing the static frontend.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    role text not null default 'member',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.courses (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    description text,
    image_url text,
    hero_image_url text,
    category text not null default 'imersao',
    tags text[] not null default '{}',
    instructor_name text not null default 'Vanessa Tikura',
    instructor_avatar_url text,
    featured boolean not null default false,
    status text not null default 'published',
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.courses add column if not exists slug text;
alter table public.courses add column if not exists id uuid default gen_random_uuid();
alter table public.courses alter column id set default gen_random_uuid();
alter table public.courses add column if not exists title text;
alter table public.courses add column if not exists description text;
alter table public.courses add column if not exists image_url text;
alter table public.courses add column if not exists hero_image_url text;
alter table public.courses add column if not exists category text not null default 'imersao';
alter table public.courses add column if not exists tags text[] not null default '{}';
alter table public.courses add column if not exists instructor_name text not null default 'Vanessa Tikura';
alter table public.courses add column if not exists instructor_avatar_url text;
alter table public.courses add column if not exists featured boolean not null default false;
alter table public.courses add column if not exists status text not null default 'published';
alter table public.courses add column if not exists sort_order integer not null default 0;
alter table public.courses add column if not exists created_at timestamptz not null default now();
alter table public.courses add column if not exists updated_at timestamptz not null default now();
create unique index if not exists courses_slug_key on public.courses(slug);

create table if not exists public.course_modules (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    title text not null,
    description text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.course_modules add column if not exists course_id uuid references public.courses(id) on delete cascade;
alter table public.course_modules add column if not exists id uuid default gen_random_uuid();
alter table public.course_modules alter column id set default gen_random_uuid();
alter table public.course_modules add column if not exists title text;
alter table public.course_modules add column if not exists description text;
alter table public.course_modules add column if not exists sort_order integer not null default 0;
alter table public.course_modules add column if not exists created_at timestamptz not null default now();
alter table public.course_modules add column if not exists updated_at timestamptz not null default now();

create table if not exists public.lessons (
    id uuid primary key default gen_random_uuid(),
    course_id uuid not null references public.courses(id) on delete cascade,
    module_id uuid not null references public.course_modules(id) on delete cascade,
    title text not null,
    description text,
    duration_label text,
    video_url text,
    thumbnail_url text,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.lessons add column if not exists course_id uuid references public.courses(id) on delete cascade;
alter table public.lessons add column if not exists module_id uuid references public.course_modules(id) on delete cascade;
alter table public.lessons add column if not exists id uuid default gen_random_uuid();
alter table public.lessons alter column id set default gen_random_uuid();
alter table public.lessons add column if not exists title text;
alter table public.lessons add column if not exists description text;
alter table public.lessons add column if not exists duration_label text;
alter table public.lessons add column if not exists video_url text;
alter table public.lessons add column if not exists thumbnail_url text;
alter table public.lessons add column if not exists sort_order integer not null default 0;
alter table public.lessons add column if not exists created_at timestamptz not null default now();
alter table public.lessons add column if not exists updated_at timestamptz not null default now();

create table if not exists public.enrollments (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    course_id uuid not null references public.courses(id) on delete cascade,
    status text not null default 'active',
    enrolled_at timestamptz not null default now(),
    completed_at timestamptz,
    unique (user_id, course_id)
);

alter table public.enrollments add column if not exists id uuid default gen_random_uuid();
alter table public.enrollments alter column id set default gen_random_uuid();
alter table public.enrollments add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.enrollments add column if not exists course_id uuid references public.courses(id) on delete cascade;
alter table public.enrollments add column if not exists status text not null default 'active';
alter table public.enrollments add column if not exists enrolled_at timestamptz not null default now();
alter table public.enrollments add column if not exists completed_at timestamptz;
create unique index if not exists enrollments_user_id_course_id_key on public.enrollments(user_id, course_id);

create table if not exists public.lesson_progress (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    lesson_id uuid not null references public.lessons(id) on delete cascade,
    watched boolean not null default false,
    watched_at timestamptz,
    updated_at timestamptz not null default now(),
    unique (user_id, lesson_id)
);

alter table public.lesson_progress add column if not exists id uuid default gen_random_uuid();
alter table public.lesson_progress alter column id set default gen_random_uuid();
alter table public.lesson_progress add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.lesson_progress add column if not exists lesson_id uuid references public.lessons(id) on delete cascade;
alter table public.lesson_progress add column if not exists watched boolean not null default false;
alter table public.lesson_progress add column if not exists watched_at timestamptz;
alter table public.lesson_progress add column if not exists updated_at timestamptz not null default now();
create unique index if not exists lesson_progress_user_id_lesson_id_key on public.lesson_progress(user_id, lesson_id);

create table if not exists public.checkout_orders (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete set null,
    full_name text not null,
    email text not null,
    phone text not null,
    cpf text not null,
    payment_method text not null,
    coupon text,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

alter table public.checkout_orders add column if not exists id uuid default gen_random_uuid();
alter table public.checkout_orders alter column id set default gen_random_uuid();
alter table public.checkout_orders add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.checkout_orders add column if not exists full_name text;
alter table public.checkout_orders add column if not exists email text;
alter table public.checkout_orders add column if not exists phone text;
alter table public.checkout_orders add column if not exists cpf text;
alter table public.checkout_orders add column if not exists payment_method text;
alter table public.checkout_orders add column if not exists coupon text;
alter table public.checkout_orders add column if not exists status text not null default 'pending';
alter table public.checkout_orders add column if not exists created_at timestamptz not null default now();

create table if not exists public.community_posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    body text not null check (char_length(body) <= 500),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.community_posts add column if not exists id uuid default gen_random_uuid();
alter table public.community_posts alter column id set default gen_random_uuid();
alter table public.community_posts add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.community_posts add column if not exists body text;
alter table public.community_posts add column if not exists created_at timestamptz not null default now();
alter table public.community_posts add column if not exists updated_at timestamptz not null default now();

create table if not exists public.community_likes (
    post_id uuid not null references public.community_posts(id) on delete cascade,
    user_id uuid not null references public.profiles(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (post_id, user_id)
);

alter table public.community_likes add column if not exists post_id uuid references public.community_posts(id) on delete cascade;
alter table public.community_likes add column if not exists user_id uuid references public.profiles(id) on delete cascade;
alter table public.community_likes add column if not exists created_at timestamptz not null default now();
create unique index if not exists community_likes_post_id_user_id_key on public.community_likes(post_id, user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists course_modules_set_updated_at on public.course_modules;
create trigger course_modules_set_updated_at before update on public.course_modules
for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists lesson_progress_set_updated_at on public.lesson_progress;
create trigger lesson_progress_set_updated_at before update on public.lesson_progress
for each row execute function public.set_updated_at();

drop trigger if exists community_posts_set_updated_at on public.community_posts;
create trigger community_posts_set_updated_at before update on public.community_posts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, full_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.checkout_orders enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_likes enable row level security;

drop policy if exists "Profiles are visible to authenticated users" on public.profiles;
create policy "Profiles are visible to authenticated users" on public.profiles
for select to authenticated using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Published courses are public" on public.courses;
create policy "Published courses are public" on public.courses
for select using (status = 'published');

drop policy if exists "Published modules are public" on public.course_modules;
create policy "Published modules are public" on public.course_modules
for select using (
    exists (
        select 1 from public.courses
        where courses.id = course_modules.course_id
        and courses.status = 'published'
    )
);

drop policy if exists "Published lessons are public" on public.lessons;
create policy "Published lessons are public" on public.lessons
for select using (
    exists (
        select 1 from public.courses
        where courses.id = lessons.course_id
        and courses.status = 'published'
    )
);

drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users create own enrollments" on public.enrollments;
create policy "Users create own enrollments" on public.enrollments
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users read own progress" on public.lesson_progress;
create policy "Users read own progress" on public.lesson_progress
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Users write own progress" on public.lesson_progress;
create policy "Users write own progress" on public.lesson_progress
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update own progress" on public.lesson_progress;
create policy "Users update own progress" on public.lesson_progress
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Anyone can create checkout order" on public.checkout_orders;
create policy "Anyone can create checkout order" on public.checkout_orders
for insert with check (user_id is null or auth.uid() = user_id);

drop policy if exists "Users read own checkout orders" on public.checkout_orders;
create policy "Users read own checkout orders" on public.checkout_orders
for select to authenticated using (auth.uid() = user_id);

drop policy if exists "Community posts visible to members" on public.community_posts;
create policy "Community posts visible to members" on public.community_posts
for select to authenticated using (true);

drop policy if exists "Users create community posts" on public.community_posts;
create policy "Users create community posts" on public.community_posts
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users update own community posts" on public.community_posts;
create policy "Users update own community posts" on public.community_posts
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Community likes visible to members" on public.community_likes;
create policy "Community likes visible to members" on public.community_likes
for select to authenticated using (true);

drop policy if exists "Users create own likes" on public.community_likes;
create policy "Users create own likes" on public.community_likes
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Users delete own likes" on public.community_likes;
create policy "Users delete own likes" on public.community_likes
for delete to authenticated using (auth.uid() = user_id);

with seed_courses(slug, title, description, image_url, category, tags, featured, sort_order) as (
    values
    ('imersao-das-juremas', 'Imersão das Juremas', 'Uma viagem ao universo das Juremas, suas ervas, entidades e vivências.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c1.jpg', 'imersao', array['juremas','imersao','ervas'], true, 1),
    ('imersao-da-magia-de-hecate', 'Imersão da Magia de Hécate', 'Fundamentos e práticas de magia em uma jornada iniciática.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c2.jpg', 'magia', array['magia','imersao','bruxaria'], true, 2),
    ('convencao-das-bruxas', 'Convenção das Bruxas', 'Encontros, ritos e estudos no reino de Hécate.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c3.jpg', 'magia', array['magia','bruxaria','evento'], true, 3),
    ('semana-da-magia', 'Semana da Magia', 'Aulas especiais para aprofundar sua prática mágica.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c4.jpg', 'magia', array['magia','imersao'], false, 4),
    ('a-sacerdotisa', 'A Sacerdotisa', 'Desperte sua intuição e fortaleça sua conexão espiritual.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c5.jpg', 'tarot', array['tarot','magia'], true, 5),
    ('profissao-tarologo-rico', 'Profissão Tarólogo Rico', 'Estruture sua jornada profissional com o Tarô.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c6.jpg', 'tarot', array['tarot','profissao'], false, 6),
    ('roda-de-oxumare', 'Roda de Oxumaré', 'Vivência espiritual de força, transformação e movimento.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c7.jpg', 'imersao', array['imersao','orixas'], false, 7),
    ('imersao-povo-cigano', 'Imersão Povo Cigano', 'Danças, símbolos e práticas do povo cigano espiritual.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c8.jpg', 'cigano', array['cigano','imersao'], true, 8),
    ('roda-cigana', 'Roda Cigana', 'A estrela da sorte em vivências e estudos guiados.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c9.jpg', 'cigano', array['cigano','danca'], false, 9),
    ('circulo-despertar-da-mulher-sabia', 'Círculo Despertar da Mulher Sábia', 'Um círculo de estudo e cuidado para a força feminina.', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c10.jpg', 'feminino', array['imersao','feminino'], false, 10)
)
insert into public.courses (slug, title, description, image_url, hero_image_url, category, tags, featured, sort_order, instructor_avatar_url)
select slug, title, description, image_url, image_url, category, tags, featured, sort_order, 'http://www.tikura.com.br/wp-content/uploads/2026/02/allc.png'
from seed_courses
on conflict (slug) do update set
    title = excluded.title,
    description = excluded.description,
    image_url = excluded.image_url,
    hero_image_url = excluded.hero_image_url,
    category = excluded.category,
    tags = excluded.tags,
    featured = excluded.featured,
    sort_order = excluded.sort_order,
    instructor_avatar_url = excluded.instructor_avatar_url;

with c as (
    select id from public.courses where slug = 'imersao-das-juremas'
),
seed_modules(title, sort_order) as (
    values
    ('Módulo 1 - As Juremas Sagradas', 1),
    ('Módulo 2 - A Magia das Ervas', 2),
    ('Módulo 3 - Vivências e Incorporação', 3),
    ('Módulo 4 - Encerramento e Integração', 4)
)
insert into public.course_modules (course_id, title, sort_order)
select c.id, seed_modules.title, seed_modules.sort_order
from c, seed_modules
where not exists (
    select 1 from public.course_modules
    where course_modules.course_id = c.id
    and course_modules.sort_order = seed_modules.sort_order
);

with c as (
    select id from public.courses where slug = 'imersao-das-juremas'
),
m as (
    select id, sort_order from public.course_modules
    where course_id = (select id from c)
),
seed_lessons(module_order, title, description, duration_label, thumbnail_url, video_url, sort_order) as (
    values
    (1, 'Abertura e introdução às Juremas', 'Uma viagem ao universo das Juremas - origem, significado e a presença desse povo sagrado na espiritualidade brasileira.', '48 min', 'https://img.youtube.com/vi/TYrpODs6QvM/hqdefault.jpg', 'https://www.youtube.com/embed/TYrpODs6QvM?autoplay=1', 1),
    (1, 'O povo das Juremas e suas entidades', 'Conheça as principais entidades do povo das Juremas, suas forças, missões e como se manifestam no culto.', '54 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c1.jpg', '', 2),
    (1, 'Rituais de preparação e proteção', 'Aprenda os rituais fundamentais de preparação espiritual antes de adentrar o trabalho com as Juremas.', '62 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c1.jpg', '', 3),
    (2, 'Ervas sagradas das Juremas', 'As plantas aliadas do povo das Juremas - identificação, colheita, preparo e uso nos rituais.', '55 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/01-2.jpg', '', 1),
    (2, 'Defumações e banhos de ervas', 'Passo a passo para preparar defumações e banhos ritualísticos com as ervas do povo das Juremas.', '47 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/01-2.jpg', '', 2),
    (2, 'Altar de ervas e oferendas', 'Como montar e ativar um altar dedicado às Juremas com flores, ervas e elementos naturais.', '51 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/01-2.jpg', '', 3),
    (3, 'Preparando o corpo para a vivência', 'Exercícios, respiração e intenção: como se preparar física e espiritualmente para a incorporação.', '38 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c8.jpg', '', 1),
    (3, 'Cantos e pontos das Juremas', 'Os pontos cantados que evocam as entidades - origem, letra, melodia e como cantar com respeito.', '66 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c8.jpg', '', 2),
    (3, 'A vivência guiada - Imersão completa', 'A experiência central da imersão: uma vivência conduzida ao vivo por Vanessa Tikura com o povo das Juremas.', '90 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c8.jpg', '', 3),
    (4, 'Como integrar a experiência no cotidiano', 'Práticas simples para manter a conexão com as Juremas depois da imersão - no dia a dia, na casa e na espiritualidade.', '42 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c9.jpg', '', 1),
    (4, 'Cuidados pós-vivência e fechamento', 'Rituais de fechamento energético, limpeza e cuidados essenciais após a imersão.', '35 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c9.jpg', '', 2),
    (4, 'Encerramento - Uma palavra de Vanessa Tikura', 'Mensagem final de Vanessa Tikura com gratidão, bênção e os próximos passos na sua jornada espiritual.', '22 min', 'http://www.tikura.com.br/wp-content/uploads/2026/02/c9.jpg', '', 3)
)
insert into public.lessons (course_id, module_id, title, description, duration_label, thumbnail_url, video_url, sort_order)
select c.id, m.id, seed_lessons.title, seed_lessons.description, seed_lessons.duration_label, seed_lessons.thumbnail_url, seed_lessons.video_url, seed_lessons.sort_order
from c
join seed_lessons on true
join m on m.sort_order = seed_lessons.module_order
where not exists (
    select 1 from public.lessons
    where lessons.module_id = m.id
    and lessons.sort_order = seed_lessons.sort_order
);
