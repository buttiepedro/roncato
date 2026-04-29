from flask import Blueprint, request, jsonify
from ..models import Order, db
from ..extensions import socketio

webhook_bp = Blueprint('webhooks', __name__)


def _employee_name(value):
    if value is None:
        return None
    name = str(value).strip()
    return name if name else None


def _as_bool(value):
    if isinstance(value, bool):
        return value
    if value is None:
        return False
    if isinstance(value, str):
        return value.strip().lower() in {'1', 'true', 'yes', 'si'}
    return bool(value)

@webhook_bp.route('/webhook/order', methods=['POST'])
def webhook_new_order():
    data = request.json
    new_order = Order(
        id=data.get('id'),
        title=data.get('title', 'Pedido'),
        details=data.get('details', ''),
        cliente=data.get('cliente', 'Cliente sin nombre'),
        monto=data.get('monto', 0),
        status='incoming',
        armo_pedido=_employee_name(data.get('armoPedido')),
        partial_delivery=_as_bool(data.get('partialDelivery', False))
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

    for key in ['title', 'details', 'cliente', 'monto']:
        if key in data: setattr(order, key, data[key])
    if 'armoPedido' in data:
        order.armo_pedido = _employee_name(data.get('armoPedido'))
    if 'partialDelivery' in data:
        order.partial_delivery = _as_bool(data.get('partialDelivery'))
    
    db.session.commit()
    socketio.emit('order_updated', order.to_dict())
    return jsonify({'ok': True, 'order': order.to_dict()})