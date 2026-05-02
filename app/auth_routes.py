from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from app.auth import signup, login, logout

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["GET", "POST"])
def login_view():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        try:
            res = login(email, password)
            if res.session:
                session["access_token"] = res.session.access_token
            return redirect(url_for("main.results"))
        except Exception as e:
            return render_template("login.html", error=str(e))
    return render_template("login.html")

@auth_bp.route("/signup", methods=["GET", "POST"])
def signup_view():
    if request.method == "POST":
        full_name = request.form.get("full_name")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirm_password")
        
        if password != confirm_password:
            return render_template("signup.html", error="Passwords do not match.")
        
        try:
            signup(email, password, full_name)
            return redirect(url_for("auth.login_view"))
        except Exception as e:
            return render_template("signup.html", error=str(e))
    return render_template("signup.html")

@auth_bp.route("/logout")
def logout_view():
    logout()
    return redirect(url_for("auth.login_view"))
