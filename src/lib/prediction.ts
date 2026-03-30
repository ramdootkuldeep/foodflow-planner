export type MealType = 'Breakfast' | 'Lunch' | 'Evening Snacks' | 'Dinner';

export interface DishInfo {
  name: string;
  meals: MealType[];
}

// All dishes from JNU Hostel Mess Menu (March–April 2026)
export const ALL_DISHES: DishInfo[] = [
  // Breakfast
  { name: 'Indori Poha', meals: ['Breakfast'] },
  { name: 'Plain Idli', meals: ['Breakfast'] },
  { name: 'Vada', meals: ['Breakfast'] },
  { name: 'Sambhar', meals: ['Breakfast', 'Dinner'] },
  { name: 'Masala Paratha', meals: ['Breakfast'] },
  { name: 'Aloo Paratha', meals: ['Breakfast'] },
  { name: 'Dalia', meals: ['Breakfast'] },
  { name: 'Khaman', meals: ['Breakfast'] },
  { name: 'Besan Chilla', meals: ['Breakfast'] },
  { name: 'Masala Dosa', meals: ['Breakfast'] },
  { name: 'Poha', meals: ['Breakfast'] },
  { name: 'Bread & Butter', meals: ['Breakfast'] },
  { name: 'Omelette', meals: ['Breakfast'] },
  { name: 'Boiled Egg', meals: ['Breakfast'] },
  { name: 'Cornflakes', meals: ['Breakfast'] },
  { name: 'Milk / Tea', meals: ['Breakfast', 'Evening Snacks'] },
  { name: 'Banana', meals: ['Breakfast'] },
  { name: 'Banana Shake', meals: ['Breakfast'] },

  // Lunch
  { name: 'Louki Kofta', meals: ['Lunch'] },
  { name: 'Dal Palak', meals: ['Lunch'] },
  { name: 'Jeera Rice', meals: ['Lunch', 'Dinner'] },
  { name: 'Mix Veg', meals: ['Lunch', 'Dinner'] },
  { name: 'Raita', meals: ['Lunch'] },
  { name: 'Chapati', meals: ['Lunch', 'Dinner'] },
  { name: 'Aloo Cabbage', meals: ['Lunch'] },
  { name: 'Rajma Masala', meals: ['Lunch'] },
  { name: 'Lauki Raita', meals: ['Lunch'] },
  { name: 'Chole', meals: ['Lunch'] },
  { name: 'Rice', meals: ['Lunch', 'Dinner'] },
  { name: 'Besan Ghatta', meals: ['Lunch'] },
  { name: 'Aloo Matar', meals: ['Lunch'] },
  { name: 'Panchratan Dal', meals: ['Lunch'] },
  { name: 'Cucumber Raita', meals: ['Lunch'] },
  { name: 'Jeera Aloo', meals: ['Lunch'] },
  { name: 'Dal Tarka', meals: ['Lunch', 'Dinner'] },
  { name: 'Boondi Raita', meals: ['Lunch'] },
  { name: 'Aloo Capsicum Dry', meals: ['Lunch'] },
  { name: 'Kadhi Pakoda', meals: ['Lunch', 'Dinner'] },
  { name: 'Chole Bhature', meals: ['Lunch'] },
  { name: 'Lemon Rice', meals: ['Lunch'] },
  { name: 'Rasam', meals: ['Lunch'] },
  { name: 'Salad', meals: ['Lunch', 'Dinner'] },

  // Evening Snacks
  { name: 'Samosa', meals: ['Evening Snacks'] },
  { name: 'Veg Chowmein', meals: ['Evening Snacks'] },
  { name: 'Vada Pao', meals: ['Evening Snacks'] },
  { name: 'Pyaz Kachori', meals: ['Evening Snacks'] },
  { name: 'Dal Kachori', meals: ['Evening Snacks'] },
  { name: 'Red Sauce Pasta', meals: ['Evening Snacks'] },
  { name: 'Momos (6 pcs)', meals: ['Evening Snacks'] },
  { name: 'Aloo Bonda', meals: ['Evening Snacks'] },

  // Dinner
  { name: 'Bhindi Masala', meals: ['Dinner'] },
  { name: 'Lehsun Ki Chutney', meals: ['Dinner'] },
  { name: 'Dahiwale Aloo', meals: ['Dinner'] },
  { name: 'Kala Chana', meals: ['Dinner'] },
  { name: 'Poori', meals: ['Dinner'] },
  { name: 'Kheer', meals: ['Dinner'] },
  { name: 'Savaiyan', meals: ['Dinner'] },
  { name: 'Mix Veg Dry', meals: ['Dinner'] },
  { name: 'Kalli Dal', meals: ['Dinner'] },
  { name: 'Dahi Fry', meals: ['Dinner'] },
  { name: 'Veg Dum Biryani', meals: ['Dinner'] },
  { name: 'Aloo Baingan Dry', meals: ['Dinner'] },
  { name: 'Dal Maharani', meals: ['Dinner'] },
  { name: 'Fruit Custard', meals: ['Dinner'] },
  { name: 'Kadhi Paneer', meals: ['Dinner'] },
  { name: 'Shahi Paneer', meals: ['Dinner'] },
  { name: 'Egg Curry', meals: ['Dinner'] },
  { name: 'Dal Fry', meals: ['Dinner'] },
  { name: 'Tawa Sabji', meals: ['Dinner'] },
  { name: 'Chicken Curry', meals: ['Dinner'] },
  { name: 'Jeera Pulao', meals: ['Dinner'] },
  { name: 'Moong Ka Halwa', meals: ['Dinner'] },
  { name: 'Dal Batti Churma', meals: ['Dinner'] },
];

export function getDishesForMeal(
  meal: MealType,
  customDishes: DishInfo[] = [],
  removedDishes: string[] = [],
): string[] {
  const all = [...ALL_DISHES, ...customDishes];
  return all
    .filter(d => d.meals.includes(meal) && !removedDishes.includes(d.name))
    .map(d => d.name);
}

// Register custom dish materials at runtime
const CUSTOM_MATERIALS: Record<string, RawMaterial[]> = {};
export function registerDishMaterials(dishName: string, mats: { name: string; perPerson: number; unit: string }[]) {
  // Also register units
  for (const m of mats) {
    MATERIAL_UNITS[m.name] = m.unit;
  }
  CUSTOM_MATERIALS[dishName] = mats.map(m => ({ name: m.name, perPerson: m.perPerson, demandFactor: 1.0 }));
}
export function unregisterDishMaterials(dishName: string) {
  delete CUSTOM_MATERIALS[dishName];
}
function getMaterials(dish: string): RawMaterial[] | undefined {
  return DISH_MATERIALS[dish] || CUSTOM_MATERIALS[dish];
}

// Attendance adjustment
const ATTENDANCE: Record<MealType, number> = {
  Breakfast: 0.70,
  Lunch: 0.90,
  'Evening Snacks': 0.60,
  Dinner: 1.00,
};

// ── Real-world consumption pattern factors ──

// Non-veg dishes: only ~70% students eat non-veg
const NON_VEG_DISHES = new Set([
  'Omelette', 'Boiled Egg', 'Egg Curry', 'Chicken Curry',
]);
export const NON_VEG_EATER_RATIO = 0.70;

// Preference-based uptake: not every student takes every side dish.
// e.g., some prefer rice over roti, some skip dal, etc.
export const PREFERENCE_FACTOR: Record<string, number> = {
  // Staples — students split between rice & roti
  'Chapati': 0.65,          // ~65% prefer roti
  'Rice': 0.55,             // ~55% take plain rice
  'Jeera Rice': 0.50,       // slightly fewer take flavored rice
  'Poori': 0.60,

  // Dals — not everyone takes dal
  'Dal Palak': 0.70,
  'Dal Tarka': 0.75,
  'Panchratan Dal': 0.70,
  'Dal Fry': 0.75,
  'Kalli Dal': 0.65,
  'Dal Maharani': 0.70,

  // Raita — optional side
  'Raita': 0.50,
  'Lauki Raita': 0.45,
  'Cucumber Raita': 0.50,
  'Boondi Raita': 0.50,

  // Desserts — popular but not universal
  'Kheer': 0.75,
  'Savaiyan': 0.70,
  'Fruit Custard': 0.80,
  'Moong Ka Halwa': 0.70,

  // Beverages & light items
  'Milk / Tea': 0.80,
  'Cornflakes': 0.30,       // very few take cornflakes
  'Bread & Butter': 0.40,
  'Banana': 0.50,

  // Accompaniments
  'Salad': 0.45,
  'Lehsun Ki Chutney': 0.40,
  'Sambhar': 0.80,
  'Rasam': 0.60,
};

// Side/accompaniment dishes — served broadly (with preference factor)
// Everything else is a "main" dish — students split across them
const SIDE_DISHES = new Set([
  'Milk / Tea', 'Sambhar', 'Chapati', 'Rice', 'Jeera Rice',
  'Salad', 'Raita', 'Lauki Raita', 'Cucumber Raita', 'Boondi Raita',
  'Lehsun Ki Chutney', 'Bread & Butter', 'Cornflakes', 'Banana',
  'Dal Palak', 'Dal Tarka', 'Panchratan Dal', 'Dal Fry', 'Kalli Dal', 'Dal Maharani',
  'Kheer', 'Savaiyan', 'Fruit Custard', 'Moong Ka Halwa',
  'Rasam', 'Poori',
]);

interface RawMaterial {
  name: string;
  perPerson: number;
  demandFactor: number;
}

const DISH_MATERIALS: Record<string, RawMaterial[]> = {
  // === BREAKFAST ===
  'Indori Poha': [{ name: 'Poha (Flattened Rice)', perPerson: 0.12, demandFactor: 1.0 }],
  'Poha': [{ name: 'Poha (Flattened Rice)', perPerson: 0.12, demandFactor: 1.0 }],
  'Plain Idli': [{ name: 'Idli Batter (Rice + Urad Dal)', perPerson: 0.20, demandFactor: 1.0 }],
  'Vada': [{ name: 'Urad Dal', perPerson: 0.08, demandFactor: 1.0 }],
  'Masala Paratha': [{ name: 'Atta (Wheat Flour)', perPerson: 0.15, demandFactor: 1.0 }, { name: 'Potato', perPerson: 0.08, demandFactor: 1.0 }],
  'Aloo Paratha': [{ name: 'Atta (Wheat Flour)', perPerson: 0.15, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.10, demandFactor: 1.0 }],
  'Dalia': [{ name: 'Broken Wheat (Dalia)', perPerson: 0.10, demandFactor: 0.8 }],
  'Khaman': [{ name: 'Besan (Gram Flour)', perPerson: 0.10, demandFactor: 1.0 }],
  'Besan Chilla': [{ name: 'Besan (Gram Flour)', perPerson: 0.10, demandFactor: 1.0 }],
  'Masala Dosa': [{ name: 'Dosa Batter (Rice + Urad Dal)', perPerson: 0.18, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.08, demandFactor: 1.0 }],
  'Bread & Butter': [{ name: 'Bread (Slices)', perPerson: 0.08, demandFactor: 0.8 }, { name: 'Butter', perPerson: 0.02, demandFactor: 0.8 }],
  'Omelette': [{ name: 'Eggs', perPerson: 2, demandFactor: 1.2 }, { name: 'Onion', perPerson: 0.02, demandFactor: 1.0 }],
  'Boiled Egg': [{ name: 'Eggs', perPerson: 2, demandFactor: 1.0 }],
  'Cornflakes': [{ name: 'Cornflakes', perPerson: 0.05, demandFactor: 0.8 }],
  'Milk / Tea': [{ name: 'Milk', perPerson: 0.15, demandFactor: 1.0 }, { name: 'Tea Leaves / Sugar', perPerson: 0.02, demandFactor: 1.0 }],
  'Banana': [{ name: 'Banana', perPerson: 0.12, demandFactor: 1.0 }],
  'Banana Shake': [{ name: 'Banana', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Milk', perPerson: 0.15, demandFactor: 1.0 }],
  'Sambhar': [{ name: 'Toor Dal', perPerson: 0.06, demandFactor: 1.0 }, { name: 'Mixed Vegetables', perPerson: 0.05, demandFactor: 1.0 }],

  // === LUNCH ===
  'Louki Kofta': [{ name: 'Lauki (Bottle Gourd)', perPerson: 0.12, demandFactor: 0.8 }, { name: 'Besan (Gram Flour)', perPerson: 0.03, demandFactor: 1.0 }],
  'Dal Palak': [{ name: 'Moong Dal', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Spinach', perPerson: 0.05, demandFactor: 1.0 }],
  'Jeera Rice': [{ name: 'Rice', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Cumin Seeds', perPerson: 0.005, demandFactor: 1.0 }],
  'Mix Veg': [{ name: 'Mixed Vegetables', perPerson: 0.15, demandFactor: 1.0 }],
  'Raita': [{ name: 'Curd', perPerson: 0.10, demandFactor: 1.0 }],
  'Chapati': [{ name: 'Atta (Wheat Flour)', perPerson: 0.22, demandFactor: 1.0 }],
  'Aloo Cabbage': [{ name: 'Potato', perPerson: 0.08, demandFactor: 0.8 }, { name: 'Cabbage', perPerson: 0.08, demandFactor: 0.8 }],
  'Rajma Masala': [{ name: 'Rajma', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Onion', perPerson: 0.03, demandFactor: 1.0 }, { name: 'Tomato', perPerson: 0.03, demandFactor: 1.0 }],
  'Lauki Raita': [{ name: 'Curd', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Lauki (Bottle Gourd)', perPerson: 0.04, demandFactor: 0.8 }],
  'Chole': [{ name: 'Chana (Chickpeas)', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Onion', perPerson: 0.03, demandFactor: 1.0 }],
  'Rice': [{ name: 'Rice', perPerson: 0.15, demandFactor: 1.0 }],
  'Besan Ghatta': [{ name: 'Besan (Gram Flour)', perPerson: 0.08, demandFactor: 0.8 }, { name: 'Curd', perPerson: 0.05, demandFactor: 1.0 }],
  'Aloo Matar': [{ name: 'Potato', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Green Peas', perPerson: 0.05, demandFactor: 1.0 }],
  'Panchratan Dal': [{ name: 'Mixed Dal (5 types)', perPerson: 0.10, demandFactor: 1.0 }],
  'Cucumber Raita': [{ name: 'Curd', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Cucumber', perPerson: 0.03, demandFactor: 1.0 }],
  'Jeera Aloo': [{ name: 'Potato', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Cumin Seeds', perPerson: 0.005, demandFactor: 1.0 }],
  'Dal Tarka': [{ name: 'Toor Dal', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Ghee', perPerson: 0.01, demandFactor: 1.0 }],
  'Boondi Raita': [{ name: 'Curd', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.02, demandFactor: 1.0 }],
  'Aloo Capsicum Dry': [{ name: 'Potato', perPerson: 0.10, demandFactor: 0.8 }, { name: 'Capsicum', perPerson: 0.05, demandFactor: 0.8 }],
  'Kadhi Pakoda': [{ name: 'Besan (Gram Flour)', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Curd', perPerson: 0.12, demandFactor: 1.0 }],
  'Chole Bhature': [{ name: 'Chana (Chickpeas)', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Maida (Refined Flour)', perPerson: 0.12, demandFactor: 1.2 }],
  'Lemon Rice': [{ name: 'Rice', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Lemon', perPerson: 0.02, demandFactor: 1.0 }],
  'Rasam': [{ name: 'Toor Dal', perPerson: 0.04, demandFactor: 0.8 }, { name: 'Tomato', perPerson: 0.04, demandFactor: 1.0 }],
  'Salad': [{ name: 'Mixed Salad Vegetables', perPerson: 0.08, demandFactor: 0.8 }],

  // === EVENING SNACKS ===
  'Samosa': [{ name: 'Maida (Refined Flour)', perPerson: 0.06, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.06, demandFactor: 1.2 }, { name: 'Oil (for frying)', perPerson: 0.03, demandFactor: 1.0 }],
  'Veg Chowmein': [{ name: 'Noodles', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Mixed Vegetables', perPerson: 0.06, demandFactor: 1.0 }],
  'Vada Pao': [{ name: 'Pao Bread', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.03, demandFactor: 1.0 }],
  'Pyaz Kachori': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Onion', perPerson: 0.06, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.04, demandFactor: 1.0 }],
  'Dal Kachori': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Moong Dal', perPerson: 0.05, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.04, demandFactor: 1.0 }],
  'Red Sauce Pasta': [{ name: 'Pasta', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Tomato', perPerson: 0.06, demandFactor: 1.0 }],
  'Momos (6 pcs)': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Mixed Vegetables', perPerson: 0.08, demandFactor: 1.0 }],
  'Aloo Bonda': [{ name: 'Potato', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.03, demandFactor: 1.0 }],

  // === DINNER ===
  'Bhindi Masala': [{ name: 'Bhindi (Okra)', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Onion', perPerson: 0.03, demandFactor: 1.0 }],
  'Lehsun Ki Chutney': [{ name: 'Garlic', perPerson: 0.02, demandFactor: 0.8 }],
  'Dahiwale Aloo': [{ name: 'Potato', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Curd', perPerson: 0.08, demandFactor: 1.0 }],
  'Kala Chana': [{ name: 'Kala Chana (Black Chickpeas)', perPerson: 0.10, demandFactor: 1.0 }],
  'Poori': [{ name: 'Atta (Wheat Flour)', perPerson: 0.15, demandFactor: 1.2 }, { name: 'Oil (for frying)', perPerson: 0.04, demandFactor: 1.0 }],
  'Kheer': [{ name: 'Milk', perPerson: 0.20, demandFactor: 1.2 }, { name: 'Rice', perPerson: 0.03, demandFactor: 1.0 }, { name: 'Sugar', perPerson: 0.04, demandFactor: 1.0 }],
  'Savaiyan': [{ name: 'Vermicelli (Seviyan)', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Milk', perPerson: 0.15, demandFactor: 1.0 }, { name: 'Sugar', perPerson: 0.03, demandFactor: 1.0 }],
  'Mix Veg Dry': [{ name: 'Mixed Vegetables', perPerson: 0.15, demandFactor: 0.8 }],
  'Kalli Dal': [{ name: 'Urad Dal (Whole)', perPerson: 0.08, demandFactor: 1.0 }],
  'Dahi Fry': [{ name: 'Curd', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.03, demandFactor: 1.0 }],
  'Veg Dum Biryani': [{ name: 'Basmati Rice', perPerson: 0.15, demandFactor: 1.2 }, { name: 'Mixed Vegetables', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Ghee', perPerson: 0.02, demandFactor: 1.0 }],
  'Aloo Baingan Dry': [{ name: 'Potato', perPerson: 0.08, demandFactor: 0.8 }, { name: 'Brinjal (Eggplant)', perPerson: 0.08, demandFactor: 0.8 }],
  'Dal Maharani': [{ name: 'Urad Dal (Whole)', perPerson: 0.06, demandFactor: 1.0 }, { name: 'Rajma', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Cream / Butter', perPerson: 0.02, demandFactor: 1.0 }],
  'Fruit Custard': [{ name: 'Milk', perPerson: 0.15, demandFactor: 1.2 }, { name: 'Custard Powder', perPerson: 0.02, demandFactor: 1.0 }, { name: 'Mixed Fruits', perPerson: 0.08, demandFactor: 1.0 }],
  'Kadhi Paneer': [{ name: 'Besan (Gram Flour)', perPerson: 0.06, demandFactor: 1.2 }, { name: 'Curd', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Paneer', perPerson: 0.08, demandFactor: 1.2 }],
  'Shahi Paneer': [{ name: 'Paneer', perPerson: 0.12, demandFactor: 1.2 }, { name: 'Cream / Butter', perPerson: 0.03, demandFactor: 1.0 }, { name: 'Tomato', perPerson: 0.04, demandFactor: 1.0 }],
  'Egg Curry': [{ name: 'Eggs', perPerson: 2, demandFactor: 1.2 }, { name: 'Onion', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Tomato', perPerson: 0.04, demandFactor: 1.0 }],
  'Dal Fry': [{ name: 'Toor Dal', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Ghee', perPerson: 0.01, demandFactor: 1.0 }],
  'Tawa Sabji': [{ name: 'Mixed Vegetables', perPerson: 0.15, demandFactor: 1.0 }],
  'Chicken Curry': [{ name: 'Chicken', perPerson: 0.18, demandFactor: 1.2 }, { name: 'Onion', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Tomato', perPerson: 0.04, demandFactor: 1.0 }],
  'Jeera Pulao': [{ name: 'Basmati Rice', perPerson: 0.12, demandFactor: 1.0 }, { name: 'Cumin Seeds', perPerson: 0.005, demandFactor: 1.0 }, { name: 'Ghee', perPerson: 0.01, demandFactor: 1.0 }],
  'Moong Ka Halwa': [{ name: 'Moong Dal', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Ghee', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Sugar', perPerson: 0.04, demandFactor: 1.0 }],
  'Dal Batti Churma': [{ name: 'Mixed Dal (5 types)', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Atta (Wheat Flour)', perPerson: 0.15, demandFactor: 1.0 }, { name: 'Ghee', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Sugar', perPerson: 0.03, demandFactor: 1.0 }],
};

// Weekly menu from JNU
export interface DayMenu {
  day: string;
  Breakfast: string[];
  Lunch: string[];
  'Evening Snacks': string[];
  Dinner: string[];
}

export const WEEKLY_MENU: DayMenu[] = [
  {
    day: 'Monday',
    Breakfast: ['Indori Poha', 'Bread & Butter', 'Cornflakes', 'Omelette', 'Banana', 'Milk / Tea'],
    Lunch: ['Louki Kofta', 'Dal Palak', 'Jeera Rice', 'Salad', 'Mix Veg', 'Raita', 'Chapati'],
    'Evening Snacks': ['Samosa', 'Milk / Tea'],
    Dinner: ['Bhindi Masala', 'Dal Tarka', 'Rice', 'Chapati', 'Lehsun Ki Chutney', 'Salad'],
  },
  {
    day: 'Tuesday',
    Breakfast: ['Plain Idli', 'Vada', 'Sambhar', 'Milk / Tea'],
    Lunch: ['Aloo Cabbage', 'Rajma Masala', 'Salad', 'Rice', 'Chapati', 'Lauki Raita'],
    'Evening Snacks': ['Veg Chowmein', 'Milk / Tea'],
    Dinner: ['Dahiwale Aloo', 'Kala Chana', 'Poori', 'Rice', 'Kheer'],
  },
  {
    day: 'Wednesday',
    Breakfast: ['Masala Paratha', 'Milk / Tea'],
    Lunch: ['Chole', 'Rice', 'Besan Ghatta', 'Salad', 'Chapati'],
    'Evening Snacks': ['Vada Pao', 'Milk / Tea'],
    Dinner: ['Mix Veg Dry', 'Kalli Dal', 'Dahi Fry', 'Veg Dum Biryani', 'Salad', 'Chapati'],
  },
  {
    day: 'Thursday',
    Breakfast: ['Dalia', 'Khaman', 'Kala Chana', 'Bread & Butter', 'Cornflakes', 'Milk / Tea'],
    Lunch: ['Aloo Matar', 'Panchratan Dal', 'Rice', 'Cucumber Raita', 'Salad', 'Chapati'],
    'Evening Snacks': ['Pyaz Kachori', 'Dal Kachori', 'Milk / Tea'],
    Dinner: ['Aloo Baingan Dry', 'Dal Maharani', 'Rice', 'Salad', 'Chapati', 'Fruit Custard'],
  },
  {
    day: 'Friday',
    Breakfast: ['Aloo Paratha', 'Milk / Tea'],
    Lunch: ['Jeera Aloo', 'Dal Tarka', 'Rice', 'Boondi Raita', 'Salad', 'Chapati'],
    'Evening Snacks': ['Red Sauce Pasta', 'Milk / Tea'],
    Dinner: ['Kadhi Paneer', 'Shahi Paneer', 'Egg Curry', 'Dal Fry', 'Rice', 'Salad'],
  },
  {
    day: 'Saturday',
    Breakfast: ['Poha', 'Besan Chilla', 'Boiled Egg', 'Banana Shake', 'Milk / Tea'],
    Lunch: ['Aloo Capsicum Dry', 'Kadhi Pakoda', 'Rice', 'Salad', 'Chapati'],
    'Evening Snacks': ['Momos (6 pcs)', 'Milk / Tea'],
    Dinner: ['Dahi Fry', 'Jeera Aloo', 'Rice', 'Chapati', 'Dal Tarka', 'Salad'],
  },
  {
    day: 'Sunday',
    Breakfast: ['Masala Dosa', 'Sambhar', 'Milk / Tea'],
    Lunch: ['Chole Bhature', 'Lemon Rice', 'Rasam'],
    'Evening Snacks': ['Aloo Bonda', 'Milk / Tea'],
    Dinner: ['Tawa Sabji', 'Chicken Curry', 'Dal Tarka', 'Jeera Pulao', 'Chapati', 'Moong Ka Halwa'],
  },
];

// Unit mapping for materials
const MATERIAL_UNITS: Record<string, string> = {
  'Milk': 'litres',
  'Curd': 'litres',
  'Oil (for frying)': 'litres',
  'Cream / Butter': 'kg',
  'Butter': 'kg',
  'Ghee': 'kg',
  'Eggs': 'pcs',
  'Lemon': 'pcs',
  'Bread (Slices)': 'pcs',
  'Pao Bread': 'pcs',
};

export function getUnit(material: string): string {
  return MATERIAL_UNITS[material] || 'kg';
}

export interface PredictionResult {
  material: string;
  quantity: number;
  dish: string;
  unit: string;
}

export interface PredictionOutput {
  adjustedStudents: number;
  attendanceRate: number;
  results: PredictionResult[];
  totalMaterials: Record<string, { qty: number; unit: string }>;
}

export function predict(
  students: number,
  meal: MealType,
  items: string[],
  preferenceOverrides?: Record<string, number>,
  nonVegRatioOverride?: number,
): PredictionOutput {
  const rate = ATTENDANCE[meal];
  const adjusted = Math.round(students * rate);
  const nvRatio = nonVegRatioOverride ?? NON_VEG_EATER_RATIO;

  // Separate main dishes from sides
  const mainDishes = items.filter(i => !SIDE_DISHES.has(i));
  const sideDishes = items.filter(i => SIDE_DISHES.has(i));
  const mainCount = mainDishes.length || 1; // avoid divide by zero

  const results: PredictionResult[] = [];
  const totalMaterials: Record<string, { qty: number; unit: string }> = {};

  const addMaterial = (item: string, studentsForDish: number) => {
    const materials = getMaterials(item);
    if (!materials) return;
    for (const mat of materials) {
      const unit = getUnit(mat.name);
      let qty = studentsForDish * mat.perPerson * mat.demandFactor;
      if (unit === 'pcs') qty = Math.ceil(qty);
      else qty = parseFloat(qty.toFixed(2));
      results.push({ material: mat.name, quantity: qty, dish: item, unit });
      if (!totalMaterials[mat.name]) totalMaterials[mat.name] = { qty: 0, unit };
      totalMaterials[mat.name].qty += qty;
    }
  };

  // Main dishes: split students equally, with non-veg reduction
  const studentsPerMain = Math.round(adjusted / mainCount);
  for (const item of mainDishes) {
    let dishStudents = studentsPerMain;
    // Non-veg items: only 70% of students eat them
    if (NON_VEG_DISHES.has(item)) {
      dishStudents = Math.round(dishStudents * NON_VEG_EATER_RATIO);
    }
    addMaterial(item, dishStudents);
  }

  // Side dishes: apply preference-based uptake factor
  for (const item of sideDishes) {
    const prefFactor = PREFERENCE_FACTOR[item] ?? 0.75; // default 75% uptake
    let dishStudents = Math.round(adjusted * prefFactor);
    // Non-veg sides also get the non-veg reduction
    if (NON_VEG_DISHES.has(item)) {
      dishStudents = Math.round(dishStudents * NON_VEG_EATER_RATIO);
    }
    addMaterial(item, dishStudents);
  }

  for (const k of Object.keys(totalMaterials)) {
    const u = totalMaterials[k].unit;
    totalMaterials[k].qty = u === 'pcs' ? Math.ceil(totalMaterials[k].qty) : parseFloat(totalMaterials[k].qty.toFixed(2));
  }

  return { adjustedStudents: adjusted, attendanceRate: rate, results, totalMaterials };
}

// Sample historical data for charts
export const SAMPLE_DATA = [
  { day: 'Mon', Breakfast: 120, Lunch: 280, Dinner: 310 },
  { day: 'Tue', Breakfast: 115, Lunch: 295, Dinner: 300 },
  { day: 'Wed', Breakfast: 130, Lunch: 270, Dinner: 320 },
  { day: 'Thu', Breakfast: 110, Lunch: 300, Dinner: 305 },
  { day: 'Fri', Breakfast: 140, Lunch: 260, Dinner: 290 },
  { day: 'Sat', Breakfast: 90, Lunch: 200, Dinner: 250 },
  { day: 'Sun', Breakfast: 85, Lunch: 190, Dinner: 240 },
];
