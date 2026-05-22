alter table public.reservations
  add column if not exists created_by_name text,
  add column if not exists created_by_email text;

create index if not exists reservations_user_id_idx
  on public.reservations (user_id);

drop policy if exists "Users can cancel their own reservations" on public.reservations;

create policy "Users can cancel their own reservations"
  on public.reservations
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
