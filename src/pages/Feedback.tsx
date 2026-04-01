import PostMealFeedback from '@/components/PostMealFeedback';
import type { PredictionOutput, MealType } from '@/lib/prediction';

interface FeedbackPageProps {
  lastPrediction: PredictionOutput | null;
  lastMeal: MealType | null;
  lastStudents: number | null;
  lastItems: string[];
}

export default function FeedbackPage({ lastPrediction, lastMeal, lastStudents, lastItems }: FeedbackPageProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <PostMealFeedback
        lastPrediction={lastPrediction}
        lastMeal={lastMeal}
        lastStudents={lastStudents}
        lastItems={lastItems}
      />
    </div>
  );
}
