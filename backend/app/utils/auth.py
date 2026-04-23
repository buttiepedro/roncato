import jwt 
from flask_jwt_extended import get_jwt
from flask import request, jsonify, current_app
from functools import wraps

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Browsers send unauthenticated CORS preflight requests; they must not be blocked.
        if request.method == 'OPTIONS':
            return current_app.make_default_options_response()

        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split(" ")
            if len(auth_header) == 2: token = auth_header[1]
        
        if not token:
            return jsonify({'error': 'Missing Authorization'}), 401
        try:
            # Usamos current_app para sacar el secret de la config
            data = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            request.user = data
        except:
            return jsonify({'error': 'Invalid token'}), 401
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        claims = get_jwt() # Esto obtiene el contenido del token decodificado
        if claims.get('role') == 'admin':
            return f(*args, **kwargs)
        return jsonify({"msg": "Acceso restringido: Solo admin"}), 403
    return wrapper