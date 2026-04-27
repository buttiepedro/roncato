from app import create_app
from app.extensions import db
from app.models import Order

app = create_app()

def seed():
    with app.app_context():
        db.create_all()

        # Limpiar pedidos existentes
        deleted = Order.query.delete()
        db.session.commit()
        print(f"🗑️  {deleted} pedido(s) eliminado(s).")

        orders = [
            Order(
                title="Pedido Mesa 5",
                details="Cliente con intolerancia al gluten. No agregar pan.",
                cliente="Martín García",
                monto=4500.0,
                status="preparing",
                color="blue",
                productos=[
                    {"nombre": "Milanesa napolitana", "detalle": "Sin gluten", "cantidad": 2, "listo": False},
                    {"nombre": "Papas fritas", "detalle": "Porción grande", "cantidad": 1, "listo": False},
                    {"nombre": "Coca-Cola 500ml", "detalle": None, "cantidad": 2, "listo": False},
                    {"nombre": "Agua mineral", "detalle": "Con gas", "cantidad": 1, "listo": False},
                ],
            ),
            Order(
                title="Pedido Delivery #42",
                details="Entregar en Av. Corrientes 1234, piso 3. Timbre B.",
                cliente="Laura Fernández",
                monto=3200.0,
                status="incoming",
                color="green",
                productos=[
                    {"nombre": "Pizza muzzarella", "detalle": "Borde relleno", "cantidad": 1, "listo": False},
                    {"nombre": "Empanadas de carne", "detalle": "Repulgue marca X", "cantidad": 6, "listo": False},
                    {"nombre": "Cerveza artesanal", "detalle": "IPA 500ml", "cantidad": 3, "listo": False},
                ],
            ),
        ]

        for o in orders:
            db.session.add(o)
        db.session.commit()
        print(f"✅ {len(orders)} pedidos creados con productos.")

if __name__ == "__main__":
    seed()
