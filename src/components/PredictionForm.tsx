import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDishesForMeal, WEEKLY_MENU, type MealType } from '@/lib/prediction';
import { Users, Utensils, Calculator, RotateCcw, CalendarDays } from 'lucide-react';

interface Props {
  onPredict: (students: number, meal: MealType, items: string[]) => void;
  onReset: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function PredictionForm({ onPredict, onReset }: Props) {
  const [students, setStudents] = useState<string>('300');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('');

  const availableDishes = getDishesForMeal(meal);

  const toggle = (item: string) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleMealChange = (v: MealType) => {
    setMeal(v);
    setSelected([]);
    setSelectedDay('');
  };

  const handleDaySelect = (day: string) => {
    if (day === selectedDay) {
      setSelectedDay('');
      setSelected([]);
      return;
    }
    setSelectedDay(day);
    const dayMenu = WEEKLY_MENU.find(d => d.day === day);
    if (dayMenu) {
      const dishes = dayMenu[meal] || [];
      setSelected(dishes.filter(d => availableDishes.includes(d)));
    }
  };

  const handlePredict = () => {
    const n = parseInt(students);
    if (n > 0 && selected.length > 0) {
      onPredict(n, meal, selected);
    }
  };

  const handleReset = () => {
    setStudents('300');
    setMeal('Lunch');
    setSelected([]);
    setSelectedDay('');
    onReset();
  };

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Utensils className="h-5 w-5 text-primary" />
          Meal Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Students */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 text-muted-foreground" />
            Number of Students
          </Label>
          <Input
            type="number"
            min={1}
            value={students}
            onChange={e => setStudents(e.target.value)}
            placeholder="Enter student count"
            className="text-lg h-12"
          />
        </div>

        {/* Meal Type */}
        <div className="space-y-2">
          <Label className="font-medium">Meal Type</Label>
          <Select value={meal} onValueChange={v => handleMealChange(v as MealType)}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="Lunch">☀️ Lunch</SelectItem>
              <SelectItem value="Evening Snacks">🍵 Evening Snacks</SelectItem>
              <SelectItem value="Dinner">🌙 Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Day Select */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 font-medium">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            Quick Select by Day (JNU Menu)
          </Label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => handleDaySelect(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-primary/10'
                }`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <Label className="font-medium">
            Menu Items
            <span className="text-xs text-muted-foreground ml-2">
              ({selected.length} selected)
            </span>
          </Label>
          <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2">
            {availableDishes.map(item => (
              <label
                key={item}
                className={`flex items-center gap-3 p-2.5 rounded-lg border-2 cursor-pointer transition-all ${
                  selected.includes(item)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Checkbox
                  checked={selected.includes(item)}
                  onCheckedChange={() => toggle(item)}
                />
                <span className="font-medium text-sm">{item}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={handlePredict}
            className="flex-1 h-12 text-base font-semibold"
            disabled={!students || parseInt(students) <= 0 || selected.length === 0}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Predict Requirement
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 px-6"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
