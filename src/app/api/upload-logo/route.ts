import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = 'logos';

const ensureBucket = async (supabaseAdmin: SupabaseClient) => {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    throw error;
  }

  const existingBucket = buckets?.find((bucket) => bucket.id === bucketName || bucket.name === bucketName);
  if (!existingBucket) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, { public: true });
    if (createError && !createError.message.toLowerCase().includes('already exists')) {
      throw createError;
    }
  } else if (!existingBucket.public) {
    const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, { public: true });
    if (updateError) {
      throw updateError;
    }
  }
};

export async function POST(req: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: 'Logo must be smaller than 2MB.' }, { status: 400 });
    }

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG or JPG images are allowed.' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    await ensureBucket(supabaseAdmin);

    const fileExt = file.name.split('.').pop() || 'png';
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      if (uploadError.message.toLowerCase().includes('bucket') && uploadError.message.toLowerCase().includes('not found')) {
        await ensureBucket(supabaseAdmin);
        const { error: retryError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filePath, Buffer.from(arrayBuffer), {
            contentType: file.type,
            upsert: false
          });

        if (retryError) {
          throw retryError;
        }
      } else {
        throw uploadError;
      }
    }

    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(filePath);
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    console.error('Logo upload failed', error);
    return NextResponse.json({ error: 'Logo upload failed. Please try again.' }, { status: 500 });
  }
}
