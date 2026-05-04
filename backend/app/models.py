from .extensions import db
from datetime import datetime
import uuid

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), default='user')

    def to_dict(self):
        return {"id": self.id, "username": self.username, "role": self.role}

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(200))
    details = db.Column(db.Text)
    cliente = db.Column(db.String(100))
    monto = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='incoming')
    last_operator = db.Column(db.String(80), nullable=True)
    armo_pedido = db.Column(db.String(80), nullable=True)
    partial_delivery = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @staticmethod
    def _safe_iso(dt):
        return dt.isoformat() if dt else None

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, 
            "details": self.details,
            "cliente": self.cliente, 
            "monto": self.monto, 
            "status": self.status, 
            "lastOperator": self.last_operator,
            "armoPedido": self.armo_pedido,
            "partialDelivery": self.partial_delivery,
            "createdAt": self._safe_iso(self.created_at), 
            "updatedAt": self._safe_iso(self.updated_at)
        }


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    default_ubication = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "defaultUbication": self.default_ubication
        }


class OrderProduct(db.Model):
    __tablename__ = 'order_products'
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), primary_key=True)
    quantity_ordered = db.Column(db.Integer, default=1)
    quantity_delivered = db.Column(db.Integer, default=0)
    ubication = db.Column(db.String(100), nullable=True)

    order = db.relationship('Order', backref=db.backref('order_products', cascade='all, delete-orphan'))
    product = db.relationship('Product', backref=db.backref('order_products', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            "orderId": self.order_id,
            "productId": self.product_id,
            "quantityOrdered": self.quantity_ordered,
            "quantityDelivered": self.quantity_delivered,
            "ubication": self.ubication,
            "product": self.product.to_dict() if self.product else None
        }


class EntregaParcial(db.Model):
    __tablename__ = 'entregas_parciales'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(36), db.ForeignKey('orders.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    order = db.relationship('Order', backref=db.backref('entregas_parciales', cascade='all, delete-orphan'))

    def to_dict(self):
        missing_products = [
            op.to_dict() for op in self.order.order_products
            if op.quantity_delivered < op.quantity_ordered
        ] if self.order else []
        return {
            "id": self.id,
            "orderId": self.order_id,
            "order": self.order.to_dict() if self.order else None,
            "missingProducts": missing_products,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "completed": self.completed,
            "completedAt": self.completed_at.isoformat() if self.completed_at else None,
        }