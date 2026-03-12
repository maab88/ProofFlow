drop policy if exists "job_media_select" on storage.objects;
drop policy if exists "job_media_insert" on storage.objects;
drop policy if exists "job_media_update" on storage.objects;
drop policy if exists "job_media_delete" on storage.objects;

create policy "job_media_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'job-media'
  and exists (
    select 1
    from public.users
    where users.auth_user_id = auth.uid()
      and users.business_id::text = split_part(storage.objects.name, '/', 1)
  )
);

create policy "job_media_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'job-media'
  and exists (
    select 1
    from public.users
    where users.auth_user_id = auth.uid()
      and users.business_id::text = split_part(storage.objects.name, '/', 1)
  )
);

create policy "job_media_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'job-media'
  and exists (
    select 1
    from public.users
    where users.auth_user_id = auth.uid()
      and users.business_id::text = split_part(storage.objects.name, '/', 1)
  )
)
with check (
  bucket_id = 'job-media'
  and exists (
    select 1
    from public.users
    where users.auth_user_id = auth.uid()
      and users.business_id::text = split_part(storage.objects.name, '/', 1)
  )
);

create policy "job_media_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'job-media'
  and exists (
    select 1
    from public.users
    where users.auth_user_id = auth.uid()
      and users.business_id::text = split_part(storage.objects.name, '/', 1)
  )
);
