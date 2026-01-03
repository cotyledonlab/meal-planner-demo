import { Document, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import {
  buildPlanDateMetadata,
  createPlanFilename,
  getInstructionsFromRecipe,
  getMealTypeLabel,
  groupPlanByDay,
  hasDietTagInExport,
} from '~/lib/export/plan';
import type { ExportMealPlan } from '~/lib/export/plan';
import { formatIngredientForExport } from '~/lib/export/plan';

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#1f2937',
    lineHeight: 1.4,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    marginBottom: 24,
    paddingBottom: 12,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#065f46',
  },
  planMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#4b5563',
  },
  daySection: {
    marginBottom: 24,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#047857',
    marginBottom: 12,
  },
  recipeCard: {
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1f2937',
  },
  recipeBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#dcfce7',
    color: '#047857',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    fontSize: 10,
    color: '#4b5563',
  },
  sectionHeading: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: 600,
    color: '#111827',
  },
  bulletList: {
    marginTop: 4,
    marginLeft: 12,
  },
  bulletItem: {
    fontSize: 11,
    marginBottom: 3,
  },
  instructionsList: {
    marginTop: 4,
    marginLeft: 14,
  },
  instructionStep: {
    fontSize: 11,
    marginBottom: 4,
  },
});

interface MealPlanPdfDocumentProps {
  plan: ExportMealPlan;
  userName?: string | null;
}

function MealPlanPdfDocument({ plan, userName }: MealPlanPdfDocumentProps) {
  const days = groupPlanByDay(plan);
  const { label } = buildPlanDateMetadata(plan.startDate, plan.days);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.planTitle}>Weekly Meal Plan</Text>
          <Text style={styles.planMeta}>
            {plan.days}-day plan • {label}
            {userName ? ` • Prepared for ${userName}` : ''}
          </Text>
        </View>

        {days.map((day, index) => (
          <View key={day.dayIndex} style={styles.daySection} break={index !== 0}>
            <Text style={styles.dayTitle}>
              Day {day.dayIndex + 1} ·{' '}
              {day.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>

            {day.items.map((item) => {
              const recipe = item.recipe;
              const ingredientLines = recipe.ingredients.map((ingredient) =>
                formatIngredientForExport(ingredient.quantity, ingredient.unit, ingredient.name)
              );
              const instructionSteps = getInstructionsFromRecipe(recipe, 6);
              const isVegetarian = hasDietTagInExport(recipe, 'vegetarian');
              const isDairyFree = hasDietTagInExport(recipe, 'dairy-free');

              return (
                <View key={item.id} style={styles.recipeCard}>
                  <View style={styles.recipeHeader}>
                    <Text style={styles.recipeTitle}>{recipe.title}</Text>
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>
                      {getMealTypeLabel(item.mealType)} • Serves {item.servings}
                    </Text>
                  </View>

                  <View style={styles.recipeBadges}>
                    <Text style={styles.badge}>{recipe.totalTimeMinutes} min</Text>
                    <Text style={styles.badge}>{recipe.calories} kcal</Text>
                    {isVegetarian && <Text style={styles.badge}>Vegetarian</Text>}
                    {isDairyFree && <Text style={styles.badge}>Dairy-Free</Text>}
                  </View>

                  <View style={styles.sectionHeading}>
                    <Text>Ingredients</Text>
                  </View>
                  <View style={styles.bulletList}>
                    {ingredientLines.map((line, idx) => (
                      <Text key={`${item.id}-ing-${idx}`} style={styles.bulletItem}>
                        • {line}
                      </Text>
                    ))}
                  </View>

                  {instructionSteps.length > 0 && (
                    <>
                      <View style={styles.sectionHeading}>
                        <Text>Steps</Text>
                      </View>
                      <View style={styles.instructionsList}>
                        {instructionSteps.map((step, idx) => (
                          <Text key={`${item.id}-step-${idx}`} style={styles.instructionStep}>
                            {idx + 1}. {step}
                          </Text>
                        ))}
                      </View>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function generateMealPlanPdf(
  plan: ExportMealPlan,
  options: { userName?: string | null } = {}
): Promise<Buffer> {
  const document = <MealPlanPdfDocument plan={plan} userName={options.userName} />;
  return await renderToBuffer(document);
}

export function createMealPlanPdfFilename(plan: ExportMealPlan, userName?: string | null): string {
  const prefix = userName ? `${userName.split(' ')[0] ?? 'plan'}-meal-plan` : 'meal-plan';
  return createPlanFilename(prefix.toLowerCase(), plan.startDate, plan.days, 'pdf');
}
