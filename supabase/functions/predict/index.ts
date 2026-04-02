import { corsHeaders } from '@supabase/supabase-js/cors'

// ── Types ──
type MealType = 'Breakfast' | 'Lunch' | 'Evening Snacks' | 'Dinner';

interface RawMaterial {
  name: string;
  perPerson: number;
  demandFactor: number;
}

// ── All dishes ──
const ALL_DISHES = [
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
  { name: 'Samosa', meals: ['Evening Snacks'] },
  { name: 'Veg Chowmein', meals: ['Evening Snacks'] },
  { name: 'Vada Pao', meals: ['Evening Snacks'] },
  { name: 'Pyaz Kachori', meals: ['Evening Snacks'] },
  { name: 'Dal Kachori', meals: ['Evening Snacks'] },
  { name: 'Red Sauce Pasta', meals: ['Evening Snacks'] },
  { name: 'Momos (6 pcs)', meals: ['Evening Snacks'] },
  { name: 'Aloo Bonda', meals: ['Evening Snacks'] },
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

const WEEKLY_MENU = [
  { day: 'Monday', Breakfast: ['Indori Poha','Bread & Butter','Cornflakes','Omelette','Banana','Milk / Tea'], Lunch: ['Louki Kofta','Dal Palak','Jeera Rice','Salad','Mix Veg','Raita','Chapati'], 'Evening Snacks': ['Samosa','Milk / Tea'], Dinner: ['Bhindi Masala','Dal Tarka','Rice','Chapati','Lehsun Ki Chutney','Salad'] },
  { day: 'Tuesday', Breakfast: ['Plain Idli','Vada','Sambhar','Milk / Tea'], Lunch: ['Aloo Cabbage','Rajma Masala','Salad','Rice','Chapati','Lauki Raita'], 'Evening Snacks': ['Veg Chowmein','Milk / Tea'], Dinner: ['Dahiwale Aloo','Kala Chana','Poori','Rice','Kheer'] },
  { day: 'Wednesday', Breakfast: ['Masala Paratha','Milk / Tea'], Lunch: ['Chole','Rice','Besan Ghatta','Salad','Chapati'], 'Evening Snacks': ['Vada Pao','Milk / Tea'], Dinner: ['Mix Veg Dry','Kalli Dal','Dahi Fry','Veg Dum Biryani','Salad','Chapati'] },
  { day: 'Thursday', Breakfast: ['Dalia','Khaman','Kala Chana','Bread & Butter','Cornflakes','Milk / Tea'], Lunch: ['Aloo Matar','Panchratan Dal','Rice','Cucumber Raita','Salad','Chapati'], 'Evening Snacks': ['Pyaz Kachori','Dal Kachori','Milk / Tea'], Dinner: ['Aloo Baingan Dry','Dal Maharani','Rice','Salad','Chapati','Fruit Custard'] },
  { day: 'Friday', Breakfast: ['Aloo Paratha','Milk / Tea'], Lunch: ['Jeera Aloo','Dal Tarka','Rice','Boondi Raita','Salad','Chapati'], 'Evening Snacks': ['Red Sauce Pasta','Milk / Tea'], Dinner: ['Kadhi Paneer','Shahi Paneer','Egg Curry','Dal Fry','Rice','Salad'] },
  { day: 'Saturday', Breakfast: ['Poha','Besan Chilla','Boiled Egg','Banana Shake','Milk / Tea'], Lunch: ['Aloo Capsicum Dry','Kadhi Pakoda','Rice','Salad','Chapati'], 'Evening Snacks': ['Momos (6 pcs)','Milk / Tea'], Dinner: ['Dahi Fry','Jeera Aloo','Rice','Chapati','Dal Tarka','Salad'] },
  { day: 'Sunday', Breakfast: ['Masala Dosa','Sambhar','Milk / Tea'], Lunch: ['Chole Bhature','Lemon Rice','Rasam'], 'Evening Snacks': ['Aloo Bonda','Milk / Tea'], Dinner: ['Tawa Sabji','Chicken Curry','Dal Tarka','Jeera Pulao','Chapati','Moong Ka Halwa'] },
];

const ATTENDANCE: Record<MealType, number> = {
  Breakfast: 0.70, Lunch: 0.90, 'Evening Snacks': 0.60, Dinner: 1.00,
};

const NON_VEG_DISHES = new Set(['Omelette','Boiled Egg','Egg Curry','Chicken Curry']);
const NON_VEG_EATER_RATIO = 0.70;

const PREFERENCE_FACTOR: Record<string, number> = {
  'Chapati': 0.65, 'Rice': 0.55, 'Jeera Rice': 0.50, 'Poori': 0.60,
  'Dal Palak': 0.70, 'Dal Tarka': 0.75, 'Panchratan Dal': 0.70, 'Dal Fry': 0.75,
  'Kalli Dal': 0.65, 'Dal Maharani': 0.70, 'Raita': 0.50, 'Lauki Raita': 0.45,
  'Cucumber Raita': 0.50, 'Boondi Raita': 0.50, 'Kheer': 0.75, 'Savaiyan': 0.70,
  'Fruit Custard': 0.80, 'Moong Ka Halwa': 0.70, 'Milk / Tea': 0.80, 'Cornflakes': 0.30,
  'Bread & Butter': 0.40, 'Banana': 0.50, 'Salad': 0.45, 'Lehsun Ki Chutney': 0.40,
  'Sambhar': 0.80, 'Rasam': 0.60,
};

const SIDE_DISHES = new Set([
  'Milk / Tea','Sambhar','Chapati','Rice','Jeera Rice','Salad','Raita','Lauki Raita',
  'Cucumber Raita','Boondi Raita','Lehsun Ki Chutney','Bread & Butter','Cornflakes','Banana',
  'Dal Palak','Dal Tarka','Panchratan Dal','Dal Fry','Kalli Dal','Dal Maharani',
  'Kheer','Savaiyan','Fruit Custard','Moong Ka Halwa','Rasam','Poori',
]);

const MATERIAL_UNITS: Record<string, string> = {
  'Milk': 'litres', 'Curd': 'litres', 'Oil (for frying)': 'litres',
  'Cream / Butter': 'kg', 'Butter': 'kg', 'Ghee': 'kg',
  'Eggs': 'pcs', 'Lemon': 'pcs', 'Bread (Slices)': 'pcs', 'Pao Bread': 'pcs',
};

const DISH_MATERIALS: Record<string, RawMaterial[]> = {
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
  'Samosa': [{ name: 'Maida (Refined Flour)', perPerson: 0.06, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.06, demandFactor: 1.2 }, { name: 'Oil (for frying)', perPerson: 0.03, demandFactor: 1.0 }],
  'Veg Chowmein': [{ name: 'Noodles', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Mixed Vegetables', perPerson: 0.06, demandFactor: 1.0 }],
  'Vada Pao': [{ name: 'Pao Bread', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Potato', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.03, demandFactor: 1.0 }],
  'Pyaz Kachori': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Onion', perPerson: 0.06, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.04, demandFactor: 1.0 }],
  'Dal Kachori': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.0 }, { name: 'Moong Dal', perPerson: 0.05, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.04, demandFactor: 1.0 }],
  'Red Sauce Pasta': [{ name: 'Pasta', perPerson: 0.10, demandFactor: 1.2 }, { name: 'Tomato', perPerson: 0.06, demandFactor: 1.0 }],
  'Momos (6 pcs)': [{ name: 'Maida (Refined Flour)', perPerson: 0.08, demandFactor: 1.2 }, { name: 'Mixed Vegetables', perPerson: 0.08, demandFactor: 1.0 }],
  'Aloo Bonda': [{ name: 'Potato', perPerson: 0.10, demandFactor: 1.0 }, { name: 'Besan (Gram Flour)', perPerson: 0.04, demandFactor: 1.0 }, { name: 'Oil (for frying)', perPerson: 0.03, demandFactor: 1.0 }],
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

// Custom materials registered at runtime (per request)
const customMaterials: Record<string, RawMaterial[]> = {};

function getUnit(material: string): string {
  return MATERIAL_UNITS[material] || 'kg';
}

function getMaterials(dish: string): RawMaterial[] | undefined {
  return DISH_MATERIALS[dish] || customMaterials[dish];
}

function getDishesForMeal(meal: MealType, customDishes: { name: string; meals: string[] }[] = [], removedDishes: string[] = []): string[] {
  const all = [...ALL_DISHES, ...customDishes];
  return all.filter(d => d.meals.includes(meal) && !removedDishes.includes(d.name)).map(d => d.name);
}

function predict(
  students: number, meal: MealType, items: string[],
  preferenceOverrides?: Record<string, number>,
  nonVegRatioOverride?: number,
  learnedAdjustments?: Record<string, { factor: number; samples: number }>,
) {
  const rate = ATTENDANCE[meal];
  const adjusted = Math.round(students * rate);
  const nvRatio = nonVegRatioOverride ?? NON_VEG_EATER_RATIO;

  const mainDishes = items.filter(i => !SIDE_DISHES.has(i));
  const sideDishes = items.filter(i => SIDE_DISHES.has(i));
  const mainCount = mainDishes.length || 1;

  const results: { material: string; quantity: number; dish: string; unit: string }[] = [];
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

  const studentsPerMain = Math.round(adjusted / mainCount);
  for (const item of mainDishes) {
    let dishStudents = studentsPerMain;
    if (NON_VEG_DISHES.has(item)) dishStudents = Math.round(dishStudents * nvRatio);
    addMaterial(item, dishStudents);
  }

  for (const item of sideDishes) {
    const defaultPref = PREFERENCE_FACTOR[item] ?? 0.75;
    const prefFactor = preferenceOverrides?.[item] ?? defaultPref;
    let dishStudents = Math.round(adjusted * prefFactor);
    if (NON_VEG_DISHES.has(item)) dishStudents = Math.round(dishStudents * nvRatio);
    addMaterial(item, dishStudents);
  }

  // Apply learned adjustments
  if (learnedAdjustments && Object.keys(learnedAdjustments).length > 0) {
    for (const r of results) {
      const adj = learnedAdjustments[r.dish];
      if (adj && adj.samples >= 1) {
        r.quantity = r.unit === 'pcs'
          ? Math.ceil(r.quantity * adj.factor)
          : parseFloat((r.quantity * adj.factor).toFixed(2));
      }
    }
    // Recalculate totals
    for (const k of Object.keys(totalMaterials)) {
      totalMaterials[k].qty = 0;
    }
    for (const r of results) {
      if (!totalMaterials[r.material]) totalMaterials[r.material] = { qty: 0, unit: r.unit };
      totalMaterials[r.material].qty += r.quantity;
    }
  }

  for (const k of Object.keys(totalMaterials)) {
    const u = totalMaterials[k].unit;
    totalMaterials[k].qty = u === 'pcs' ? Math.ceil(totalMaterials[k].qty) : parseFloat(totalMaterials[k].qty.toFixed(2));
  }

  return { adjustedStudents: adjusted, attendanceRate: rate, results, totalMaterials };
}

function estimateDishServing(dish: string): { amount: number; unit: string } {
  const mats = getMaterials(dish);
  if (!mats) return { amount: 0.25, unit: 'kg' };
  let total = 0;
  let hasLiquid = false;
  for (const m of mats) {
    const u = getUnit(m.name);
    if (u === 'litres') hasLiquid = true;
    if (u === 'pcs') total += m.perPerson * 0.05;
    else total += m.perPerson;
  }
  return { amount: parseFloat(total.toFixed(3)), unit: hasLiquid ? 'litres' : 'kg' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'predict';

    if (req.method === 'GET' && action === 'dishes') {
      const meal = url.searchParams.get('meal') as MealType;
      const customDishesParam = url.searchParams.get('customDishes');
      const removedParam = url.searchParams.get('removedDishes');
      const custom = customDishesParam ? JSON.parse(customDishesParam) : [];
      const removed = removedParam ? JSON.parse(removedParam) : [];
      const dishes = getDishesForMeal(meal, custom, removed);
      return new Response(JSON.stringify({ dishes }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'weekly-menu') {
      return new Response(JSON.stringify({ weeklyMenu: WEEKLY_MENU }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'config') {
      return new Response(JSON.stringify({
        preferenceFactor: PREFERENCE_FACTOR,
        nonVegEaterRatio: NON_VEG_EATER_RATIO,
        sideDishes: Array.from(SIDE_DISHES),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'dish-serving') {
      const dish = url.searchParams.get('dish') || '';
      const serving = estimateDishServing(dish);
      return new Response(JSON.stringify(serving), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'predict') {
      const body = await req.json();
      const { students, meal, items, preferenceOverrides, nonVegRatio, customDishMaterials, learnedAdjustments } = body;

      // Register custom dish materials for this request
      if (customDishMaterials) {
        for (const [name, mats] of Object.entries(customDishMaterials)) {
          customMaterials[name] = (mats as any[]).map(m => ({ name: m.name, perPerson: m.perPerson, demandFactor: 1.0 }));
          for (const m of mats as any[]) {
            if (m.unit) MATERIAL_UNITS[m.name] = m.unit;
          }
        }
      }

      const result = predict(students, meal, items, preferenceOverrides, nonVegRatio, learnedAdjustments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
