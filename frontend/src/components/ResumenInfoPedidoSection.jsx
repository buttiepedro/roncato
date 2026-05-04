import React from 'react';
import EntregaParcialButton from './EntregaParcialButton.jsx';
import InfoDatoCard from './InfoDatoCard.jsx';

const statusLabels = {
	incoming: 'Entrante',
	preparing: 'En preparacion',
	delivered: 'Entregado',
};

export default function ResumenInfoPedidoSection({
	order,
	totalOrdered,
	totalDelivered,
	partialDelivery,
	savingPartialDelivery,
	hasMissingProducts,
	onTogglePartialDelivery,
}) {
	return (
		<>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				<InfoDatoCard
					label="Estado"
					value={statusLabels[order.status] || order.status}
					containerClassName="rounded-2xl border border-slate-200 bg-slate-50 p-4"
				/>
				<InfoDatoCard
					label="Cliente"
					value={order.cliente || 'Sin cliente asignado'}
					containerClassName="rounded-2xl border border-slate-200 bg-slate-50 p-4"
				/>
				<InfoDatoCard
					label="Monto"
					value={`$${order.monto ?? 0}`}
					containerClassName="rounded-2xl border border-slate-200 bg-slate-50 p-4"
					valueClassName="mt-2 text-base font-semibold text-emerald-600"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<InfoDatoCard
					label="Ultimo operario"
					value={order.lastOperator || '-'}
				/>
				<InfoDatoCard
					label="Armador"
					value={order.armoPedido || 'Sin armador asignado'}
				/>
				<InfoDatoCard
					label="ID"
					value={order.id}
					valueClassName="mt-2 break-all font-mono text-xs text-slate-700"
				/>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<InfoDatoCard
					label="Total ordenado"
					value={totalOrdered}
				/>
				<InfoDatoCard
					label="Total entregado"
					value={totalDelivered}
					valueClassName="mt-2 text-base font-semibold text-emerald-600"
				/>
				<EntregaParcialButton
					partialDelivery={partialDelivery}
					saving={savingPartialDelivery}
					hasMissingProducts={hasMissingProducts}
					onToggle={onTogglePartialDelivery}
				/>
			</div>
		</>
	);
}
