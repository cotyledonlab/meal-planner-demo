export const CATEGORY_ORDER = [
  'vegetables',
  'fruits',
  'protein',
  'dairy',
  'grains',
  'pantry',
  'other',
] as const;

export const CATEGORY_EMOJI: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍎',
  protein: '🍗',
  dairy: '🥛',
  grains: '🌾',
  pantry: '🥫',
  other: '📦',
};

export const CATEGORY_LABELS: Record<string, string> = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  protein: 'Protein',
  dairy: 'Dairy',
  grains: 'Grains',
  pantry: 'Pantry',
  other: 'Other',
};
