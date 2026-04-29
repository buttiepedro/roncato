from flask import Blueprint, request, jsonify
from ..models import Product, db
from ..utils.auth import token_required, admin_required

product_bp = Blueprint('products', __name__)


@product_bp.route('/api/products', methods=['GET'])
@token_required
def get_products():
    products = Product.query.order_by(Product.name.asc()).all()
    return jsonify([product.to_dict() for product in products]), 200


@product_bp.route('/api/products/<int:product_id>', methods=['GET'])
@token_required
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict()), 200


@product_bp.route('/api/products', methods=['POST'])
@token_required
@admin_required
def create_product():
    data = request.json or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({'error': 'name is required'}), 400

    product = Product(
        name=name,
        default_ubication=data.get('defaultUbication')
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@product_bp.route('/api/products/<int:product_id>', methods=['PUT'])
@token_required
@admin_required
def update_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    data = request.json or {}
    if 'name' in data:
        name = (data.get('name') or '').strip()
        if not name:
            return jsonify({'error': 'name cannot be empty'}), 400
        product.name = name

    if 'defaultUbication' in data:
        product.default_ubication = data.get('defaultUbication')

    db.session.commit()
    return jsonify(product.to_dict()), 200


@product_bp.route('/api/products/<int:product_id>', methods=['DELETE'])
@token_required
@admin_required
def delete_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    db.session.delete(product)
    db.session.commit()
    return jsonify({'ok': True}), 200
