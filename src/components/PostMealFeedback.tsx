import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  saveFeedback, loadFeedbackHistory, clearFeedbackHistory,
  getFeedbackStats, getUnit,
  type PredictionOutput, type MealType, type FeedbackEntry,
} from '@/lib/prediction';
import {
  ClipboardCheck, Trash2, TrendingDown, AlertTriangle,
  CheckCircle2, History, Droplets, Weight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  lastPrediction: PredictionOutput | null;
  lastMeal: MealType | null;
  lastStudents: number | null;
  lastItems: string[];
}

export default function PostMealFeedback({ lastPrediction, lastMeal, lastStudents, lastItems }: Props) {
  const [actualUsed, setActualUsed] = useState<Record<string, string>>({});
  const [wasted, setWasted] = useState<Record<string, string>>({});
  const [historyCount, setHistoryCount] = useState(0);
  const [stats, setStats] = useState(getFeedbackStats());

  useEffect(() => {
    setHistoryCount(loadFeedbackHistory().length);
    setStats(getFeedbackStats());
  }, []);

  if (!lastPrediction || !lastMeal || !lastStudents) {
    return (
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Post-Meal Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-2 py-8">
            <ClipboardCheck className="h-10 w-10 mx-auto opacity-40" />
            <p className="font-medium">Run a prediction first</p>
            <p className="text-sm">After cooking, enter actual usage & waste here to improve future predictions.</p>
          </div>
          {historyCount > 0 && <FeedbackStatsView stats={stats} count={historyCount} onClear={() => {
            clearFeedbackHistory();
            setHistoryCount(0);
            setStats(getFeedbackStats());
            toast.success('Feedback history cleared');
          }} />}
        </CardContent>
      </Card>
    );
  }

  const materials = Object.entries(lastPrediction.totalMaterials);

  const handleSubmit = () => {
    const items: FeedbackEntry['items'] = lastItems.map(dish => {
      const dishMaterials: Record<string, { qty: number; unit: string }> = {};
      for (const r of lastPrediction.results.filter(r => r.dish === dish)) {
        dishMaterials[r.material] = { qty: r.quantity, unit: r.unit };
      }
      const dishActual: Record<string, number> = {};
      const dishWaste: Record<string, number> = {};
      for (const mat of Object.keys(dishMaterials)) {
        dishActual[mat] = parseFloat(actualUsed[mat] || '0') || 0;
        dishWaste[mat] = parseFloat(wasted[mat] || '0') || 0;
      }
      return { dish, predictedQty: dishMaterials, actualUsed: dishActual, wasted: dishWaste };
    });

    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      meal: lastMeal,
      students: lastStudents,
      items,
    };
    saveFeedback(entry);
    setActualUsed({});
    setWasted({});
    setHistoryCount(loadFeedbackHistory().length);
    setStats(getFeedbackStats());
    toast.success('Feedback recorded! Future predictions will improve based on this data.');
  };

  const isLiquid = (unit: string) => unit === 'litres';

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-primary" /> Post-Meal Feedback
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Enter actual quantities used and food wasted after cooking to improve future predictions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Badge variant="outline" className="gap-1"><Weight className="h-3 w-3" /> Food items in kg</Badge>
          <Badge variant="outline" className="gap-1"><Droplets className="h-3 w-3" /> Beverages in litres</Badge>
        </div>

        <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3">
          {materials.map(([name, { qty, unit }]) => (
            <div key={name} className="p-3 rounded-lg border border-border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLiquid(unit) ? <Droplets className="h-4 w-4 text-blue-500" /> : <Weight className="h-4 w-4 text-muted-foreground" />}
                  <span className="font-medium text-sm">{name}</span>
                </div>
                <Badge className="bg-primary/10 text-primary border-0 text-xs">
                  Predicted: {qty} {unit}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Actually Used ({unit})</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder={`${qty}`}
                    value={actualUsed[name] || ''}
                    onChange={e => setActualUsed(p => ({ ...p, [name]: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Wasted ({unit})</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.1}
                    placeholder="0"
                    value={wasted[name] || ''}
                    onChange={e => setWasted(p => ({ ...p, [name]: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSubmit} className="w-full h-11 font-semibold">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Submit Feedback & Improve Model
        </Button>

        {historyCount > 0 && <FeedbackStatsView stats={stats} count={historyCount} onClear={() => {
          clearFeedbackHistory();
          setHistoryCount(0);
          setStats(getFeedbackStats());
          toast.success('Feedback history cleared');
        }} />}
      </CardContent>
    </Card>
  );
}

function FeedbackStatsView({ stats, count, onClear }: {
  stats: ReturnType<typeof getFeedbackStats>;
  count: number;
  onClear: () => void;
}) {
  return (
    <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" /> Learning History
        </span>
        <Button variant="ghost" size="sm" className="text-xs text-destructive h-7 px-2" onClick={onClear}>
          <Trash2 className="h-3 w-3 mr-1" /> Clear
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded bg-primary/5">
          <p className="text-lg font-bold text-primary">{count}</p>
          <p className="text-xs text-muted-foreground">Entries Recorded</p>
        </div>
        <div className="p-2 rounded bg-destructive/5">
          <p className="text-lg font-bold text-destructive">{stats.avgWastePercent}%</p>
          <p className="text-xs text-muted-foreground">Avg. Waste</p>
        </div>
      </div>
      {stats.topWasted.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Top Wasted Materials
          </p>
          <div className="space-y-1">
            {stats.topWasted.map(w => (
              <div key={w.material} className="flex items-center justify-between text-xs p-1.5 rounded bg-destructive/5">
                <span className="font-medium truncate mr-2">{w.material}</span>
                <span className="text-destructive font-bold shrink-0">{w.avgWaste} {w.unit}/meal</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        <TrendingDown className="h-3 w-3 inline mr-1" />
        Predictions auto-adjust based on your feedback data.
      </p>
    </div>
  );
}
