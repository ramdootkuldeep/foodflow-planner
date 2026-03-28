export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

export const MENU_ITEMS = [
  'Rice', 'Dal', 'Roti', 'Paneer', 'Rajma', 'Kadhi', 'Chole',
] as const;

export type MenuItem = typeof MENU_ITEMS[number];

const ATTENDANCE: Record<MealType, number> = {
  Breakfast: 0.70,
  Lunch: 0.90,
  Dinner: 1.00,
};

interface RawMaterial {
  name: string;
  perPerson: number; // kg
  demandFactor: number;
}

const DISH_MATERIALS: Record<MenuItem, RawMaterial[]> = {
  Rice: [{ name: 'Rice', perPerson: 0.45, demandFactor: 1.0 }],
  Dal: [{ name: 'Pulses', perPerson: 0.28, demandFactor: 1.0 }],
  Roti: [{ name: 'Atta (Wheat Flour)', perPerson: 0.22, demandFactor: 1.0 }],
  Paneer: [{ name: 'Paneer', perPerson: 0.18, demandFactor: 1.2 }],
  Rajma: [{ name: 'Rajma', perPerson: 0.28, demandFactor: 1.2 }],
  Kadhi: [
    { name: 'Besan (Gram Flour)', perPerson: 0.10, demandFactor: 0.8 },
    { name: 'Curd', perPerson: 0.15, demandFactor: 0.8 },
  ],
  Chole: [{ name: 'Chana', perPerson: 0.28, demandFactor: 1.2 }],
};

export interface PredictionResult {
  material: string;
  quantity: number; // kg
  dish: string;
}

export interface PredictionOutput {
  adjustedStudents: number;
  attendanceRate: number;
  results: PredictionResult[];
  totalMaterials: Record<string, number>;
}

export function predict(
  students: number,
  meal: MealType,
  items: MenuItem[]
): PredictionOutput {
  const rate = ATTENDANCE[meal];
  const adjusted = Math.round(students * rate);

  const results: PredictionResult[] = [];
  const totalMaterials: Record<string, number> = {};

  for (const item of items) {
    const materials = DISH_MATERIALS[item];
    for (const mat of materials) {
      const qty = parseFloat((adjusted * mat.perPerson * mat.demandFactor).toFixed(2));
      results.push({ material: mat.name, quantity: qty, dish: item });
      totalMaterials[mat.name] = (totalMaterials[mat.name] || 0) + qty;
    }
  }

  // Round totals
  for (const k of Object.keys(totalMaterials)) {
    totalMaterials[k] = parseFloat(totalMaterials[k].toFixed(2));
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
