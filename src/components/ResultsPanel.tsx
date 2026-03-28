import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PredictionOutput } from '@/lib/prediction';
import { Package, Users, TrendingDown } from 'lucide-react';

interface Props {
  output: PredictionOutput | null;
}

export function ResultsPanel({ output }: Props) {
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
  const totalKg = materials.reduce((s, [, v]) => s + v, 0).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
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
            <TrendingDown className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold" style={{ color: 'hsl(36, 80%, 45%)' }}>{(output.attendanceRate * 100).toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">Attendance Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-primary/5">
          <CardContent className="p-4 text-center">
            <Package className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{totalKg} kg</p>
            <p className="text-xs text-muted-foreground">Total Materials</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Raw Material Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {output.results.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-semibold text-sm">{r.material}</p>
                    <p className="text-xs text-muted-foreground">for {r.dish}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-base font-bold px-3 py-1 bg-primary text-primary-foreground">
                  {r.quantity} kg
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
