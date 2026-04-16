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
    productos = db.Column(db.JSON, default=list)
    status = db.Column(db.String(50), default='incoming')
    color = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id, "title": self.title, "details": self.details,
            "cliente": self.cliente, "monto": self.monto, "productos": self.productos,
            "status": self.status, "color": self.color,
            "createdAt": self.created_at.isoformat(), "updatedAt": self.updated_at.isoformat()
        }