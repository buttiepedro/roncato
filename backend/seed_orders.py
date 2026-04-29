from app import create_app
from app.extensions import db
from app.models import Order, Product, OrderProduct

app = create_app()

def seed():
    with app.app_context():
        db.create_all()

        # Limpiar relaciones y pedidos para dejar una base consistente.
        deleted_links = OrderProduct.query.delete()
        deleted = Order.query.delete()
        db.session.commit()
        print(f"Deleted {deleted_links} order-product link(s) and {deleted} order(s).")

        catalog = [
            {"name": "Milanesa napolitana", "default_ubication": "Cocina caliente"},
            {"name": "Papas fritas", "default_ubication": "Freidora"},
            {"name": "Coca-Cola 500ml", "default_ubication": "Heladera bebidas"},
            {"name": "Pizza muzzarella", "default_ubication": "Horno"},
            {"name": "Empanadas de carne", "default_ubication": "Horno"},
            {"name": "Cerveza artesanal IPA", "default_ubication": "Heladera bebidas"},
        ]

        products_by_name = {}
        for item in catalog:
            product = Product.query.filter_by(name=item["name"]).first()
            if not product:
                product = Product(
                    name=item["name"],
                    default_ubication=item["default_ubication"]
                )
                db.session.add(product)
                db.session.flush()
            products_by_name[item["name"]] = product

        orders_data = [
            {
                "order": Order(
                    title="Pedido Mesa 5",
                    details="Cliente con intolerancia al gluten. No agregar pan.",
                    cliente="Martin Garcia",
                    monto=4500.0,
                    status="preparing",
                    armo_pedido="Carlos Mendez",
                ),
                "items": [
                    {"product": "Milanesa napolitana", "quantity_ordered": 2, "quantity_delivered": 1},
                    {"product": "Papas fritas", "quantity_ordered": 1, "quantity_delivered": 0},
                    {"product": "Coca-Cola 500ml", "quantity_ordered": 2, "quantity_delivered": 0},
                ],
            },
            {
                "order": Order(
                    title="Pedido Delivery #42",
                    details="Entregar en Av. Corrientes 1234, piso 3. Timbre B.",
                    cliente="Laura Fernandez",
                    monto=3200.0,
                    status="incoming",
                    armo_pedido="Sofia Torres",
                ),
                "items": [
                    {"product": "Pizza muzzarella", "quantity_ordered": 1, "quantity_delivered": 0},
                    {"product": "Empanadas de carne", "quantity_ordered": 6, "quantity_delivered": 0},
                    {"product": "Cerveza artesanal IPA", "quantity_ordered": 3, "quantity_delivered": 0},
                ],
            },
            {
                "order": Order(
                    title="Pedido Mesa 12",
                    details="Pedir cubiertos extras. Mesa de 4 personas.",
                    cliente="Roberto Alvarez",
                    monto=6800.0,
                    status="incoming",
                    armo_pedido="Valeria Rios",
                ),
                "items": [
                    {"product": "Milanesa napolitana", "quantity_ordered": 4, "quantity_delivered": 0},
                    {"product": "Papas fritas", "quantity_ordered": 2, "quantity_delivered": 0},
                    {"product": "Coca-Cola 500ml", "quantity_ordered": 4, "quantity_delivered": 0},
                ],
            },
            {
                "order": Order(
                    title="Pedido Delivery #58",
                    details="Sin cebolla en todo el pedido.",
                    cliente="Ana Benitez",
                    monto=2750.0,
                    status="preparing",
                    armo_pedido="Ezequiel Romero",
                ),
                "items": [
                    {"product": "Empanadas de carne", "quantity_ordered": 12, "quantity_delivered": 6},
                    {"product": "Cerveza artesanal IPA", "quantity_ordered": 2, "quantity_delivered": 0},
                ],
            },
            {
                "order": Order(
                    title="Pedido Mesa 3",
                    details="Cliente VIP, prioridad alta.",
                    cliente="Diego Morales",
                    monto=5100.0,
                    status="delivered",
                    armo_pedido="Luciana Paredes",
                ),
                "items": [
                    {"product": "Pizza muzzarella", "quantity_ordered": 2, "quantity_delivered": 2},
                    {"product": "Cerveza artesanal IPA", "quantity_ordered": 4, "quantity_delivered": 4},
                    {"product": "Papas fritas", "quantity_ordered": 2, "quantity_delivered": 2},
                ],
            },
            {
                "order": Order(
                    title="Pedido Delivery #63",
                    details="Alergia al maní. Verificar ingredientes.",
                    cliente="Carla Jimenez",
                    monto=1900.0,
                    status="incoming",
                    armo_pedido="Nicolas Suarez",
                ),
                "items": [
                    {"product": "Milanesa napolitana", "quantity_ordered": 1, "quantity_delivered": 0},
                    {"product": "Coca-Cola 500ml", "quantity_ordered": 2, "quantity_delivered": 0},
                ],
            },
        ]

        for entry in orders_data:
            order = entry["order"]
            db.session.add(order)
            db.session.flush()

            for item in entry["items"]:
                product = products_by_name[item["product"]]
                db.session.add(
                    OrderProduct(
                        order_id=order.id,
                        product_id=product.id,
                        quantity_ordered=item["quantity_ordered"],
                        quantity_delivered=item["quantity_delivered"],
                        ubication=product.default_ubication,
                    )
                )

        db.session.commit()
        print(f"Created {len(orders_data)} sample orders with related products.")

if __name__ == "__main__":
    seed()
