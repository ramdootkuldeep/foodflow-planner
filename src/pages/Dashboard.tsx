import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, ClipboardCheck, Settings2, BrainCircuit, TrendingDown, Utensils } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getFeedbackStats, loadFeedbackHistory } from '@/lib/prediction';
import { useEffect, useState } from 'react';

interface DashboardProps {
  useLearned: boolean;
  onToggleLearned: (v: boolean) => void;
}

export default function Dashboard({ useLearned, onToggleLearned }: DashboardProps) {
  const [stats, setStats] = useState(getFeedbackStats());
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    setStats(getFeedbackStats());
    setFeedbackCount(loadFeedbackHistory().length);
  }, []);

  const features = [
    {
      path: '/predict',
      icon: Calculator,
      title: 'Predict Materials',
      description: 'Configure meal type, student count, and menu items to predict raw material requirements.',
      color: 'from-primary/15 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      path: '/feedback',
      icon: ClipboardCheck,
      title: 'Post-Meal Feedback',
      description: 'Record actual consumption and waste data to improve future predictions.',
      color: 'from-accent/15 to-accent/5',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      path: '/menu',
      icon: Settings2,
      title: 'Manage Menu',
      description: 'Add custom dishes, remove items, or restore previously removed dishes.',
      color: 'from-secondary/15 to-secondary/5',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Smart Learning Toggle */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Smart Learning</h2>
                <p className="text-sm text-muted-foreground">
                  {useLearned
                    ? 'Predictions adjust based on past feedback data'
                    : 'Using default prediction logic (no feedback adjustments)'}
                </p>
              </div>
            </div>
            <Switch checked={useLearned} onCheckedChange={onToggleLearned} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/15 to-primary/5">
          <CardContent className="p-5 text-center">
            <Utensils className="h-6 w-6 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-primary">{feedbackCount}</p>
            <p className="text-sm text-muted-foreground font-medium">Feedback Entries</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-destructive/15 to-destructive/5">
          <CardContent className="p-5 text-center">
            <TrendingDown className="h-6 w-6 mx-auto text-destructive mb-2" />
            <p className="text-3xl font-bold text-destructive">{stats.avgWastePercent}%</p>
            <p className="text-sm text-muted-foreground font-medium">Avg. Waste</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/15 to-accent/5">
          <CardContent className="p-5 text-center">
            <BrainCircuit className="h-6 w-6 mx-auto text-accent mb-2" />
            <p className="text-3xl font-bold text-accent">{useLearned ? 'ON' : 'OFF'}</p>
            <p className="text-sm text-muted-foreground font-medium">Smart Learning</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map(({ path, icon: Icon, title, description, color, iconBg, iconColor }) => (
          <Link key={path} to={path} className="group">
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${color} h-full hover:shadow-xl transition-all hover:-translate-y-1`}>
              <CardContent className="p-6 space-y-4">
                <div className={`h-12 w-12 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
