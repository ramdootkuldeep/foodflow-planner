import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  predict, getDishesForMeal, WEEKLY_MENU, SAMPLE_DATA,
  registerDishMaterials, unregisterDishMaterials,
  type MealType, type PredictionOutput, type DishInfo,
} from '@/lib/prediction';
import ManageMenuDialog from '@/components/ManageMenuDialog';
import {
  Leaf, Users, Utensils, Calculator, RotateCcw, CalendarDays,
  Package, TrendingDown, Scale, BarChart3,
} from 'lucide-react';

/* ─── Prediction Form ─── */
function PredictionForm({ onPredict, onReset, customDishes, removedDishes }: {
  onPredict: (s: number, m: MealType, i: string[]) => void;
  onReset: () => void;
  customDishes: DishInfo[];
  removedDishes: string[];
}) {
  const [students, setStudents] = useState('300');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState('');
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

  const handleReset = () => { setStudents('300'); setMeal('Lunch'); setSelected([]); setSelectedDay(''); onReset(); };

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Utensils className="h-5 w-5 text-primary" /> Meal Configuration
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
        <div className="flex gap-3 pt-2">
          <Button onClick={() => { const n = parseInt(students); if (n > 0 && selected.length > 0) onPredict(n, meal, selected); }}
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
      <Card className="shadow-lg border-0 bg-card flex items-center justify-center min-h-[300px]">
        <div className="text-center text-muted-foreground space-y-2 p-8">
          <Package className="h-12 w-12 mx-auto opacity-40" />
          <p className="text-lg font-medium">No prediction yet</p>
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
        <Card className="border-0 shadow-md bg-primary/10">
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{output.adjustedStudents}</p>
            <p className="text-xs text-muted-foreground">Adjusted Students</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-accent/10">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-5 w-5 mx-auto mb-1" style={{ color: 'hsl(36, 80%, 45%)' }} />
            <p className="text-2xl font-bold" style={{ color: 'hsl(36, 80%, 45%)' }}>{(output.attendanceRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-primary/5">
          <CardContent className="p-4 text-center">
            <Scale className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{materials.length}</p>
            <p className="text-xs text-muted-foreground">Material Types</p>
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Total Raw Materials Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {materials.map(([name, { qty, unit }]) => (
              <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                <span className="font-medium text-sm truncate mr-2">{name}</span>
                <Badge className="text-sm font-bold px-3 py-1 bg-primary text-primary-foreground shrink-0">{qty} {unit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Dish-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {output.results.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{r.material}</p>
                    <p className="text-xs text-muted-foreground">for {r.dish}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm font-bold px-2 py-0.5 shrink-0">{r.quantity} {r.unit}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


/* ─── Consumption Chart ─── */
function ConsumptionChart() {
  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Weekly Consumption Trends (Sample Data)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={SAMPLE_DATA} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey="Breakfast" fill="hsl(36, 80%, 55%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Lunch" fill="hsl(145, 45%, 32%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Dinner" fill="hsl(210, 70%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */
const Index = () => {
  const [output, setOutput] = useState<PredictionOutput | null>(null);
  const [customDishes, setCustomDishes] = useState<DishInfo[]>([]);
  const [removedDishes, setRemovedDishes] = useState<string[]>([]);
  const handlePredict = (students: number, meal: MealType, items: string[]) => setOutput(predict(students, meal, items));

  const handleAddDish = (dish: DishInfo, materials: { name: string; perPerson: number; unit: string }[]) => {
    setCustomDishes(p => [...p.filter(d => d.name !== dish.name), dish]);
    registerDishMaterials(dish.name, materials);
    // If it was previously removed, restore it
    setRemovedDishes(p => p.filter(n => n !== dish.name));
  };

  const handleRemoveDish = (name: string) => {
    // If it's a custom dish, just remove it entirely
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
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">Smart Mess Predictor</h1>
              <p className="text-xs text-muted-foreground">JNU Hostel Mess — Raw Material Prediction &amp; Food Waste Optimization</p>
            </div>
          </div>
          <ManageMenuDialog
            customDishes={customDishes}
            removedDishes={removedDishes}
            onAddDish={handleAddDish}
            onRemoveDish={handleRemoveDish}
            onRestoreDish={handleRestoreDish}
          />
        </div>
      </header>
      <main className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <PredictionForm onPredict={handlePredict} onReset={() => setOutput(null)} customDishes={customDishes} removedDishes={removedDishes} />
          </div>
          <div className="lg:col-span-3"><ResultsPanel output={output} /></div>
        </div>
        
        <ConsumptionChart />
      </main>
    </div>
  );
};

export default Index;
