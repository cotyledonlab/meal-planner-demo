import { NextResponse } from 'next/server';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { createMealPlanPdfFilename, generateMealPlanPdf } from '~/server/export/mealPlanPdf';
import { normalizeMealPlanForExport } from '~/lib/export/plan';
import { createLogger } from '~/lib/logger';

const log = createLogger('export-plan-pdf');

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  let planId: string | undefined;
  try {
    const { id } = await params;
    planId = id;
    const ctx = await createTRPCContext({ headers: request.headers });
    if (!ctx.session?.user) {
      log.warn({ planId }, 'Unauthorized meal plan PDF export attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const trpc = createCaller(ctx);
    const plan = await trpc.plan.getById({ planId: id });
    const normalizedPlan = normalizeMealPlanForExport(plan);

    const buffer = await generateMealPlanPdf(normalizedPlan, {
      userName: ctx.session?.user?.name,
    });
    const filename = createMealPlanPdfFilename(normalizedPlan, ctx.session?.user?.name);
    const pdfBytes = new Uint8Array(buffer);

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    log.error({ err: error, planId }, 'Failed to generate meal plan PDF export');
    return NextResponse.json({ error: 'Unable to export meal plan as PDF' }, { status: 500 });
  }
}
