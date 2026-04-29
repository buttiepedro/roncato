import React from 'react';
import DetalleProducto from './DetalleProducto.jsx';

export default function ProductosSection({
	loadingProducts,
	productos,
	partialDelivery,
	onToggleAdded,
	onAdjustDelivered,
	onUpdateUbication,
}) {
	return (
		<div className="rounded-2xl border border-slate-200 p-4">
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productos</p>
			{loadingProducts ? (
				<p className="mt-3 text-slate-500">Cargando productos...</p>
			) : productos.length > 0 ? (
				<div className="mt-3 space-y-3">
					{productos.map((producto) => (
						<DetalleProducto
							key={`${producto.orderId}-${producto.productId}`}
							producto={producto}
							partialDelivery={partialDelivery}
							onToggleAdded={onToggleAdded}
							onAdjustDelivered={onAdjustDelivered}
							onUpdateUbication={onUpdateUbication}
						/>
					))}
				</div>
			) : (
				<p className="mt-3 text-slate-500">No hay productos cargados para este pedido.</p>
			)}
		</div>
	);
}
