from flask import Flask
from .config import Config
from .extensions import db, socketio, cors, jwt

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": app.config['CORS_ORIGINS']}}, supports_credentials=True)
    socketio.init_app(app)

    # Registro de Blueprints (Rutas)
    from .routes.auth_routes import auth_bp
    from .routes.order_routes import order_bp
    from .routes.webhook_routes import webhook_bp
    from .routes.user import user_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(webhook_bp)
    app.register_blueprint(user_bp)

    return app