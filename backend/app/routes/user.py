from flask import Blueprint, request, jsonify
from app.utils.auth import admin_required, token_required
from app.models import User
from app.extensions import db

user_bp = Blueprint("users", __name__)

# Esta línea protege TODAS las rutas que pertenezcan a este blueprint
@user_bp.before_request
@token_required
def check_jwt():
  pass

@user_bp.route('/api/users', methods=['GET'])
def get_users():
    users = User.query.all() # Esto te da una lista de objetos User
    
    # Convertimos cada objeto en un diccionario usando el método que creamos
    users_list = [user.to_dict() for user in users]
    
    return jsonify(users_list), 200

@user_bp.route('/api/users', methods=['POST'])
@admin_required
def create_user():
    data = request.json
    if User.query.filter_by(username=data.get('username')).first():
        return jsonify({'error': 'Username already exists'}), 400
    new_user = User(
        username=data.get('username'),
        password=data.get('password'),
        role=data.get('role', 'user')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(new_user.to_dict()), 201

@user_bp.route('/api/users/<id>', methods=['DELETE'])
@admin_required
def delete_user(id):
    user = User.query.get(id)
    if not user: return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'ok': True})

# Ruta para actualizar contraseña y nombre de usuario ambos campos son opcionales
@user_bp.route('/api/users/<id>', methods=['PUT'])
@admin_required
def update_user(id):
    user = User.query.get(id)
    if not user: return jsonify({'error': 'User not found'}), 404
    
    data = request.json
    if 'username' in data:
        existing = User.query.filter_by(username=data['username']).first()
        if existing and existing.id != user.id:
            return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']
    if 'password' in data:
        user.password = data['password']
    if 'role' in data:
        user.role = data['role']
    
    db.session.commit()
    return jsonify(user.to_dict()), 200
