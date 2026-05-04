from flask import Blueprint, request, jsonify
from ..models import Order, Product, OrderProduct, EntregaParcial, User, db
from ..utils.auth import admin_required, token_required
from ..services.order_service import notify_status_change
from datetime import datetime

order_bp = Blueprint('orders', __name__)
VALID_STATUSES = {'incoming', 'preparing', 'delivered'}


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


def _validated_armador(value):
    armador = _employee_name(value)
    if armador is None:
        return None, None

    exists = User.query.filter_by(username=armador).first()
    if not exists:
        return None, f'Armador "{armador}" no existe'
    return armador, None

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

    armo_pedido, armador_error = _validated_armador(data.get('armoPedido'))
    if armador_error:
        return jsonify({'error': armador_error}), 400

    order = Order(
        id=data.get('id'),
        title=data.get('title', 'Pedido'),
        details=data.get('details', ''),
        cliente=data.get('cliente', 'Cliente sin nombre'),
        monto=data.get('monto', 0),
        status=status,
        armo_pedido=armo_pedido,
        partial_delivery=_as_bool(data.get('partialDelivery', False))
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

    # Si se mueve a 'delivered' y hay productos faltantes, crear EntregaParcial
    if new_status == 'delivered':
        products = OrderProduct.query.filter_by(order_id=order.id).all()
        has_missing = any(p.quantity_delivered < p.quantity_ordered for p in products)
        if has_missing:
            order.partial_delivery = True
            entrega = EntregaParcial(order_id=order.id)
            db.session.add(entrega)

    db.session.commit()
    
    notify_status_change(order) # Lógica n8n y sockets movida a service
    return jsonify(order.to_dict())

@order_bp.route('/api/orders/<id>', methods=['PUT'])
@token_required
def update_product_order(id):
    order = Order.query.get(id)
    if not order: return jsonify({'error': 'Order not found'}), 404

    data = request.json or {}
    if 'title' in data:
        order.title = data['title']
    if 'details' in data:
        order.details = data['details']
    if 'cliente' in data:
        order.cliente = data['cliente']
    if 'monto' in data:
        order.monto = data['monto']
    if 'armoPedido' in data:
        armo_pedido, armador_error = _validated_armador(data.get('armoPedido'))
        if armador_error:
            return jsonify({'error': armador_error}), 400
        order.armo_pedido = armo_pedido
    if 'partialDelivery' in data:
        order.partial_delivery = _as_bool(data.get('partialDelivery'))
    
    db.session.commit()
    return jsonify(order.to_dict())


@order_bp.route('/api/orders/<id>', methods=['DELETE'])
@token_required
@admin_required
def delete_order(id):
    order = Order.query.get(id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    db.session.delete(order)
    db.session.commit()
    return jsonify({'ok': True}), 200


@order_bp.route('/api/orders/<order_id>/products', methods=['GET'])
@token_required
def get_order_products(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    items = OrderProduct.query.filter_by(order_id=order_id).all()
    return jsonify([item.to_dict() for item in items]), 200


@order_bp.route('/api/orders/<order_id>/products', methods=['POST'])
@token_required
def add_product_to_order(order_id):
    order = Order.query.get(order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    data = request.json or {}
    product_id = data.get('productId')
    if product_id is None:
        return jsonify({'error': 'productId is required'}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    item = OrderProduct.query.filter_by(order_id=order_id, product_id=product_id).first()
    if item:
        return jsonify({'error': 'Product already exists in order'}), 409

    item = OrderProduct(
        order_id=order_id,
        product_id=product_id,
        quantity_ordered=data.get('quantityOrdered', 1),
        quantity_delivered=data.get('quantityDelivered', 0),
        ubication=data.get('ubication') or product.default_ubication
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201


@order_bp.route('/api/orders/<order_id>/products/<int:product_id>', methods=['PUT'])
@token_required
def update_order_product(order_id, product_id):
    item = OrderProduct.query.filter_by(order_id=order_id, product_id=product_id).first()
    if not item:
        return jsonify({'error': 'Order product not found'}), 404

    data = request.json or {}
    if 'quantityOrdered' in data:
        item.quantity_ordered = data['quantityOrdered']
    if 'quantityDelivered' in data:
        item.quantity_delivered = data['quantityDelivered']
    if 'ubication' in data:
        item.ubication = data['ubication']

    db.session.commit()
    return jsonify(item.to_dict()), 200


@order_bp.route('/api/orders/<order_id>/products/<int:product_id>', methods=['DELETE'])
@token_required
def delete_order_product(order_id, product_id):
    item = OrderProduct.query.filter_by(order_id=order_id, product_id=product_id).first()
    if not item:
        return jsonify({'error': 'Order product not found'}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({'ok': True}), 200