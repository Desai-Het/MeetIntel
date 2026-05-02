import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", os.urandom(24))
    DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    LANGEXTRACT_API_KEY = os.getenv("LANGEXTRACT_API_KEY")
    
    # Email / SMTP
    SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    EMAIL_USER = os.getenv("EMAIL_USER")
    EMAIL_PASSWORD_RAW = os.getenv("EMAIL_PASSWORD", "")
    
    # Supabase
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # Derived
    @property
    def EMAIL_PASSWORD(self):
        return self.EMAIL_PASSWORD_RAW.replace(" ", "")

config = Config()
