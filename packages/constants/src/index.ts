// Shared constants for the meal planner application

export const APP_NAME = "MealMind AI";
export const APP_VERSION = "0.1.0";

// Brand Identity
export const BRAND = {
  name: "MealMind AI",
  tagline: "Your family, fed and happy",
  personality: "warm, empowering, and genuinely helpful",
  voice: {
    friendly: true,
    sophisticated: false,
    playful: true,
    authoritative: false,
  },
  irishIdentity: true,
} as const;

// Database constants
export const DEFAULT_DB_POOL_SIZE = 10;
export const DB_CONNECTION_TIMEOUT = 5000;

// Placeholder export
export const CONSTANTS_VERSION = "0.1.0";

export const VALID_MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

// Titles containing any of these keywords should almost never be classified as breakfast
export const SUSPICIOUS_BREAKFAST_KEYWORDS = [
  "curry",
  "stew",
  "roast",
  "pasta",
  "bolognese",
  "chili",
] as const;

// Pricing and tier information
export const PRICING = {
  FREE: {
    name: "Free Tier",
    price: "€0",
    description: "Start your journey to stress-free family meals",
    features: [
      "Weekly meal-prep recipes your family will love",
      "Automatic shopping list – never forget ingredients",
      "Basic dietary preferences",
      "Friendly email support",
    ],
  },
  PREMIUM: {
    name: "Premium",
    price: "€4.99",
    period: "/month",
    annualPrice: "€49",
    annualPeriod: "/year",
    annualSavings: "18%",
    annualMonthlyEquivalent: "€4.08",
    dailyCost: "€0.17",
    description: "More family time, less kitchen stress",
    valueProposition: "Less than the price of a coffee",
    socialProof: "Join 1,000+ families saving time & money",
    roi: "Avg. user saves 3 hours and €20/week",
    features: [
      "Everything in Free",
      "Find the best value supermarkets – save €20+ weekly",
      "Advanced customisation for picky eaters",
      "Multiple meal plans for busy weeks",
      "Priority support when you need us",
      "Export and share plans with family",
    ],
  },
  VALUE_COMPARISON: {
    mealKitServices: "€50-80/week",
    grocerySavings: "Save €20/week on groceries",
  },
  TRUST_SIGNALS: {
    moneyBackGuarantee: "30-day money-back guarantee",
    cancelAnytime: "Cancel anytime, no questions asked",
    limitedBetaPricing: "Limited beta pricing",
  },
} as const;
