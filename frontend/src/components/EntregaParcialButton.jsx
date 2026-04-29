import React from 'react';

export default function EntregaParcialButton({ partialDelivery, saving, hasMissingProducts, onToggle }) {
	return (
		<button
			type="button"
			onClick={() => onToggle(!partialDelivery)}
			disabled={saving || (!hasMissingProducts && !partialDelivery)}
			className={`cursor-pointer rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${partialDelivery ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'}`}
			aria-label={partialDelivery ? 'Desmarcar entrega parcial' : 'Marcar como entrega parcial'}
		>
			{partialDelivery ? '⚡ Entrega parcial' : 'Marcar entrega parcial'}
		</button>
	);
}
