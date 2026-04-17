-- ============================================================
-- supabase/schema.sql
-- Cole este SQL no Supabase SQL Editor para criar todas as tabelas
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Propriedades ─────────────────────────────────────────────
create table if not exists properties (
  id                    uuid primary key default uuid_generate_v4(),
  name                  text not null,
  address               text not null,
  airbnb_listing_id     text unique,
  photo_url             text,
  base_price_per_night  numeric(10,2) not null default 0,
  created_at            timestamptz default now()
);

-- ── Hóspedes ─────────────────────────────────────────────────
create table if not exists guests (
  id                uuid primary key default uuid_generate_v4(),
  airbnb_guest_id   text unique,
  name              text not null,
  email             text,
  phone             text,
  photo_url         text,
  total_stays       int  default 0,
  total_nights      int  default 0,
  avg_rating        numeric(3,2),
  is_verified       boolean default false,
  created_at        timestamptz default now()
);

-- ── Reservas ─────────────────────────────────────────────────
create table if not exists reservations (
  id              uuid primary key default uuid_generate_v4(),
  airbnb_id       text unique not null,
  guest_id        uuid references guests(id),
  property_id     uuid references properties(id),
  check_in        date not null,
  check_out       date not null,
  nights          int  not null,
  guests_count    int  default 1,
  total_amount    numeric(10,2) not null default 0,
  host_payout     numeric(10,2) not null default 0,
  airbnb_fee      numeric(10,2) not null default 0,
  cleaning_fee    numeric(10,2) default 0,
  status          text not null default 'confirmed'
                  check (status in ('confirmed','pending','cancelled','completed','checking_in','checking_out')),
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── Despesas ─────────────────────────────────────────────────
create table if not exists expenses (
  id              uuid primary key default uuid_generate_v4(),
  property_id     uuid references properties(id),
  reservation_id  uuid references reservations(id),
  category        text not null
                  check (category in ('cleaning','maintenance','supplies','airbnb_fee','utilities','taxes','other')),
  description     text not null,
  amount          numeric(10,2) not null,
  date            date not null,
  created_at      timestamptz default now()
);

-- ── Análises IA (cache) ───────────────────────────────────────
create table if not exists ai_analyses (
  id           uuid primary key default uuid_generate_v4(),
  property_id  uuid references properties(id),
  month        text not null,   -- "2026-04"
  insight      text,
  raw_response jsonb,
  created_at   timestamptz default now()
);

-- ── Updated_at trigger ────────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_reservations_updated_at
  before update on reservations
  for each row execute function update_updated_at();

-- ── Views úteis ───────────────────────────────────────────────

-- Receita mensal
create or replace view monthly_revenue as
  select
    to_char(check_in, 'YYYY-MM')            as month,
    sum(host_payout)                         as revenue,
    count(*)                                 as reservations,
    round(avg(nights), 1)                    as avg_nights
  from reservations
  where status != 'cancelled'
  group by 1
  order by 1;

-- Resumo por hóspede
create or replace view guest_summary as
  select
    g.id, g.name, g.email, g.photo_url, g.is_verified,
    count(r.id)         as total_stays,
    coalesce(sum(r.nights), 0) as total_nights,
    max(r.check_in)     as last_checkin
  from guests g
  left join reservations r on r.guest_id = g.id and r.status != 'cancelled'
  group by g.id;

-- ── Dados iniciais de exemplo ─────────────────────────────────
insert into properties (name, address, base_price_per_night)
values ('Apt Vista Mar', 'Rua das Flores, 42 - Florianópolis, SC', 290.00)
on conflict do nothing;
