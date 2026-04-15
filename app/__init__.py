import os
from flask import Flask
from app.config import config

def create_app():
    # We specify template and static folders relative to the root if needed,
    # or rely on default structure. Since we are in app/, and static/templates
    # are in the root, we point back to them.
    app = Flask(__name__, 
                template_folder="../templates", 
                static_folder="../static")
    
    app.secret_key = config.SECRET_KEY

    # Register Blueprints
    from app.routes import main_bp
    app.register_blueprint(main_bp)

    return app
