from flask import Blueprint, request, jsonify
from ..models import Order, db
from ..utils.auth import admin_required, token_required
from ..services.order_service import notify_status_change

order_bp = Blueprint('orders', __name__)

@order_bp.route('/api/orders', methods=['GET'])
@token_required
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    if not orders:
        return jsonify({'message': 'No orders found'}), 404
    return jsonify([o.to_dict() for o in orders])

@order_bp.route('/api/orders', methods=['POST'])
@token_required
@admin_required
def create_order():
    data = request.json
    order = Order(
        customer_name=data.get('customer_name'),
        product=data.get('product'),
        quantity=data.get('quantity'),
        status='pending'
    )
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201


@order_bp.route('/api/orders/<id>/status', methods=['POST'])
@token_required
def update_status(id):
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Order not found'}), 404
    
    order.status = request.json.get('status')
    claims = getattr(request, 'user', {})
    order.last_operator = claims.get('username')
    db.session.commit()
    
    notify_status_change(order) # Lógica n8n y sockets movida a service
    return jsonify(order.to_dict())