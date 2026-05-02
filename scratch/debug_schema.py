import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    # Try to select one row to see the columns
    res = supabase.table("meetings").select("*").limit(1).execute()
    if res.data:
        print("Columns found in meetings table:", res.data[0].keys())
    else:
        print("Table is empty, cannot infer columns via select.")
except Exception as e:
    print("Error querying table:", e)
