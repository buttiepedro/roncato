from flask import Flask
from sqlalchemy import inspect, text
from .config import Config
from .extensions import db, socketio, cors, jwt


def ensure_orders_columns():
    inspector = inspect(db.engine)
    raw_columns = inspector.get_columns('orders')
    columns = {column['name'] for column in raw_columns}
    if 'last_operator' not in columns:
        db.session.execute(text('ALTER TABLE orders ADD COLUMN last_operator VARCHAR(80)'))
        db.session.commit()
    if 'armo_pedido' not in columns:
        db.session.execute(text('ALTER TABLE orders ADD COLUMN armo_pedido VARCHAR(80)'))
        db.session.commit()
    else:
        armo_column = next((column for column in raw_columns if column['name'] == 'armo_pedido'), None)
        type_name = str(armo_column['type']).upper() if armo_column else ''
        if 'BOOLEAN' in type_name:
            db.session.execute(text("""
                ALTER TABLE orders
                ALTER COLUMN armo_pedido TYPE VARCHAR(80)
                USING CASE
                    WHEN armo_pedido IS TRUE THEN 'Sin asignar'
                    ELSE NULL
                END
            """))
            db.session.execute(text('ALTER TABLE orders ALTER COLUMN armo_pedido DROP DEFAULT'))
            db.session.commit()
    if 'partial_delivery' not in columns:
        db.session.execute(text('ALTER TABLE orders ADD COLUMN partial_delivery BOOLEAN DEFAULT FALSE'))
        db.session.commit()

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
    from .routes.product_routes import product_bp
    from .routes.webhook_routes import webhook_bp
    from .routes.user import user_bp
    from .routes.partial_delivery_routes import partial_delivery_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(webhook_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(partial_delivery_bp)

    with app.app_context():
        db.create_all()
        ensure_orders_columns()

    return app
