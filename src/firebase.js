import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dnpeszhmwtyckqiswztr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRucGVzemhtd3R5Y2txaXN3enRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDMzMzcsImV4cCI6MjA4ODExOTMzN30.Fl31zGYnh3JyFTkt4e9eZL3TDbslnk1qMhYoLAt3I74';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
