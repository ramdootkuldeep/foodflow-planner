import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from './Dashboard';
import PredictPage from './Predict';
import FeedbackPage from './Feedback';
import MenuManagement from './MenuManagement';
import {
  registerDishMaterials, unregisterDishMaterials,
  type MealType, type PredictionOutput, type DishInfo,
} from '@/lib/prediction';

const Index = () => {
  const [output, setOutput] = useState<PredictionOutput | null>(null);
  const [lastMeal, setLastMeal] = useState<MealType | null>(null);
  const [lastStudents, setLastStudents] = useState<number | null>(null);
  const [lastItems, setLastItems] = useState<string[]>([]);
  const [customDishes, setCustomDishes] = useState<DishInfo[]>([]);
  const [removedDishes, setRemovedDishes] = useState<string[]>([]);
  const [useLearned, setUseLearned] = useState(true);

  const handlePredictionMade = (result: PredictionOutput, meal: MealType, students: number, items: string[]) => {
    setOutput(result);
    setLastMeal(meal);
    setLastStudents(students);
    setLastItems(items);
  };

  const handleAddDish = (dish: DishInfo, materials: { name: string; perPerson: number; unit: string }[]) => {
    setCustomDishes(p => [...p.filter(d => d.name !== dish.name), dish]);
    registerDishMaterials(dish.name, materials);
    setRemovedDishes(p => p.filter(n => n !== dish.name));
  };

  const handleRemoveDish = (name: string) => {
    const isCustom = customDishes.some(d => d.name === name);
    if (isCustom) {
      setCustomDishes(p => p.filter(d => d.name !== name));
      unregisterDishMaterials(name);
    } else {
      setRemovedDishes(p => [...p, name]);
    }
  };

  const handleRestoreDish = (name: string) => {
    setRemovedDishes(p => p.filter(n => n !== name));
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard useLearned={useLearned} onToggleLearned={setUseLearned} />} />
        <Route path="/predict" element={
          <PredictPage customDishes={customDishes} removedDishes={removedDishes} useLearned={useLearned} onPredictionMade={handlePredictionMade} />
        } />
        <Route path="/feedback" element={
          <FeedbackPage lastPrediction={output} lastMeal={lastMeal} lastStudents={lastStudents} lastItems={lastItems} />
        } />
        <Route path="/menu" element={
          <MenuManagement customDishes={customDishes} removedDishes={removedDishes} onAddDish={handleAddDish} onRemoveDish={handleRemoveDish} onRestoreDish={handleRestoreDish} />
        } />
      </Routes>
    </Layout>
  );
};

export default Index;
