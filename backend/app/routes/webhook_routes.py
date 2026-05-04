from flask import Blueprint, request, jsonify
from ..models import Order, User, Product, OrderProduct, db
from ..extensions import socketio
import json

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


def _validated_armador(value):
    armador = _employee_name(value)
    if armador is None:
        return None, None

    # Accept username directly.
    exists = User.query.filter_by(username=armador).first()
    if exists:
        return exists.username, None

    # Accept numeric id and resolve to username for storage consistency.
    try:
        armador_id = int(armador)
    except (TypeError, ValueError):
        armador_id = None

    if armador_id is not None:
        exists = User.query.get(armador_id)
        if exists:
            return exists.username, None

    return None, f'Armador "{armador}" no existe'


def _parse_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _has_products_payload(data):
    return 'productos' in data or 'products' in data


def _products_payload(data):
    if 'productos' in data:
        return data.get('productos') or []
    if 'products' in data:
        return data.get('products') or []
    return []


def _build_order_products(raw_items):
    if raw_items is None:
        return [], None

    # n8n can send productos as JSON string if toJsonString() is used.
    if isinstance(raw_items, str):
        try:
            raw_items = json.loads(raw_items)
        except json.JSONDecodeError:
            return None, 'productos/products no tiene JSON valido'

    if not isinstance(raw_items, list):
        return None, 'productos/products debe ser una lista'

    items = []
    for idx, raw in enumerate(raw_items, start=1):
        if not isinstance(raw, dict):
            return None, f'Item #{idx} inválido: debe ser un objeto'

        product_id = raw.get('productId', raw.get('productoId', raw.get('id')))
        if product_id is None:
            return None, f'Item #{idx} inválido: productId es requerido'

        product_id = _parse_int(product_id, None)
        if product_id is None:
            return None, f'Item #{idx} inválido: productId debe ser numerico'

        product = Product.query.get(product_id)
        if not product:
            return None, f'Item #{idx} inválido: producto {product_id} no existe'

        quantity_ordered = _parse_int(raw.get('quantityOrdered', raw.get('cantidad', 1)), 1)
        quantity_delivered = _parse_int(raw.get('quantityDelivered', raw.get('cantidadEntregada', 0)), 0)
        if quantity_ordered < 0 or quantity_delivered < 0:
            return None, f'Item #{idx} inválido: cantidades no pueden ser negativas'

        items.append(
            OrderProduct(
                product_id=product.id,
                quantity_ordered=quantity_ordered,
                quantity_delivered=quantity_delivered,
                ubication=raw.get('ubication') or product.default_ubication
            )
        )

    return items, None

@webhook_bp.route('/webhook/order', methods=['POST'])
def webhook_new_order():
    data = request.json or {}
    armo_pedido, armador_error = _validated_armador(data.get('armoPedido'))
    if armador_error:
        return jsonify({'error': armador_error}), 400

    product_items, product_error = _build_order_products(_products_payload(data))
    if product_error:
        return jsonify({'error': product_error}), 400

    new_order = Order(
        id=data.get('id'),
        title=data.get('title', 'Pedido'),
        details=data.get('details', ''),
        cliente=data.get('cliente', 'Cliente sin nombre'),
        monto=data.get('monto', 0),
        status='incoming',
        armo_pedido=armo_pedido,
        partial_delivery=_as_bool(data.get('partialDelivery', False))
    )
    db.session.add(new_order)
    db.session.flush()

    for item in product_items:
        item.order_id = new_order.id
        db.session.add(item)

    db.session.commit()
    
    socketio.emit('order_created', new_order.to_dict())
    return jsonify({'ok': True, 'order': new_order.to_dict()})

@webhook_bp.route('/webhook/order-update', methods=['POST'])
def webhook_update_order():
    data = request.json or {}
    order = Order.query.get(data.get('id'))
    if not order: return jsonify({'error': 'Order not found'}), 404

    for key in ['title', 'details', 'cliente', 'monto']:
        if key in data: setattr(order, key, data[key])
    if 'armoPedido' in data:
        armo_pedido, armador_error = _validated_armador(data.get('armoPedido'))
        if armador_error:
            return jsonify({'error': armador_error}), 400
        order.armo_pedido = armo_pedido
    if 'partialDelivery' in data:
        order.partial_delivery = _as_bool(data.get('partialDelivery'))

    if _has_products_payload(data):
        product_items, product_error = _build_order_products(_products_payload(data))
        if product_error:
            return jsonify({'error': product_error}), 400

        OrderProduct.query.filter_by(order_id=order.id).delete(synchronize_session=False)
        for item in product_items:
            item.order_id = order.id
            db.session.add(item)
    
    db.session.commit()
    socketio.emit('order_updated', order.to_dict())
    return jsonify({'ok': True, 'order': order.to_dict()})