import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings2, X, RotateCcw } from 'lucide-react';
import type { MealType, DishInfo } from '@/lib/prediction';

interface RawMaterialInput {
  name: string;
  perPerson: string;
  unit: string;
}

interface MenuManagementProps {
  customDishes: DishInfo[];
  removedDishes: string[];
  onAddDish: (dish: DishInfo, materials: { name: string; perPerson: number; unit: string }[]) => void;
  onRemoveDish: (dishName: string) => void;
  onRestoreDish: (dishName: string) => void;
}

const MEAL_OPTIONS: MealType[] = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
const UNIT_OPTIONS = ['kg', 'litres', 'pcs'];

export default function MenuManagement({ customDishes, removedDishes, onAddDish, onRemoveDish, onRestoreDish }: MenuManagementProps) {
  const [tab, setTab] = useState<'add' | 'removed'>('add');
  const [dishName, setDishName] = useState('');
  const [meals, setMeals] = useState<MealType[]>([]);
  const [materials, setMaterials] = useState<RawMaterialInput[]>([
    { name: '', perPerson: '0.10', unit: 'kg' },
  ]);

  const toggleMeal = (m: MealType) =>
    setMeals(p => (p.includes(m) ? p.filter(x => x !== m) : [...p, m]));

  const updateMat = (i: number, field: keyof RawMaterialInput, val: string) =>
    setMaterials(p => p.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));

  const removeMat = (i: number) => setMaterials(p => p.filter((_, idx) => idx !== i));
  const addMat = () => setMaterials(p => [...p, { name: '', perPerson: '0.10', unit: 'kg' }]);

  const canSubmit = dishName.trim() && meals.length > 0 && materials.every(m => m.name.trim() && parseFloat(m.perPerson) > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAddDish(
      { name: dishName.trim(), meals },
      materials.map(m => ({ name: m.name.trim(), perPerson: parseFloat(m.perPerson), unit: m.unit })),
    );
    setDishName('');
    setMeals([]);
    setMaterials([{ name: '', perPerson: '0.10', unit: 'kg' }]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="h-4 w-4 text-primary" />
            </div>
            Manage Menu Items
          </CardTitle>
          <p className="text-sm text-muted-foreground">Add new dishes or remove existing ones when the menu changes.</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex gap-2">
            <button onClick={() => setTab('add')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'add' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
              <Plus className="h-3.5 w-3.5 inline mr-1.5" />Add Dish
            </button>
            <button onClick={() => setTab('removed')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'removed' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
              <Trash2 className="h-3.5 w-3.5 inline mr-1.5" />Removed ({removedDishes.length})
            </button>
          </div>

          {tab === 'add' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="font-medium">Dish Name</Label>
                <Input value={dishName} onChange={e => setDishName(e.target.value)} placeholder="e.g. Paneer Tikka" className="h-11" />
              </div>

              <div className="space-y-1.5">
                <Label className="font-medium">Meal Type(s)</Label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_OPTIONS.map(m => (
                    <button key={m} onClick={() => toggleMeal(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${meals.includes(m) ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-medium">Raw Materials (per person)</Label>
                {materials.map((mat, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input value={mat.name} onChange={e => updateMat(i, 'name', e.target.value)} placeholder="Material name" className="text-sm h-10" />
                    </div>
                    <div className="w-20">
                      <Input type="number" step="0.01" min="0" value={mat.perPerson} onChange={e => updateMat(i, 'perPerson', e.target.value)} className="text-sm h-10" />
                    </div>
                    <Select value={mat.unit} onValueChange={v => updateMat(i, 'unit', v)}>
                      <SelectTrigger className="w-20 h-10 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {materials.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => removeMat(i)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addMat} className="w-full gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add Material
                </Button>
              </div>

              <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full h-12 gap-1.5 font-semibold text-base">
                <Plus className="h-4 w-4" /> Add Dish to Menu
              </Button>

              {customDishes.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <Label className="text-sm text-muted-foreground">Custom Dishes Added</Label>
                  <div className="flex flex-wrap gap-2">
                    {customDishes.map(d => (
                      <Badge key={d.name} variant="secondary" className="gap-1.5 pr-1.5 text-sm py-1">
                        {d.name}
                        <button onClick={() => onRemoveDish(d.name)} className="ml-0.5 hover:text-destructive transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'removed' && (
            <div className="space-y-2">
              {removedDishes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <RotateCcw className="h-8 w-8 mx-auto opacity-30 mb-3" />
                  <p className="font-medium text-foreground">No dishes removed</p>
                  <p className="text-sm">Removed dishes will appear here for easy restoration.</p>
                </div>
              ) : (
                removedDishes.map(name => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border hover:bg-muted/60 transition-colors">
                    <span className="font-medium text-sm">{name}</span>
                    <Button variant="outline" size="sm" onClick={() => onRestoreDish(name)} className="gap-1 h-8 text-xs">
                      <RotateCcw className="h-3 w-3" /> Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
