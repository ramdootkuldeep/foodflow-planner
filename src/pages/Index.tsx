import { useState } from 'react';
import { PredictionForm } from '@/components/PredictionForm';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ConsumptionChart } from '@/components/ConsumptionChart';
import { predict, type MealType, type MenuItem, type PredictionOutput } from '@/lib/prediction';
import { Leaf } from 'lucide-react';

const Index = () => {
  const [output, setOutput] = useState<PredictionOutput | null>(null);

  const handlePredict = (students: number, meal: MealType, items: MenuItem[]) => {
    setOutput(predict(students, meal, items));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
              Smart Mess Predictor
            </h1>
            <p className="text-xs text-muted-foreground">
              Raw Material Prediction &amp; Food Waste Optimization
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <PredictionForm onPredict={handlePredict} onReset={() => setOutput(null)} />
          </div>
          {/* Right: Results */}
          <div className="lg:col-span-3">
            <ResultsPanel output={output} />
          </div>
        </div>

        {/* Chart */}
        <ConsumptionChart />
      </main>
    </div>
  );
};

export default Index;
