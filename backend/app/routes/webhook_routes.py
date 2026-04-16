from flask import Blueprint, request, jsonify
from ..models import Order, db
from ..extensions import socketio

webhook_bp = Blueprint('webhooks', __name__)

@webhook_bp.route('/webhook/order', methods=['POST'])
def webhook_new_order():
    data = request.json
    new_order = Order(
        id=data.get('id'),
        title=data.get('title', 'Pedido'),
        details=data.get('details', ''),
        cliente=data.get('cliente', 'Cliente sin nombre'),
        monto=data.get('monto', 0),
        productos=data.get('productos', []),
        status='incoming',
        color=data.get('color')
    )
    db.session.add(new_order)
    db.session.commit()
    
    socketio.emit('order_created', new_order.to_dict())
    return jsonify({'ok': True, 'order': new_order.to_dict()})

@webhook_bp.route('/webhook/order-update', methods=['POST'])
def webhook_update_order():
    data = request.json
    order = Order.query.get(data.get('id'))
    if not order: return jsonify({'error': 'Order not found'}), 404

    for key in ['title', 'details', 'cliente', 'monto', 'productos', 'color']:
        if key in data: setattr(order, key, data[key])
    
    db.session.commit()
    socketio.emit('order_updated', order.to_dict())
    return jsonify({'ok': True, 'order': order.to_dict()})