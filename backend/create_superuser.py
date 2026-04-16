from app import create_app
from app.extensions import db
from app.models import User

app = create_app()

def seed():
    with app.app_context():
        # Crea tablas si no existen
        db.create_all()
        
        users = [
            {"u": "admin", "p": "admin123", "r": "admin"},
            {"u": "operario", "p": "operario123", "r": "user"}
        ]
        
        for u_data in users:
            if not User.query.filter_by(username=u_data["u"]).first():
                new_u = User(username=u_data["u"], password=u_data["p"], role=u_data["r"])
                db.session.add(new_u)
                print(f"✅ Usuario {u_data['u']} creado.")
        
        db.session.commit()
        print("🚀 DB lista.")

if __name__ == "__main__":
    seed()