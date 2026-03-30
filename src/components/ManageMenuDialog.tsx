import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Settings2, X } from 'lucide-react';
import type { MealType, DishInfo } from '@/lib/prediction';

interface RawMaterialInput {
  name: string;
  perPerson: string;
  unit: string;
}

interface ManageMenuDialogProps {
  customDishes: DishInfo[];
  removedDishes: string[];
  onAddDish: (dish: DishInfo, materials: { name: string; perPerson: number; unit: string }[]) => void;
  onRemoveDish: (dishName: string) => void;
  onRestoreDish: (dishName: string) => void;
}

const MEAL_OPTIONS: MealType[] = ['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'];
const UNIT_OPTIONS = ['kg', 'litres', 'pcs'];

export default function ManageMenuDialog({
  customDishes, removedDishes, onAddDish, onRemoveDish, onRestoreDish,
}: ManageMenuDialogProps) {
  const [open, setOpen] = useState(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Settings2 className="h-4 w-4" /> Manage Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Menu Items</DialogTitle>
          <DialogDescription>Add new dishes or remove existing ones when the menu changes.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab('add')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'add' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Plus className="h-3.5 w-3.5 inline mr-1" />Add Dish
          </button>
          <button onClick={() => setTab('removed')}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'removed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Trash2 className="h-3.5 w-3.5 inline mr-1" />Removed ({removedDishes.length})
          </button>
        </div>

        {tab === 'add' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="font-medium">Dish Name</Label>
              <Input value={dishName} onChange={e => setDishName(e.target.value)} placeholder="e.g. Paneer Tikka" />
            </div>

            <div className="space-y-1.5">
              <Label className="font-medium">Meal Type(s)</Label>
              <div className="flex flex-wrap gap-2">
                {MEAL_OPTIONS.map(m => (
                  <button key={m} onClick={() => toggleMeal(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${meals.includes(m) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}>
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
                    <Input value={mat.name} onChange={e => updateMat(i, 'name', e.target.value)} placeholder="Material name" className="text-sm h-9" />
                  </div>
                  <div className="w-20">
                    <Input type="number" step="0.01" min="0" value={mat.perPerson} onChange={e => updateMat(i, 'perPerson', e.target.value)} className="text-sm h-9" />
                  </div>
                  <Select value={mat.unit} onValueChange={v => updateMat(i, 'unit', v)}>
                    <SelectTrigger className="w-20 h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {materials.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeMat(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMat} className="w-full gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Material
              </Button>
            </div>

            <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full gap-1.5">
              <Plus className="h-4 w-4" /> Add Dish to Menu
            </Button>

            {customDishes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs text-muted-foreground">Custom Dishes Added</Label>
                <div className="flex flex-wrap gap-1.5">
                  {customDishes.map(d => (
                    <Badge key={d.name} variant="secondary" className="gap-1 pr-1">
                      {d.name}
                      <button onClick={() => onRemoveDish(d.name)} className="ml-0.5 hover:text-destructive">
                        <X className="h-3 w-3" />
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
              <p className="text-sm text-muted-foreground text-center py-6">No dishes have been removed.</p>
            ) : (
              removedDishes.map(name => (
                <div key={name} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50">
                  <span className="font-medium text-sm">{name}</span>
                  <Button variant="outline" size="sm" onClick={() => onRestoreDish(name)} className="gap-1 h-7 text-xs">
                    Restore
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
