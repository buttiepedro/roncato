from flask import Blueprint, request, jsonify
from ..models import Order, db
from ..utils.auth import admin_required, token_required
from ..services.order_service import notify_status_change

order_bp = Blueprint('orders', __name__)
VALID_STATUSES = {'incoming', 'preparing', 'delivered'}

@order_bp.route('/api/orders', methods=['GET'])
@token_required
def get_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([o.to_dict() for o in orders])

@order_bp.route('/api/orders', methods=['POST'])
@token_required
@admin_required
def create_order():
    data = request.json or {}
    status = data.get('status', 'incoming')
    if status not in VALID_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400

    order = Order(
        id=data.get('id'),
        title=data.get('title', 'Pedido'),
        details=data.get('details', ''),
        cliente=data.get('cliente', 'Cliente sin nombre'),
        monto=data.get('monto', 0),
        productos=data.get('productos', []),
        status=status,
        color=data.get('color')
    )
    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201


@order_bp.route('/api/orders/<id>/status', methods=['POST'])
@token_required
def update_status(id):
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Order not found'}), 404

    data = request.json or {}
    new_status = data.get('status')
    if new_status not in VALID_STATUSES:
        return jsonify({'error': 'Invalid status'}), 400

    order.status = new_status
    claims = getattr(request, 'user', {})
    order.last_operator = claims.get('username')
    db.session.commit()
    
    notify_status_change(order) # Lógica n8n y sockets movida a service
    return jsonify(order.to_dict())

@order_bp.route('/api/orders/<id>', methods=['PUT'])
@token_required
def update_product_order(id):
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Order not found'}), 404

    data = request.json or {}
    for field in ['productos']:
        if field in data:
            setattr(order, field, data[field])
    
    db.session.commit()
    return jsonify(order.to_dict())