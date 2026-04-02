import { supabase } from '@/integrations/supabase/client';
import type { MealType, PredictionOutput, DishInfo } from './prediction';

// API wrapper for the predict edge function
export async function apiPredict(
  students: number,
  meal: MealType,
  items: string[],
  preferenceOverrides?: Record<string, number>,
  nonVegRatio?: number,
  customDishMaterials?: Record<string, { name: string; perPerson: number; unit: string }[]>,
  learnedAdjustments?: Record<string, { factor: number; samples: number }>,
): Promise<PredictionOutput> {
  const { data, error } = await supabase.functions.invoke('predict', {
    body: {
      students,
      meal,
      items,
      preferenceOverrides,
      nonVegRatio,
      customDishMaterials,
      learnedAdjustments,
    },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (error) throw error;
  return data as PredictionOutput;
}

// Get dishes for a meal
export async function apiGetDishes(
  meal: MealType,
  customDishes: DishInfo[] = [],
  removedDishes: string[] = [],
): Promise<string[]> {
  const params = new URLSearchParams({
    action: 'dishes',
    meal,
    customDishes: JSON.stringify(customDishes),
    removedDishes: JSON.stringify(removedDishes),
  });
  const { data, error } = await supabase.functions.invoke(`predict?${params}`, {
    method: 'GET',
  });
  if (error) throw error;
  return data.dishes;
}

// Get weekly menu
export async function apiGetWeeklyMenu() {
  const { data, error } = await supabase.functions.invoke('predict?action=weekly-menu', {
    method: 'GET',
  });
  if (error) throw error;
  return data.weeklyMenu;
}

// Get config (preference factors, side dishes, etc.)
export async function apiGetConfig() {
  const { data, error } = await supabase.functions.invoke('predict?action=config', {
    method: 'GET',
  });
  if (error) throw error;
  return data as {
    preferenceFactor: Record<string, number>;
    nonVegEaterRatio: number;
    sideDishes: string[];
  };
}

// Get dish serving estimate
export async function apiGetDishServing(dish: string) {
  const { data, error } = await supabase.functions.invoke(`predict?action=dish-serving&dish=${encodeURIComponent(dish)}`, {
    method: 'GET',
  });
  if (error) throw error;
  return data as { amount: number; unit: string };
}

// ── Feedback API ──

export interface DishFeedbackItem {
  dish: string;
  actualConsumed: number;
  wasted: number;
  unit: string;
  predictedServing: number;
}

export async function apiSaveFeedback(meal: MealType, students: number, dishes: DishFeedbackItem[]) {
  const { data, error } = await supabase.functions.invoke('feedback?action=save', {
    body: { meal, students, dishes },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (error) throw error;
  return data;
}

export async function apiGetFeedbackHistory() {
  const { data, error } = await supabase.functions.invoke('feedback?action=history', {
    method: 'GET',
  });
  if (error) throw error;
  return data.entries;
}

export async function apiGetFeedbackStats() {
  const { data, error } = await supabase.functions.invoke('feedback?action=stats', {
    method: 'GET',
  });
  if (error) throw error;
  return data as {
    totalEntries: number;
    avgWastePercent: number;
    topWasted: { dish: string; avgWaste: number; unit: string }[];
  };
}

export async function apiGetLearnedAdjustments() {
  const { data, error } = await supabase.functions.invoke('feedback?action=learned-adjustments', {
    method: 'GET',
  });
  if (error) throw error;
  return data as Record<string, { factor: number; samples: number }>;
}

export async function apiClearFeedback() {
  const { data, error } = await supabase.functions.invoke('feedback?action=clear', {
    method: 'DELETE',
  });
  if (error) throw error;
  return data;
}
