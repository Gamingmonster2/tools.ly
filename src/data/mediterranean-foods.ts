/**
 * Approximate energy and macronutrient values for foods that make up the
 * traditional Mediterranean pattern of eating.
 *
 * Values are rounded per common serving and are derived from the USDA FoodData
 * Central database (https://fdc.nal.usda.gov/). They are averages: brands,
 * cooking methods and portion sizes change the real number, so the tool treats
 * them as an estimate, never as a measurement.
 */

export type FoodGroup =
  | "fats"
  | "grains"
  | "legumes"
  | "protein"
  | "dairy"
  | "vegetables"
  | "fruit"
  | "nuts"
  | "drinks";

export interface Food {
  id: string;
  name: string;
  /** Human-readable portion, shown next to the quantity stepper. */
  portion: string;
  group: FoodGroup;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const foodGroups: { id: FoodGroup; label: string }[] = [
  { id: "fats", label: "Fats & oils" },
  { id: "grains", label: "Grains & starches" },
  { id: "legumes", label: "Legumes & pulses" },
  { id: "protein", label: "Fish, meat & eggs" },
  { id: "dairy", label: "Dairy" },
  { id: "vegetables", label: "Vegetables" },
  { id: "fruit", label: "Fruit" },
  { id: "nuts", label: "Nuts, seeds & sweets" },
  { id: "drinks", label: "Drinks" },
];

export const foods: Food[] = [
  { id: "olive-oil", name: "Olive oil", portion: "1 tbsp (13.5 g)", group: "fats", kcal: 119, protein: 0, carbs: 0, fat: 13.5 },
  { id: "olives", name: "Black olives", portion: "10 olives (35 g)", group: "fats", kcal: 58, protein: 0.3, carbs: 2.2, fat: 5.4 },
  { id: "tahini", name: "Tahini", portion: "1 tbsp (15 g)", group: "fats", kcal: 89, protein: 2.6, carbs: 3.2, fat: 8 },
  { id: "couscous", name: "Couscous, cooked", portion: "1 cup (157 g)", group: "grains", kcal: 176, protein: 6, carbs: 36, fat: 0.3 },
  { id: "ww-pasta", name: "Whole-wheat pasta, cooked", portion: "1 cup (140 g)", group: "grains", kcal: 174, protein: 7.5, carbs: 37, fat: 0.8 },
  { id: "rice", name: "Rice, cooked", portion: "1 cup (158 g)", group: "grains", kcal: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { id: "bread", name: "Wholegrain bread", portion: "1 slice (32 g)", group: "grains", kcal: 80, protein: 4, carbs: 14, fat: 1 },
  { id: "potato", name: "Potato, boiled", portion: "1 medium (150 g)", group: "grains", kcal: 130, protein: 2.9, carbs: 30, fat: 0.2 },
  { id: "pizza", name: "Pizza slice, medium", portion: "1 slice (107 g)", group: "grains", kcal: 285, protein: 12, carbs: 36, fat: 10 },
  { id: "lentils", name: "Lentils, cooked", portion: "1 cup (198 g)", group: "legumes", kcal: 230, protein: 18, carbs: 40, fat: 0.8 },
  { id: "chickpeas", name: "Chickpeas, cooked", portion: "1 cup (164 g)", group: "legumes", kcal: 269, protein: 14.5, carbs: 45, fat: 4.2 },
  { id: "white-beans", name: "White beans, cooked", portion: "1 cup (179 g)", group: "legumes", kcal: 249, protein: 17, carbs: 45, fat: 0.6 },
  { id: "hummus", name: "Hummus", portion: "2 tbsp (30 g)", group: "legumes", kcal: 70, protein: 2, carbs: 6, fat: 5 },
  { id: "grilled-fish", name: "Grilled white fish", portion: "100 g", group: "protein", kcal: 124, protein: 23, carbs: 0, fat: 3 },
  { id: "salmon", name: "Salmon, baked", portion: "100 g", group: "protein", kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: "sardines", name: "Sardines in olive oil", portion: "100 g drained", group: "protein", kcal: 208, protein: 25, carbs: 0, fat: 11 },
  { id: "chicken", name: "Chicken breast, grilled", portion: "100 g", group: "protein", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: "egg", name: "Egg, boiled", portion: "1 large (50 g)", group: "protein", kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: "feta", name: "Feta cheese", portion: "30 g", group: "dairy", kcal: 75, protein: 4, carbs: 1.2, fat: 6 },
  { id: "yogurt", name: "Greek yogurt, 2 %", portion: "170 g pot", group: "dairy", kcal: 146, protein: 20, carbs: 8, fat: 4 },
  { id: "milk", name: "Milk, semi-skimmed", portion: "1 cup (240 ml)", group: "dairy", kcal: 122, protein: 8, carbs: 12, fat: 4.8 },
  { id: "veg", name: "Mixed fresh vegetables", portion: "1 cup (150 g)", group: "vegetables", kcal: 50, protein: 2.5, carbs: 10, fat: 0.4 },
  { id: "tomato", name: "Tomato", portion: "1 medium (123 g)", group: "vegetables", kcal: 22, protein: 1.1, carbs: 4.8, fat: 0.2 },
  { id: "greens", name: "Leafy salad greens", portion: "1 cup (30 g)", group: "vegetables", kcal: 8, protein: 0.8, carbs: 1.5, fat: 0.1 },
  { id: "aubergine", name: "Aubergine, roasted", portion: "1 cup (100 g)", group: "vegetables", kcal: 35, protein: 0.8, carbs: 8.7, fat: 0.2 },
  { id: "peppers", name: "Bell peppers", portion: "1 medium (120 g)", group: "vegetables", kcal: 31, protein: 1.2, carbs: 7.2, fat: 0.4 },
  { id: "fruit", name: "Fruit (apple or orange)", portion: "1 medium (180 g)", group: "fruit", kcal: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: "watermelon", name: "Watermelon", portion: "1 cup (152 g)", group: "fruit", kcal: 46, protein: 0.9, carbs: 11.5, fat: 0.2 },
  { id: "grapes", name: "Grapes", portion: "1 cup (151 g)", group: "fruit", kcal: 104, protein: 1.1, carbs: 27, fat: 0.2 },
  { id: "figs", name: "Fresh figs", portion: "2 figs (100 g)", group: "fruit", kcal: 74, protein: 0.8, carbs: 19, fat: 0.3 },
  { id: "almonds", name: "Almonds", portion: "30 g (23 nuts)", group: "nuts", kcal: 170, protein: 6, carbs: 6, fat: 15 },
  { id: "walnuts", name: "Walnuts", portion: "30 g", group: "nuts", kcal: 196, protein: 4.6, carbs: 4.1, fat: 19.6 },
  { id: "dates", name: "Dates", portion: "2 dates (48 g)", group: "nuts", kcal: 133, protein: 1, carbs: 36, fat: 0.1 },
  { id: "honey", name: "Honey", portion: "1 tbsp (21 g)", group: "nuts", kcal: 64, protein: 0.1, carbs: 17, fat: 0 },
  { id: "baklava", name: "Baklava", portion: "1 piece (40 g)", group: "nuts", kcal: 165, protein: 2.5, carbs: 20, fat: 9 },
  { id: "wine", name: "Red wine", portion: "150 ml glass", group: "drinks", kcal: 125, protein: 0.1, carbs: 3.8, fat: 0 },
  { id: "coffee", name: "Coffee, black", portion: "1 cup (240 ml)", group: "drinks", kcal: 2, protein: 0.3, carbs: 0, fat: 0 },
  { id: "herbal-tea", name: "Herbal tea", portion: "1 cup (240 ml)", group: "drinks", kcal: 2, protein: 0, carbs: 0.5, fat: 0 },
];
