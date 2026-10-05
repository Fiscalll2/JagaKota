create extension if not exists pgcrypto;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  kode text unique not null,
  kategori text not null,
  lat double precision not null,
  lon double precision not null,
  kota text not null default '',
  deskripsi text not null,
  nama text not null default '',
  foto_url text,
  dukung integer not null default 0,
  flag integer not null default 0,
  status text not null default 'pending',
  riwayat jsonb not null default '[]'::jsonb,
  verified_at timestamptz,
  resolved_at timestamptz,
  reject_reason text,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.reports add column if not exists telepon text not null default '';

create index if not exists reports_status_idx on public.reports (status);
create index if not exists reports_created_idx on public.reports (created_at desc);

alter table public.reports enable row level security;

drop policy if exists "warga tambah antre" on public.reports;
create policy "warga tambah antre" on public.reports
  for insert to anon with check (status = 'pending');

drop policy if exists "petugas demo ubah" on public.reports;
create policy "petugas demo ubah" on public.reports
  for update to anon using (status in ('verified', 'in_progress', 'resolved')) with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "publik lihat foto" on storage.objects;
create policy "publik lihat foto" on storage.objects
  for select to anon using (bucket_id = 'report-photos');

drop policy if exists "warga unggah foto" on storage.objects;
create policy "warga unggah foto" on storage.objects
  for insert to anon with check (bucket_id = 'report-photos');

create or replace function public.moderasi_laporan(p_kode text, p_status text, p_alasan text default null)
returns table(id uuid, kode text, kategori text, lat double precision, lon double precision,
  kota text, deskripsi text, nama text, foto_url text, dukung integer, flag integer,
  status text, riwayat jsonb, verified_at timestamptz, resolved_at timestamptz,
  reject_reason text, updated_at timestamptz, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_cur text;
  v_ok boolean := false;
begin
  if p_status not in ('pending', 'verified', 'in_progress', 'resolved', 'rejected') then
    raise exception 'status tidak dikenal';
  end if;
  select r.status into v_cur from public.reports r where r.kode = p_kode;
  if not found then
    raise exception 'laporan tidak ditemukan';
  end if;
  v_ok := case
    when v_cur = 'pending' and p_status in ('verified', 'rejected') then true
    when v_cur = 'verified' and p_status in ('in_progress', 'resolved', 'rejected') then true
    when v_cur = 'in_progress' and p_status in ('resolved', 'rejected') then true
    when v_cur = 'rejected' and p_status = 'pending' then true
    else false
  end;
  if not v_ok then
    raise exception 'transisi status tidak sah';
  end if;
  if p_status = 'rejected' and (p_alasan is null or char_length(trim(p_alasan)) < 3) then
    raise exception 'penolakan wajib alasan';
  end if;

  return query update public.reports as lap set
    status = p_status,
    riwayat = lap.riwayat || jsonb_build_object(
      'status', p_status,
      'at', now(),
      'oleh', 'petugas-rpc',
      'alasan', nullif(trim(coalesce(p_alasan, '')), '')
    ),
    verified_at = case when p_status = 'verified' then now() else lap.verified_at end,
    resolved_at = case when p_status = 'resolved' then now() else lap.resolved_at end,
    reject_reason = case
      when p_status = 'rejected' then trim(p_alasan)
      when p_status = 'pending' then null
      else lap.reject_reason
    end,
    updated_at = now()
  where lap.kode = p_kode
  returning lap.id, lap.kode, lap.kategori, lap.lat, lap.lon,
    lap.kota, lap.deskripsi, lap.nama, lap.foto_url, lap.dukung, lap.flag,
    lap.status, lap.riwayat, lap.verified_at, lap.resolved_at,
    lap.reject_reason, lap.updated_at, lap.created_at;
end;
$fn$;

revoke all on function public.moderasi_laporan(text, text, text) from public;
grant execute on function public.moderasi_laporan(text, text, text) to anon;

create or replace function public.hapus_laporan(p_kode text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if p_kode is null or char_length(trim(p_kode)) < 3 then
    raise exception 'kode tidak valid';
  end if;
  delete from public.reports as lap where lap.kode = trim(p_kode);
end;
$fn$;

revoke all on function public.hapus_laporan(text) from public;
grant execute on function public.hapus_laporan(text) to anon;

create or replace view public.reports_publik as
  select id, kode, kategori, lat, lon, kota, deskripsi, nama, foto_url,
         dukung, flag, status, riwayat, verified_at, resolved_at,
         reject_reason, updated_at, created_at
  from public.reports
  where status in ('verified', 'in_progress', 'resolved');
grant select on public.reports_publik to anon;

create or replace view public.reports_antrean as
  select id, kode, kategori, lat, lon, kota, deskripsi, nama, telepon, foto_url,
         dukung, flag, status, riwayat, verified_at, resolved_at,
         reject_reason, updated_at, created_at
  from public.reports
  where status = 'pending';
grant select on public.reports_antrean to anon;

drop policy if exists "anon broadcast kirim" on realtime.messages;
create policy "anon broadcast kirim" on realtime.messages
  for insert to anon with check (true);
drop policy if exists "anon broadcast terima" on realtime.messages;
create policy "anon broadcast terima" on realtime.messages
  for select to anon using (true);
