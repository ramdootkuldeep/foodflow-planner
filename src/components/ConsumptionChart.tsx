import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SAMPLE_DATA } from '@/lib/prediction';
import { BarChart3 } from 'lucide-react';

export function ConsumptionChart() {
  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Weekly Consumption Trends (Sample Data)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={SAMPLE_DATA} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 88%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: 'Students', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
            />
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
