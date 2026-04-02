import { corsHeaders } from '@supabase/supabase-js/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'save';

    if (req.method === 'POST' && action === 'save') {
      const body = await req.json();
      const { meal, students, dishes } = body;

      const { error } = await supabase.from('feedback_entries').insert({
        meal,
        students,
        dishes, // JSONB column
      });

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'history') {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({ entries: data || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'stats') {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('dishes')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const entries = data || [];
      let totalCooked = 0;
      let totalWasted = 0;
      const wasteByDish: Record<string, { total: number; count: number; unit: string }> = {};

      for (const entry of entries) {
        for (const dish of entry.dishes as any[]) {
          const cooked = dish.actualConsumed + dish.wasted;
          totalCooked += cooked;
          totalWasted += dish.wasted;
          if (!wasteByDish[dish.dish]) wasteByDish[dish.dish] = { total: 0, count: 0, unit: dish.unit };
          wasteByDish[dish.dish].total += dish.wasted;
          wasteByDish[dish.dish].count += 1;
        }
      }

      const topWasted = Object.entries(wasteByDish)
        .map(([dish, d]) => ({ dish, avgWaste: parseFloat((d.total / d.count).toFixed(2)), unit: d.unit }))
        .sort((a, b) => b.avgWaste - a.avgWaste)
        .slice(0, 5);

      return new Response(JSON.stringify({
        totalEntries: entries.length,
        avgWastePercent: totalCooked > 0 ? parseFloat(((totalWasted / totalCooked) * 100).toFixed(1)) : 0,
        topWasted,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET' && action === 'learned-adjustments') {
      const { data, error } = await supabase
        .from('feedback_entries')
        .select('dishes')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const agg: Record<string, { totalPredicted: number; totalActual: number; count: number }> = {};
      for (const entry of (data || [])) {
        for (const dish of entry.dishes as any[]) {
          if (dish.predictedServing <= 0) continue;
          if (!agg[dish.dish]) agg[dish.dish] = { totalPredicted: 0, totalActual: 0, count: 0 };
          agg[dish.dish].totalPredicted += dish.predictedServing;
          agg[dish.dish].totalActual += dish.actualConsumed;
          agg[dish.dish].count += 1;
        }
      }

      const result: Record<string, { factor: number; samples: number }> = {};
      for (const [dish, d] of Object.entries(agg)) {
        if (d.totalPredicted > 0 && d.count >= 1) {
          const ratio = d.totalActual / d.totalPredicted;
          result[dish] = { factor: Math.max(0.5, Math.min(1.5, ratio)), samples: d.count };
        }
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'DELETE' && action === 'clear') {
      const { error } = await supabase.from('feedback_entries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
