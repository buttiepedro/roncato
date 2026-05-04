from flask import Blueprint, jsonify
from ..models import EntregaParcial, OrderProduct, db
from ..utils.auth import token_required
from datetime import datetime

partial_delivery_bp = Blueprint('partial_delivery', __name__)


@partial_delivery_bp.route('/api/entregas-parciales', methods=['GET'])
@token_required
def get_entregas_parciales():
    entregas = EntregaParcial.query.order_by(
        EntregaParcial.completed.asc(),
        EntregaParcial.created_at.desc()
    ).all()
    return jsonify([e.to_dict() for e in entregas])


@partial_delivery_bp.route('/api/entregas-parciales/<int:id>/complete', methods=['PATCH'])
@token_required
def complete_entrega_parcial(id):
    entrega = EntregaParcial.query.get(id)
    if not entrega:
        return jsonify({'error': 'Entrega parcial no encontrada'}), 404

    order = entrega.order
    if not order:
        return jsonify({'error': 'Pedido no encontrado para esta entrega parcial'}), 404

    products = OrderProduct.query.filter_by(order_id=order.id).all()
    has_missing = any((p.quantity_delivered or 0) < (p.quantity_ordered or 0) for p in products)
    if has_missing:
        return jsonify({'error': 'Aun hay productos pendientes por entregar'}), 400

    entrega.completed = True
    entrega.completed_at = datetime.utcnow()
    order.partial_delivery = False
    order.status = 'delivered'
    db.session.commit()
    return jsonify(entrega.to_dict())
