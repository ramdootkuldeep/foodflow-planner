import { Link, useLocation } from 'react-router-dom';
import { Leaf, Calculator, ClipboardCheck, Settings2, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/predict', label: 'Predict', icon: Calculator },
  { path: '/feedback', label: 'Feedback', icon: ClipboardCheck },
  { path: '/menu', label: 'Menu', icon: Settings2 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-foreground leading-tight">Smart Mess Predictor</h1>
              <p className="text-[10px] text-muted-foreground hidden sm:block">JNU Hostel Mess — Raw Material Prediction</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === path
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
