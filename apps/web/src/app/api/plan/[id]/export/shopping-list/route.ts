import { NextResponse } from 'next/server';
import { createCaller } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { normalizeMealPlanForExport } from '~/lib/export/plan';
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
    const csv = generateShoppingListCsv(
      shoppingList.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        checked: item.checked,
      }))
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
