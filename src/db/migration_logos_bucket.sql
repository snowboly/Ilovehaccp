-- Create a new private bucket for logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Allow public access to view logos (required for PDF/Word generation and UI preview)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'logos' );

-- Allow authenticated users to upload logos
create policy "Authenticated Upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'logos' );

-- Allow anonymous users to upload logos (for the builder flow before signup)
-- Note: In production, consider stricter limits or linking to session IDs.
create policy "Anon Upload"
  on storage.objects for insert
  to anon
  with check ( bucket_id = 'logos' );

-- Allow users to update/delete their own logos (optional, for later)
-- create policy "Owner Update" ...
