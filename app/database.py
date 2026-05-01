import os
from supabase import create_client, Client
from app.config import config

# Singleton Supabase Client
# Using SERVICE_ROLE_KEY to bypass RLS for administrative backend tasks
supabase: Client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
