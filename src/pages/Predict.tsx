import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { apiPredict, apiGetDishes, apiGetWeeklyMenu, apiGetConfig, apiGetLearnedAdjustments } from '@/lib/api';
import type { MealType, PredictionOutput, DishInfo } from '@/lib/prediction';
import {
  Users, Utensils, Calculator, RotateCcw, CalendarDays,
  Package, TrendingDown, Scale, SlidersHorizontal, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface PredictPageProps {
  customDishes: DishInfo[];
  removedDishes: string[];
  useLearned: boolean;
  onPredictionMade: (output: PredictionOutput, meal: MealType, students: number, items: string[]) => void;
}

export default function PredictPage({ customDishes, removedDishes, useLearned, onPredictionMade }: PredictPageProps) {
  const [students, setStudents] = useState('300');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [prefOverrides, setPrefOverrides] = useState<Record<string, number>>({});
  const [nvOverride, setNvOverride] = useState(70);
  const [output, setOutput] = useState<PredictionOutput | null>(null);
  const [loading, setLoading] = useState(false);

  // Server-fetched data
  const [availableDishes, setAvailableDishes] = useState<string[]>([]);
  const [weeklyMenu, setWeeklyMenu] = useState<any[]>([]);
  const [config, setConfig] = useState<{ preferenceFactor: Record<string, number>; nonVegEaterRatio: number; sideDishes: string[] } | null>(null);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch config once
  useEffect(() => {
    apiGetConfig().then(c => {
      setConfig(c);
      setNvOverride(c.nonVegEaterRatio * 100);
    }).catch(() => {});
    apiGetWeeklyMenu().then(setWeeklyMenu).catch(() => {});
  }, []);

  // Fetch dishes when meal changes
  useEffect(() => {
    apiGetDishes(meal, customDishes, removedDishes).then(setAvailableDishes).catch(() => {});
  }, [meal, customDishes, removedDishes]);

  const sideDishesSet = new Set(config?.sideDishes || []);
  const selectedSides = selected.filter(i => sideDishesSet.has(i));

  const toggle = (item: string) =>
    setSelected(p => (p.includes(item) ? p.filter(i => i !== item) : [...p, item]));

  const handleMealChange = (v: MealType) => { setMeal(v); setSelected([]); setSelectedDay(''); };

  const handleDaySelect = (day: string) => {
    if (day === selectedDay) { setSelectedDay(''); setSelected([]); return; }
    setSelectedDay(day);
    const dm = weeklyMenu.find((d: any) => d.day === day);
    if (dm) setSelected((dm[meal] || []).filter((d: string) => availableDishes.includes(d)));
  };

  const handleReset = () => {
    setStudents('300'); setMeal('Lunch'); setSelected([]); setSelectedDay('');
    setPrefOverrides({}); setNvOverride((config?.nonVegEaterRatio || 0.70) * 100); setOutput(null);
  };

  const getEffectivePref = (dish: string) => {
    if (dish in prefOverrides) return prefOverrides[dish];
    return ((config?.preferenceFactor[dish]) ?? 0.75) * 100;
  };

  const setPref = (dish: string, val: number) => {
    setPrefOverrides(p => ({ ...p, [dish]: val }));
  };

  const buildOverrides = () => {
    if (Object.keys(prefOverrides).length === 0) return undefined;
    const o: Record<string, number> = {};
    for (const [k, v] of Object.entries(prefOverrides)) o[k] = v / 100;
    return o;
  };

  // Build custom dish materials map for edge function
  const buildCustomMaterials = () => {
    // We need to pass custom dish materials to the edge function
    // These are registered client-side via registerDishMaterials
    // For simplicity, we'll track them in parent state and pass them through
    return undefined; // Custom dishes handled via customDishes prop
  };

  const handlePredict = async () => {
    const n = parseInt(students);
    if (n <= 0 || selected.length === 0) return;

    setLoading(true);
    try {
      // Get learned adjustments from server if enabled
      let learned: Record<string, { factor: number; samples: number }> | undefined;
      if (useLearned) {
        try {
          learned = await apiGetLearnedAdjustments();
          if (Object.keys(learned).length === 0) learned = undefined;
        } catch {
          learned = undefined;
        }
      }

      const result = await apiPredict(
        n, meal, selected,
        buildOverrides(),
        nvOverride / 100,
        undefined,
        learned,
      );
      setOutput(result);
      onPredictionMade(result, meal, n, selected);
    } catch (err) {
      toast.error('Prediction failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const materials = output ? Object.entries(output.totalMaterials) : [];

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Form */}
      <div className="lg:col-span-2">
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

            {selected.length > 0 && config && (
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between text-sm font-medium text-muted-foreground hover:text-foreground h-10 px-3">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" /> Advanced Preferences (Optional)
                    </span>
                    {advancedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <p className="text-xs text-muted-foreground">Adjust uptake percentages based on your experience.</p>
                  <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">🍗 Non-Veg Eaters</Label>
                      <span className="text-sm font-bold text-primary">{nvOverride}%</span>
                    </div>
                    <Slider value={[nvOverride]} onValueChange={([v]) => setNvOverride(v)} min={10} max={100} step={5} />
                    <p className="text-xs text-muted-foreground">% of students who eat non-veg items</p>
                  </div>
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
                            <Slider value={[getEffectivePref(dish)]} onValueChange={([v]) => setPref(dish, v)} min={10} max={100} step={5} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full text-xs"
                    onClick={() => { setPrefOverrides({}); setNvOverride((config?.nonVegEaterRatio || 0.70) * 100); }}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Reset to Defaults
                  </Button>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={handlePredict} className="flex-1 h-12 text-base font-semibold"
                disabled={!students || parseInt(students) <= 0 || selected.length === 0 || loading}>
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Calculator className="h-4 w-4 mr-2" />}
                {loading ? 'Predicting...' : 'Predict Requirement'}
              </Button>
              <Button onClick={handleReset} variant="outline" className="h-12 px-6"><RotateCcw className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {!output ? (
          <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 flex items-center justify-center min-h-[300px]">
            <div className="text-center text-muted-foreground space-y-3 p-8">
              <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto">
                <Package className="h-8 w-8 opacity-40" />
              </div>
              <p className="text-lg font-semibold text-foreground">No prediction yet</p>
              <p className="text-sm">Configure your meal and click "Predict" to see results</p>
            </div>
          </Card>
        ) : (
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
        )}
      </div>
    </div>
  );
}
