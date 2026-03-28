import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MENU_ITEMS, type MealType, type MenuItem } from '@/lib/prediction';
import { Users, Utensils, Calculator, RotateCcw } from 'lucide-react';

interface Props {
  onPredict: (students: number, meal: MealType, items: MenuItem[]) => void;
  onReset: () => void;
}

export function PredictionForm({ onPredict, onReset }: Props) {
  const [students, setStudents] = useState<string>('300');
  const [meal, setMeal] = useState<MealType>('Lunch');
  const [selected, setSelected] = useState<MenuItem[]>(['Rice', 'Dal', 'Roti']);

  const toggle = (item: MenuItem) => {
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
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
      <CardContent className="space-y-6">
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
          <Select value={meal} onValueChange={v => setMeal(v as MealType)}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
              <SelectItem value="Lunch">☀️ Lunch</SelectItem>
              <SelectItem value="Dinner">🌙 Dinner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <Label className="font-medium">Menu Items</Label>
          <div className="grid grid-cols-2 gap-3">
            {MENU_ITEMS.map(item => (
              <label
                key={item}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
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
