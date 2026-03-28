import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WEEKLY_MENU } from '@/lib/prediction';
import { CalendarDays } from 'lucide-react';

export function WeeklyMenuTable() {
  return (
    <Card className="shadow-lg border-0 bg-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          JNU Weekly Mess Menu (March–April 2026)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-semibold text-foreground whitespace-nowrap">Day</th>
                <th className="text-left p-3 font-semibold text-foreground">🌅 Breakfast</th>
                <th className="text-left p-3 font-semibold text-foreground">☀️ Lunch</th>
                <th className="text-left p-3 font-semibold text-foreground">🍵 Eve. Snacks</th>
                <th className="text-left p-3 font-semibold text-foreground">🌙 Dinner</th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_MENU.map((day, i) => (
                <tr key={day.day} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="p-3 font-semibold text-primary whitespace-nowrap align-top">{day.day}</td>
                  <td className="p-3 text-muted-foreground align-top">
                    {day.Breakfast.join(', ')}
                  </td>
                  <td className="p-3 text-muted-foreground align-top">
                    {day.Lunch.join(', ')}
                  </td>
                  <td className="p-3 text-muted-foreground align-top">
                    {day['Evening Snacks'].join(', ')}
                  </td>
                  <td className="p-3 text-muted-foreground align-top">
                    {day.Dinner.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
