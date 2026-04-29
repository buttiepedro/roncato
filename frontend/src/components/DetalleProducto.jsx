import React from 'react';

export const UBI_OPTIONS = ['Deposito', 'Negocio', 'Congelado'];

export function normalizeUbication(value) {
	return (value || '')
		.toString()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.trim();
}

export function getUbicationMeta(value) {
	const normalized = normalizeUbication(value);

	if (normalized.includes('congelado')) {
		return {
			label: 'Congelado',
			letter: 'C',
			className: 'bg-blue-300 text-blue-800 border-blue-300',
		};
	}

	if (normalized.includes('negocio')) {
		return {
			label: 'Negocio',
			letter: 'N',
			className: 'bg-orange-100 text-orange-700 border-orange-300',
		};
	}

	return {
		label: 'Deposito',
		letter: 'D',
		className: 'bg-slate-200 text-slate-700 border-slate-300',
	};
}

export function toUbicationOption(value) {
	const normalized = normalizeUbication(value);
	if (normalized.includes('congelado')) return 'Congelado';
	if (normalized.includes('negocio')) return 'Negocio';
	return 'Deposito';
}

export default function DetalleProducto({ producto, partialDelivery, onToggleAdded, onAdjustDelivered, onUpdateUbication }) {
	const defaultUbication = producto.product?.defaultUbication || 'Deposito';
	const effectiveUbication = producto.ubication || defaultUbication;
	const selectedUbication = toUbicationOption(effectiveUbication);
	const ubicationMeta = getUbicationMeta(effectiveUbication);
	const isAdded = (producto.quantityDelivered || 0) >= (producto.quantityOrdered || 0) && (producto.quantityOrdered || 0) > 0;

	return (
		<div className={`rounded-xl px-4 py-3 ${isAdded ? 'bg-emerald-50' : partialDelivery ? 'bg-amber-50' : 'bg-slate-50'}`}>
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 min-w-0">
					<button
						type="button"
						onClick={() => onToggleAdded(producto)}
						aria-label={isAdded ? 'Marcar como no agregado' : 'Marcar como agregado'}
						className={`mt-0.5 shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isAdded ? 'border-emerald-500 bg-emerald-500' : partialDelivery ? 'border-amber-400 bg-amber-100' : 'border-slate-300 bg-white hover:border-emerald-400'}`}
					>
						{isAdded && (
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-white">
								<path d="M5 13l4 4L19 7" />
							</svg>
						)}
						{!isAdded && partialDelivery && (
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-amber-600">
								<path d="M5 12h14" />
							</svg>
						)}
					</button>
					<div className="min-w-0">
						<p className={`font-semibold ${isAdded ? 'text-emerald-700 line-through decoration-emerald-400' : partialDelivery ? 'text-amber-700 line-through decoration-amber-400' : 'text-slate-800'}`}>
							{producto.product?.name || `Producto #${producto.productId}`}
						</p>
					</div>
				</div>

				<span
					className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${ubicationMeta.className}`}
					title={ubicationMeta.label}
				>
					{ubicationMeta.letter}
				</span>
			</div>

			<div className="mt-3 grid grid-cols-2 gap-2">
				<div className="text-xs text-slate-500">
					<p>Ordenada</p>
					<div className="mt-1 inline-flex min-w-20 items-center justify-center rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
						{producto.quantityOrdered ?? 0}
					</div>
				</div>
				<div className="text-xs text-slate-500">
					<p>Entregada</p>
					<div className="mt-1 inline-flex items-center overflow-hidden rounded-md border border-slate-300 bg-white">
						<button
							type="button"
							onClick={() => onAdjustDelivered(producto, -1)}
							disabled={(producto.quantityDelivered ?? 0) <= 0}
							className="h-9 w-9 bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Restar cantidad entregada"
						>
							-
						</button>
						<div className="flex h-9 min-w-14 items-center justify-center border-x border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
							{producto.quantityDelivered ?? 0}
						</div>
						<button
							type="button"
							onClick={() => onAdjustDelivered(producto, 1)}
							disabled={(producto.quantityDelivered ?? 0) >= (producto.quantityOrdered ?? 0)}
							className="h-9 w-9 bg-slate-100 text-lg font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
							aria-label="Sumar cantidad entregada"
						>
							+
						</button>
					</div>
				</div>
			</div>

			<div className="mt-3 text-xs text-slate-500">
				<p>Ubicacion de busqueda</p>
				<div className="mt-1 flex items-center gap-2">
					<select
						value={selectedUbication}
						onChange={(e) => onUpdateUbication(producto, e.target.value)}
						className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700"
					>
						{UBI_OPTIONS.map((option) => (
							<option key={option} value={option}>{option}</option>
						))}
					</select>
					{!producto.ubication && (
						<span className="text-[11px] text-slate-400">
							Por defecto: {toUbicationOption(defaultUbication)}
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
