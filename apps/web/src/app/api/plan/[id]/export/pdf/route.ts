import { NextResponse } from 'next/server';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { createMealPlanPdfFilename, generateMealPlanPdf } from '~/server/export/mealPlanPdf';
import { normalizeMealPlanForExport } from '~/lib/export/plan';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const ctx = await createTRPCContext({ headers: request.headers });
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
    console.error('Failed to generate meal plan PDF export', error);
    return NextResponse.json({ error: 'Unable to export meal plan as PDF' }, { status: 500 });
  }
}
