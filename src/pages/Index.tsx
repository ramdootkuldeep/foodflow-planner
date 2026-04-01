import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  predict, getDishesForMeal, WEEKLY_MENU,
  registerDishMaterials, unregisterDishMaterials,
  PREFERENCE_FACTOR, NON_VEG_EATER_RATIO, SIDE_DISHES,
  computeLearnedAdjustments,
  type MealType, type PredictionOutput, type DishInfo,
} from '@/lib/prediction';
import ManageMenuDialog from '@/components/ManageMenuDialog';
import PostMealFeedback from '@/components/PostMealFeedback';
import {
  Leaf, Users, Utensils, Calculator, RotateCcw, CalendarDays,
  Package, TrendingDown, Scale, SlidersHorizontal, ChevronDown, ChevronUp, BrainCircuit,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

/* ─── Prediction Form ─── */
function PredictionForm({ onPredict, onReset, customDishes, removedDishes }: {
  onPredict: (s: number, m: MealType, i: string[], prefOverrides?: Record<string, number>, nvOverride?: number) => void;
  onReset: () => void;
  customDishes: DishInfo[];
  removedDishes: string[];
}) {
  const [students, setStudents] = useState('300');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [prefOverrides, setPrefOverrides] = useState<Record<string, number>>({});
  const [nvOverride, setNvOverride] = useState<number>(NON_VEG_EATER_RATIO * 100);
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const availableDishes = getDishesForMeal(meal, customDishes, removedDishes);

  const toggle = (item: string) =>
    setSelected(p => (p.includes(item) ? p.filter(i => i !== item) : [...p, item]));

  const handleMealChange = (v: MealType) => { setMeal(v); setSelected([]); setSelectedDay(''); };

  const handleDaySelect = (day: string) => {
    if (day === selectedDay) { setSelectedDay(''); setSelected([]); return; }
    setSelectedDay(day);
    const dm = WEEKLY_MENU.find(d => d.day === day);
    if (dm) setSelected((dm[meal] || []).filter(d => availableDishes.includes(d)));
  };

  const handleReset = () => { setStudents('300'); setMeal('Lunch'); setSelected([]); setSelectedDay(''); setPrefOverrides({}); setNvOverride(NON_VEG_EATER_RATIO * 100); onReset(); };

  // Get side dishes from current selection for the slider UI
  const selectedSides = selected.filter(i => SIDE_DISHES.has(i));

  const getEffectivePref = (dish: string) => {
    if (dish in prefOverrides) return prefOverrides[dish];
    return (PREFERENCE_FACTOR[dish] ?? 0.75) * 100;
  };

  const setPref = (dish: string, val: number) => {
    setPrefOverrides(p => ({ ...p, [dish]: val }));
  };

  const buildOverrides = () => {
    if (Object.keys(prefOverrides).length === 0) return undefined;
    const o: Record<string, number> = {};
    for (const [k, v] of Object.entries(prefOverrides)) {
      o[k] = v / 100;
    }
    return o;
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Utensils className="h-4 w-4 text-primary" />
          </div>
          Meal Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-muted-foreground" /> Number of Students
          </Label>
          <Input type="number" min={1} value={students} onChange={e => setStudents(e.target.value)} placeholder="Enter student count" className="text-lg h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-medium">Meal Type</Label>
          <Select value={meal} onValueChange={v => handleMealChange(v as MealType)}>
            <SelectTrigger className="h-12 text-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="Lunch">☀️ Lunch</SelectItem>
              <SelectItem value="Evening Snacks">🍵 Evening Snacks</SelectItem>
              <SelectItem value="Dinner">🌙 Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            <CalendarDays className="h-4 w-4 text-muted-foreground" /> Quick Select by Day (JNU Menu)
          </Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button key={day} onClick={() => handleDaySelect(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedDay === day ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-medium">Menu Items <span className="text-xs text-muted-foreground ml-2">({selected.length} selected)</span></Label>
          <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
            {availableDishes.map(item => (
              <label key={item} className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${selected.includes(item) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                <Checkbox checked={selected.includes(item)} onCheckedChange={() => toggle(item)} />
                <span className="font-medium text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Advanced Preferences */}
        {selected.length > 0 && (
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between text-sm font-medium text-muted-foreground hover:text-foreground h-10 px-3">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Advanced Preferences (Optional)
                </span>
                {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-3">
              <p className="text-xs text-muted-foreground">
                Adjust uptake percentages based on your experience. Leave defaults for auto-prediction.
              </p>

              {/* Non-veg ratio */}
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">🍗 Non-Veg Eaters</Label>
                  <span className="text-sm font-bold text-primary">{nvOverride}%</span>
                </div>
                <Slider
                  value={[nvOverride]}
                  onValueChange={([v]) => setNvOverride(v)}
                  min={10} max={100} step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">% of students who eat non-veg items</p>
              </div>

              {/* Side dish preference sliders */}
              {selectedSides.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Side Dish Uptake</Label>
                  <div className="max-h-[200px] overflow-y-auto space-y-3 pr-1">
                    {selectedSides.map(dish => (
                      <div key={dish} className="space-y-1 p-2.5 rounded-lg bg-muted/30 border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate mr-2">{dish}</span>
                          <span className="text-sm font-bold text-primary shrink-0">{Math.round(getEffectivePref(dish))}%</span>
                        </div>
                        <Slider
                          value={[getEffectivePref(dish)]}
                          onValueChange={([v]) => setPref(dish, v)}
                          min={10} max={100} step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" className="w-full text-xs"
                onClick={() => { setPrefOverrides({}); setNvOverride(NON_VEG_EATER_RATIO * 100); }}>
                <RotateCcw className="h-3 w-3 mr-1" /> Reset to Defaults
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={() => {
            const n = parseInt(students);
            if (n > 0 && selected.length > 0) {
              onPredict(n, meal, selected, buildOverrides(), nvOverride / 100);
            }
          }}
            className="flex-1 h-12 text-base font-semibold" disabled={!students || parseInt(students) <= 0 || selected.length === 0}>
            <Calculator className="h-4 w-4 mr-2" /> Predict Requirement
          </Button>
          <Button onClick={handleReset} variant="outline" className="h-12 px-6"><RotateCcw className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Results Panel ─── */
function ResultsPanel({ output }: { output: PredictionOutput | null }) {
  if (!output) {
    return (
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground space-y-3 p-8">
          <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto">
            <Package className="h-8 w-8 opacity-40" />
          </div>
          <p className="text-lg font-semibold text-foreground">No prediction yet</p>
          <p className="text-sm">Configure your meal and click "Predict" to see results</p>
        </div>
      </Card>
    );
  }
  const materials = Object.entries(output.totalMaterials);
  const totalKg = materials.reduce((s, [, v]) => s + v.qty, 0).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/15 to-primary/5 overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-3xl" />
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{output.adjustedStudents}</p>
            <p className="text-xs text-muted-foreground font-medium">Adjusted Students</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/15 to-accent/5 overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent/10 rounded-bl-3xl" />
            <TrendingDown className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold text-accent">{(output.attendanceRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground font-medium">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
          <CardContent className="p-4 text-center relative">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-3xl" />
            <Scale className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{materials.length}</p>
            <p className="text-xs text-muted-foreground font-medium">Material Types</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            Total Raw Materials Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {materials.map(([name, { qty, unit }]) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                <span className="font-medium text-sm truncate mr-2">{name}</span>
                <Badge className="text-sm font-bold px-3 py-1 bg-primary text-primary-foreground shrink-0 shadow-sm">{qty} {unit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-accent" />
            </div>
            Dish-wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {output.results.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-primary to-primary/60 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{r.material}</p>
                    <p className="text-xs text-muted-foreground">for {r.dish}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm font-bold px-2.5 py-1 shrink-0 border-primary/20">{r.quantity} {r.unit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



/* ─── Main Page ─── */
const Index = () => {
  const [output, setOutput] = useState<PredictionOutput | null>(null);
  const [lastMeal, setLastMeal] = useState<MealType | null>(null);
  const [lastStudents, setLastStudents] = useState<number | null>(null);
  const [lastItems, setLastItems] = useState<string[]>([]);
  const [customDishes, setCustomDishes] = useState<DishInfo[]>([]);
  const [removedDishes, setRemovedDishes] = useState<string[]>([]);
  const [useLearned, setUseLearned] = useState(true);

  const handlePredict = (students: number, meal: MealType, items: string[], prefOverrides?: Record<string, number>, nvOverride?: number) => {
    const learned = useLearned ? computeLearnedAdjustments() : {};
    const result = predict(students, meal, items, prefOverrides, nvOverride);

    // Apply dish-level learned adjustments to all raw materials of that dish
    if (Object.keys(learned).length > 0) {
      for (const r of result.results) {
        const adj = learned[r.dish];
        if (adj && adj.samples >= 2) {
          r.quantity = r.unit === 'pcs'
            ? Math.ceil(r.quantity * adj.factor)
            : parseFloat((r.quantity * adj.factor).toFixed(2));
        }
      }
      // Recalculate totals
      const newTotals: Record<string, { qty: number; unit: string }> = {};
      for (const r of result.results) {
        if (!newTotals[r.material]) newTotals[r.material] = { qty: 0, unit: r.unit };
        newTotals[r.material].qty += r.quantity;
      }
      for (const k of Object.keys(newTotals)) {
        newTotals[k].qty = newTotals[k].unit === 'pcs'
          ? Math.ceil(newTotals[k].qty)
          : parseFloat(newTotals[k].qty.toFixed(2));
      }
      result.totalMaterials = newTotals;
    }

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">Smart Mess Predictor</h1>
              <p className="text-xs text-muted-foreground">JNU Hostel Mess — Raw Material Prediction &amp; Food Waste Optimization</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Smart Learning</span>
              <Switch checked={useLearned} onCheckedChange={setUseLearned} />
            </div>
          <ManageMenuDialog
            customDishes={customDishes}
            removedDishes={removedDishes}
            onAddDish={handleAddDish}
            onRemoveDish={handleRemoveDish}
            onRestoreDish={handleRestoreDish}
          />
          </div>
        </div>
      </header>
      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <PredictionForm onPredict={handlePredict} onReset={() => { setOutput(null); setLastMeal(null); setLastStudents(null); setLastItems([]); }} customDishes={customDishes} removedDishes={removedDishes} />
          </div>
          <div className="lg:col-span-3"><ResultsPanel output={output} /></div>
        </div>
        
        <PostMealFeedback
          lastPrediction={output}
          lastMeal={lastMeal}
          lastStudents={lastStudents}
          lastItems={lastItems}
        />
      </main>
    </div>
  );
};

export default Index;
