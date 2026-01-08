import { NextResponse } from 'next/server';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { normalizeMealPlanForExport } from '~/lib/export/plan';
import { DEFAULT_ESTIMATE_MODE, ESTIMATE_DISCLAIMER } from '~/lib/estimate';
import {
  createShoppingListCsvFilename,
  generateShoppingListCsv,
} from '~/server/export/shoppingListCsv';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const ctx = await createTRPCContext({ headers: request.headers });
    const trpc = createCaller(ctx);

    // Fetch plan for validation and to build filename metadata
    const plan = await trpc.plan.getById({ planId: id });
    const normalizedPlan = normalizeMealPlanForExport(plan);

    const shoppingList = await trpc.shoppingList.getForPlan({ planId: id });
    const estimateMode = DEFAULT_ESTIMATE_MODE;
    const estimateGeneratedAt = new Date();
    const budgetEstimate = shoppingList.budgetEstimate;
    const isEstimateLocked = budgetEstimate?.locked !== false;
    const estimateTotal = isEstimateLocked
      ? null
      : (budgetEstimate?.totals?.[estimateMode] ?? null);

    const csv = generateShoppingListCsv(
      shoppingList.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        checked: item.checked,
      })),
      {
        mode: estimateMode,
        total: estimateTotal,
        confidence: isEstimateLocked ? null : (budgetEstimate?.confidence ?? null),
        missingItemCount: isEstimateLocked ? null : (budgetEstimate?.missingItemCount ?? null),
        generatedAt: estimateGeneratedAt,
        disclaimer: ESTIMATE_DISCLAIMER,
        locked: isEstimateLocked,
      }
    );

    const filename = createShoppingListCsvFilename(normalizedPlan.startDate, normalizedPlan.days);

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to export shopping list CSV', error);
    return NextResponse.json({ error: 'Unable to export shopping list' }, { status: 500 });
  }
}
