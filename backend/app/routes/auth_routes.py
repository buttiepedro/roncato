import jwt
from datetime import datetime, timezone, timedelta
from flask import Blueprint, request, jsonify, current_app
from ..models import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data.get('username'), password=data.get('password')).first()
    if not user:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    token = jwt.encode(
        {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'exp': datetime.now(timezone.utc) + timedelta(days=1)
        },
        current_app.config['JWT_SECRET_KEY'],
        algorithm="HS256"
    )
    return jsonify({'token': token, 'user': {'id': user.id, 'username': user.username, 'role': user.role}})