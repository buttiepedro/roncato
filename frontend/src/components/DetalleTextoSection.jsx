import React from 'react';

export default function DetalleTextoSection({ detailText }) {
	return (
		<div className="rounded-2xl border border-slate-200 p-4">
			<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detalle</p>
			<p className="mt-3 whitespace-pre-wrap leading-6 text-slate-700">
				{detailText || 'Este pedido no tiene detalle adicional.'}
			</p>
		</div>
	);
}
