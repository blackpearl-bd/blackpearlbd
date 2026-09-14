-- Enable RLS on destinations table (was missed in initial migration 001)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active destinations (for the cascading form)
CREATE POLICY "Destinations are viewable by everyone"
  ON destinations FOR SELECT
  USING (is_active = true);

-- Admins can view all destinations (including inactive)
CREATE POLICY "Admins can view all destinations"
  ON destinations FOR SELECT
  USING (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));

-- Admins can manage destinations
CREATE POLICY "Admins can manage destinations"
  ON destinations FOR ALL
  USING (exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  ));
