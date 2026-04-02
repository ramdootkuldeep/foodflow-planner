import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiSaveFeedback, apiGetFeedbackStats, apiGetFeedbackHistory, apiClearFeedback, apiGetDishServing, type DishFeedbackItem } from '@/lib/api';
import type { PredictionOutput, MealType } from '@/lib/prediction';
import {
  ClipboardCheck, Trash2, TrendingDown, AlertTriangle,
  CheckCircle2, History, UtensilsCrossed, Flame, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lastPrediction: PredictionOutput | null;
  lastMeal: MealType | null;
  lastStudents: number | null;
  lastItems: string[];
}

export default function PostMealFeedback({ lastPrediction, lastMeal, lastStudents, lastItems }: Props) {
  const [consumed, setConsumed] = useState<Record<string, string>>({});
  const [wasted, setWasted] = useState<Record<string, string>>({});
  const [historyCount, setHistoryCount] = useState(0);
  const [stats, setStats] = useState<{ totalEntries: number; avgWastePercent: number; topWasted: { dish: string; avgWaste: number; unit: string }[] }>({ totalEntries: 0, avgWastePercent: 0, topWasted: [] });
  const [submitting, setSubmitting] = useState(false);
  const [dishServings, setDishServings] = useState<{ dish: string; predictedTotal: number; unit: string }[]>([]);

  useEffect(() => {
    apiGetFeedbackStats().then(setStats).catch(() => {});
    apiGetFeedbackHistory().then(entries => setHistoryCount(entries.length)).catch(() => {});
  }, []);

  // Compute dish servings from prediction results
  useEffect(() => {
    if (!lastPrediction || !lastItems.length) return;
    const servings = lastItems.map(dish => {
      const dishResults = lastPrediction.results.filter(r => r.dish === dish);
      const totalPredictedKg = dishResults.reduce((s, r) => {
        if (r.unit === 'pcs') return s + r.quantity * 0.05;
        return s + r.quantity;
      }, 0);
      return { dish, predictedTotal: parseFloat(totalPredictedKg.toFixed(1)), unit: 'kg' };
    });
    setDishServings(servings);
  }, [lastPrediction, lastItems]);

  const clearHandler = async () => {
    try {
      await apiClearFeedback();
      setHistoryCount(0);
      setStats({ totalEntries: 0, avgWastePercent: 0, topWasted: [] });
      toast.success('Feedback history cleared');
    } catch {
      toast.error('Failed to clear feedback');
    }
  };

  if (!lastPrediction || !lastMeal || !lastStudents) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="h-4 w-4 text-primary" />
            </div>
            Post-Meal Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-3 py-10">
            <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto">
              <UtensilsCrossed className="h-8 w-8 opacity-40" />
            </div>
            <p className="font-semibold text-foreground">Run a prediction first</p>
            <p className="text-sm max-w-sm mx-auto">After cooking, enter how much food was consumed and wasted to improve future predictions.</p>
          </div>
          {historyCount > 0 && <FeedbackStatsView stats={stats} count={historyCount} onClear={clearHandler} />}
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dishes: DishFeedbackItem[] = dishServings.map(({ dish, predictedTotal, unit }) => ({
        dish,
        actualConsumed: parseFloat(consumed[dish] || '0') || 0,
        wasted: parseFloat(wasted[dish] || '0') || 0,
        unit,
        predictedServing: predictedTotal,
      }));

      await apiSaveFeedback(lastMeal, lastStudents, dishes);
      setConsumed({});
      setWasted({});

      const [newStats, history] = await Promise.all([
        apiGetFeedbackStats(),
        apiGetFeedbackHistory(),
      ]);
      setStats(newStats);
      setHistoryCount(history.length);
      toast.success('Feedback recorded! Future predictions will improve based on this data.');
    } catch {
      toast.error('Failed to save feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </div>
          Post-Meal Feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter how much <strong>cooked food</strong> was consumed and wasted for each dish to improve future predictions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="gap-1 bg-primary/5 border-primary/20">
            <Flame className="h-3 w-3 text-primary" /> Enter cooked food quantities
          </Badge>
        </div>

        <div className="max-h-[450px] overflow-y-auto pr-1 space-y-3">
          {dishServings.map(({ dish, predictedTotal, unit }) => (
            <div key={dish} className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">{dish}</span>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs font-medium">
                  ~{predictedTotal} {unit} predicted
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Consumed ({unit})</Label>
                  <Input
                    type="number" min={0} step={0.5}
                    placeholder={`${predictedTotal}`}
                    value={consumed[dish] || ''}
                    onChange={e => setConsumed(p => ({ ...p, [dish]: e.target.value }))}
                    className="h-10 text-sm bg-background"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Wasted ({unit})</Label>
                  <Input
                    type="number" min={0} step={0.5}
                    placeholder="0"
                    value={wasted[dish] || ''}
                    onChange={e => setWasted(p => ({ ...p, [dish]: e.target.value }))}
                    className="h-10 text-sm bg-background"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} disabled={submitting} className="w-full h-12 font-semibold text-base shadow-lg hover:shadow-xl transition-all">
          {submitting ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
          {submitting ? 'Submitting...' : 'Submit Feedback & Improve Model'}
        </Button>

        {historyCount > 0 && <FeedbackStatsView stats={stats} count={historyCount} onClear={clearHandler} />}
      </CardContent>
    </Card>
  );
}

function FeedbackStatsView({ stats, count, onClear }: {
  stats: { totalEntries: number; avgWastePercent: number; topWasted: { dish: string; avgWaste: number; unit: string }[] };
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4 w-4 text-primary" /> Learning History
        </span>
        <Button variant="ghost" size="sm" className="text-xs text-destructive h-7 px-2 hover:bg-destructive/10" onClick={onClear}>
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-2xl font-bold text-primary">{count}</p>
          <p className="text-xs text-muted-foreground font-medium">Entries Recorded</p>
        </div>
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
          <p className="text-2xl font-bold text-destructive">{stats.avgWastePercent}%</p>
          <p className="text-xs text-muted-foreground font-medium">Avg. Waste</p>
        </div>
      </div>
      {stats.topWasted.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Top Wasted Dishes
          </p>
          <div className="space-y-1.5">
            {stats.topWasted.map(w => (
              <div key={w.dish} className="flex items-center justify-between text-xs p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                <span className="font-medium truncate mr-2">{w.dish}</span>
                <span className="text-destructive font-bold shrink-0">{w.avgWaste} {w.unit}/meal</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <TrendingDown className="h-3 w-3" />
        Predictions auto-adjust based on your feedback data.
      </p>
    </div>
  );
}
