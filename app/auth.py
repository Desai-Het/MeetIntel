from functools import wraps
from flask import session, redirect, url_for, g
from app.config import config
from app.database import supabase

def signup(email, password, full_name):
    res = supabase.auth.sign_up({"email": email, "password": password})
    user = res.user
    if user:
        supabase.table("user_profiles").insert({
            "id": user.id,
            "full_name": full_name
        }).execute()
    return res

def login(email, password):
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    return res

def logout():
    try:
        supabase.auth.sign_out()
    except:
        pass
    session.clear()

def get_current_user():
    if config.DEV_MODE:
        return {"id": "dev-user-id-123", "email": "dev@example.com"}
    token = session.get("access_token")
    if not token:
        return None
    try:
        user_response = supabase.auth.get_user(token)
        if user_response and user_response.user:
            return user_response.user
    except Exception:
        return None
    return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if config.DEV_MODE:
            g.user_id = "dev-user-id-123"
            return f(*args, **kwargs)
        
        token = session.get("access_token")
        if not token:
            return redirect(url_for("auth.login_view"))
        
        try:
            user_response = supabase.auth.get_user(token)
            if user_response and user_response.user:
                g.user_id = user_response.user.id
            else:
                session.clear()
                return redirect(url_for("auth.login_view"))
        except Exception:
            session.clear()
            return redirect(url_for("auth.login_view"))

        return f(*args, **kwargs)
    return decorated_function
