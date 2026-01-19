-- Create location_history table for tracking user locations
CREATE TABLE public.location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  altitude DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  heading DOUBLE PRECISION,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Enable RLS
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own location history
CREATE POLICY "Users can view own location history"
ON public.location_history
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own location history
CREATE POLICY "Users can insert own location history"
ON public.location_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own location history (for sharing settings)
CREATE POLICY "Users can update own location history"
ON public.location_history
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own location history
CREATE POLICY "Users can delete own location history"
ON public.location_history
FOR DELETE
USING (auth.uid() = user_id);

-- Trusted contacts can view shared location history
CREATE POLICY "Trusted contacts can view shared locations"
ON public.location_history
FOR SELECT
USING (is_shared = true AND auth.uid() = ANY(shared_with));

-- Enable realtime for location_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_history;