import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { fetchLogoAssets } from '@/lib/export/logo';
import { isExportAllowed } from '@/lib/export/permissions';
import { generateDocxBuffer } from '@/lib/export/docx/generateDocx';
import {
  buildStoragePath,
  computeContentHash,
  getCachedArtifact,
  getOrGenerateArtifact,
  putArtifact
} from '@/lib/export/cache/exportCache';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9._-]/gi, '_');
const DEFAULT_TEMPLATE_VERSION = 'minneapolis-v1';

export async function POST(req: Request) {
  let planId: string | undefined;
  let userId: string | undefined;

  try {
    const body = await req.json();
    planId = body?.planId as string | undefined;
    const lang = (body?.lang || 'en') as 'en' | 'es' | 'fr' | 'pt';

    if (!planId) {
      return NextResponse.json({ error: 'Missing planId' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {}
        }
      }
    );

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    userId = user?.id;

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const permission = isExportAllowed(plan);
    if (!permission.allowed) {
      return NextResponse.json({ error: permission.reason }, { status: 422 });
    }

    const isPaid =
      plan.payment_status === 'paid' ||
      plan.export_paid ||
      plan.review_paid;

    if (!isPaid) {
      return NextResponse.json({ error: 'Forbidden: Payment required' }, { status: 403 });
    }

    const { data: latestVersion } = await supabase
      .from('haccp_plan_versions')
      .select('version_number')
      .eq('plan_id', planId)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const planVersion = latestVersion?.version_number || 1;

    const baseFullPlan =
      plan.full_plan ||
      ({
        _original_inputs: plan.answers || {},
        hazard_analysis: plan.hazard_analysis || []
      } as any);

    const originalInputs = {
      ...(baseFullPlan?._original_inputs || {}),
      ...(plan.answers || {})
    };

    const fullPlan = {
      ...baseFullPlan,
      _original_inputs: originalInputs,
      hazard_analysis: Array.isArray(baseFullPlan?.hazard_analysis)
        ? baseFullPlan.hazard_analysis
        : plan.hazard_analysis || []
    };

    const productInputs = originalInputs.product || {};
    const { wordLogo } = await fetchLogoAssets(productInputs.logo_url);

    const templateVersion = String(
      originalInputs.template || fullPlan.validation?.document_style || DEFAULT_TEMPLATE_VERSION
    );

    const exportPayload = {
      businessName: plan.business_name,
      full_plan: fullPlan,
      planVersion,
      template: templateVersion,
      productName: productInputs.product_name || plan.product_name || 'HACCP Plan',
      productDescription: productInputs.product_category || plan.product_description || 'Generated Plan',
      mainIngredients: productInputs.key_ingredients || 'Standard',
      intendedUse: productInputs.intended_use || plan.intended_use || 'General',
      storageType: productInputs.storage_conditions || plan.storage_type || 'Standard',
      shelfLife: productInputs.shelf_life || 'As per label',
      logoUrl: productInputs.logo_url || null,
      isPaid
    };

    const contentHash = computeContentHash(exportPayload, templateVersion);
    const docxPath = buildStoragePath(planId, templateVersion, contentHash, 'plan.docx');

    const cachedDocx = await getCachedArtifact({ path: docxPath });
    if (cachedDocx.exists && cachedDocx.buffer) {
      const fileName = sanitizeFileName(body?.fileName || `${plan.business_name || 'HACCP_Plan'}.docx`);
      const responseBody = new Uint8Array(cachedDocx.buffer);
      return new NextResponse(responseBody, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });
    }

    const { buffer } = await getOrGenerateArtifact({
      getCached: async () => {
        const cached = await getCachedArtifact({ path: docxPath });
        return cached.buffer ?? null;
      },
      generate: async () =>
        generateDocxBuffer({ ...exportPayload, logoBuffer: wordLogo }, lang),
      store: async (buffer) =>
        putArtifact({
          path: docxPath,
          buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        })
    });

    const fileName = sanitizeFileName(body?.fileName || `${plan.business_name || 'HACCP_Plan'}.docx`);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error: any) {
    console.error('DOCX Export Error:', { planId, userId, error });
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
