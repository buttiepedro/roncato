from flask import Blueprint, request, jsonify
from ..models import Product, OrderProduct, db
from ..utils.auth import token_required, admin_required
from unidecode import unidecode
import re

product_bp = Blueprint('products', __name__)


def normalize_string(text):
    """Normalize string: lowercase, remove accents, remove special characters"""
    text = text.lower()
    text = unidecode(text)
    text = re.sub(r'[^a-z0-9]', '', text)
    return text


@product_bp.route('/api/products', methods=['GET'])
@token_required
def get_products():
    products = Product.query.order_by(Product.name.asc()).all()
    return jsonify([product.to_dict() for product in products]), 200


@product_bp.route('/api/products/search', methods=['GET'])
@token_required
def search_products():
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify([]), 200
    
    normalized_query = normalize_string(query)
    
    # Get all products and filter by normalized name
    products = Product.query.order_by(Product.name.asc()).all()
    matches = [
        product for product in products
        if normalized_query in normalize_string(product.name)
    ]
    
    return jsonify([product.to_dict() for product in matches]), 200


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
        old_default = product.default_ubication
        new_default = data.get('defaultUbication')
        product.default_ubication = new_default

        # Keep order-product ubication in sync when it still follows product default.
        # If an operator manually changed an order-product ubication, preserve it.
        sync_candidates = OrderProduct.query.filter_by(product_id=product_id).all()
        for item in sync_candidates:
            if item.ubication is None or item.ubication == old_default:
                item.ubication = new_default

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
