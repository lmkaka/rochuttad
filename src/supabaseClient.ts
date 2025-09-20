import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://ealjleuhfmspxuyalusb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhbGpsZXVoZm1zcHh1eWFsdXNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MTkyNzMsImV4cCI6MjA3MzQ5NTI3M30.0neMFTSLJSkB6_CXjw3r_PzhmTMLLHDBDhdph_M3Cjs'
)
