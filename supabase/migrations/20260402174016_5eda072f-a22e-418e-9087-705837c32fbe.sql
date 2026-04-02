CREATE TABLE public.feedback_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  meal TEXT NOT NULL,
  students INTEGER NOT NULL,
  dishes JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON public.feedback_entries FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.feedback_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.feedback_entries FOR DELETE USING (true);