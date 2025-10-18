/**
 * Unit converter utilities for recipe measurements
 * Converts common cooking measurements to normalized units (g, ml, pcs)
 */

export type NormalizedUnit = 'g' | 'ml' | 'pcs';

interface ConversionRule {
  toUnit: NormalizedUnit;
  multiplier: number;
}

const conversionRules: Record<string, ConversionRule> = {
  // Weight conversions to grams
  'g': { toUnit: 'g', multiplier: 1 },
  'kg': { toUnit: 'g', multiplier: 1000 },
  'oz': { toUnit: 'g', multiplier: 28.35 },
  'lb': { toUnit: 'g', multiplier: 453.592 },
  
  // Volume conversions to milliliters
  'ml': { toUnit: 'ml', multiplier: 1 },
  'l': { toUnit: 'ml', multiplier: 1000 },
  'tsp': { toUnit: 'ml', multiplier: 5 },
  'tbsp': { toUnit: 'ml', multiplier: 15 },
  'cup': { toUnit: 'ml', multiplier: 240 },
  'fl oz': { toUnit: 'ml', multiplier: 29.5735 },
  
  // Pieces/count (no conversion)
  'pcs': { toUnit: 'pcs', multiplier: 1 },
  'pieces': { toUnit: 'pcs', multiplier: 1 },
  'count': { toUnit: 'pcs', multiplier: 1 },
  'whole': { toUnit: 'pcs', multiplier: 1 },
};

/**
 * Convert a quantity and unit to normalized units
 * @param quantity The amount
 * @param unit The unit to convert from
 * @returns Object with normalized quantity and unit
 */
export function convertToNormalizedUnit(
  quantity: number,
  unit: string
): { quantity: number; unit: NormalizedUnit } {
  const normalizedInputUnit = unit.toLowerCase().trim();
  const rule = conversionRules[normalizedInputUnit];
  
  if (!rule) {
    throw new Error(`Unknown unit: ${unit}. Valid units are: ${Object.keys(conversionRules).join(', ')}`);
  }
  
  return {
    quantity: quantity * rule.multiplier,
    unit: rule.toUnit,
  };
}

/**
 * Aggregate ingredients by combining quantities in the same unit
 * @param ingredients Array of ingredients with quantities and units
 * @returns Map of ingredient ID to aggregated quantity and unit
 */
export function aggregateIngredients(
  ingredients: Array<{ ingredientId: string; quantity: number; unit: string }>
): Map<string, { quantity: number; unit: NormalizedUnit }> {
  const aggregated = new Map<string, { quantity: number; unit: NormalizedUnit }>();
  
  for (const ing of ingredients) {
    const normalized = convertToNormalizedUnit(ing.quantity, ing.unit);
    const existing = aggregated.get(ing.ingredientId);
    
    if (existing) {
      if (existing.unit !== normalized.unit) {
        throw new Error(
          `Cannot aggregate ingredient ${ing.ingredientId} with different unit types: ${existing.unit} vs ${normalized.unit}`
        );
      }
      existing.quantity += normalized.quantity;
    } else {
      aggregated.set(ing.ingredientId, { ...normalized });
    }
  }
  
  return aggregated;
}

/**
 * Format a quantity and unit for display
 * @param quantity The amount
 * @param unit The unit
 * @returns Formatted string (e.g., "500g", "250ml", "2 pcs")
 */
export function formatQuantity(quantity: number, unit: NormalizedUnit): string {
  const rounded = Math.round(quantity * 10) / 10; // Round to 1 decimal place
  
  if (unit === 'pcs') {
    return `${Math.round(quantity)} pcs`;
  }
  
  // Convert large quantities to larger units for readability
  if (unit === 'g' && quantity >= 1000) {
    return `${(rounded / 1000).toFixed(1)}kg`;
  }
  
  if (unit === 'ml' && quantity >= 1000) {
    return `${(rounded / 1000).toFixed(1)}L`;
  }
  
  return `${rounded}${unit}`;
}
