import React, { useEffect, useRef } from 'react';
import { formatArgentineDate } from '../utils/formatArgentineDate.jsx';

const statusLabels = {
	incoming: 'Entrante',
	preparing: 'En preparacion',
	delivered: 'Entregado',
};

export default function DetallePedido({ order, onClose }) {
	const dialogRef = useRef(null);
	const closeButtonRef = useRef(null);

	useEffect(() => {
		if (!order) {
			return undefined;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButtonRef.current?.focus();

		const handleEscape = (event) => {
			if (event.key === 'Escape') {
				onClose();
			}

			if (event.key === 'Tab' && dialogRef.current) {
				const focusableElements = dialogRef.current.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (!focusableElements.length) {
					return;
				}

				const firstElement = focusableElements[0];
				const lastElement = focusableElements[focusableElements.length - 1];

				if (event.shiftKey && document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}

				if (!event.shiftKey && document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		};

		window.addEventListener('keydown', handleEscape);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleEscape);
		};
	}, [onClose, order]);

	if (!order) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
			onClick={onClose}
			aria-hidden="true"
		>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="detalle-pedido-titulo"
				className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-4 md:px-6 md:py-5">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
							Pedido
						</p>
						<h2 id="detalle-pedido-titulo" className="mt-1 text-xl md:text-2xl font-bold text-slate-900">{order.title}</h2>
						<div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 md:flex-row md:flex-wrap md:items-center md:gap-2">
							<span>Actualizado:</span>
							<span className="font-medium text-slate-700">
								{formatArgentineDate(order.updatedAt || order.createdAt)}
							</span>
							<span className="hidden md:inline text-slate-300">|</span>
							<span>Creado:</span>
							<span className="font-medium text-slate-700">
								{formatArgentineDate(order.createdAt)}
							</span>
						</div>
					</div>
					<button
						ref={closeButtonRef}
						type="button"
						onClick={onClose}
						className="rounded-full p-3 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
						aria-label="Cerrar detalle"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="max-h-[calc(90vh-96px)] overflow-y-auto space-y-6 px-4 py-5 text-sm text-slate-600 md:px-6 md:py-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estado</p>
							<p className="mt-2 text-base font-semibold text-slate-800">
								{statusLabels[order.status] || order.status}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cliente</p>
							<p className="mt-2 text-base font-semibold text-slate-800">
								{order.cliente || 'Sin cliente asignado'}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monto</p>
							<p className="mt-2 text-base font-semibold text-emerald-600">
								${order.monto ?? 0}
							</p>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="rounded-2xl border border-slate-200 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ultimo operario</p>
							<p className="mt-2 text-base font-semibold text-slate-800">
								{order.lastOperator || 'Todavia sin movimientos manuales'}
							</p>
						</div>
						<div className="rounded-2xl border border-slate-200 p-4">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ID</p>
							<p className="mt-2 break-all font-mono text-xs text-slate-700">{order.id}</p>
						</div>
					</div>

					<div className="rounded-2xl border border-slate-200 p-4">
						<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Detalle</p>
						<p className="mt-3 whitespace-pre-wrap leading-6 text-slate-700">
							{order.details || 'Este pedido no tiene detalle adicional.'}
						</p>
					</div>

					<div className="rounded-2xl border border-slate-200 p-4">
						<p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productos</p>
						{order.productos && order.productos.length > 0 ? (
							<div className="mt-3 space-y-3">
								{order.productos.map((producto, index) => (
									<div key={`${producto.nombre}-${index}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
										<div>
											<p className="font-semibold text-slate-800">{producto.nombre || 'Producto sin nombre'}</p>
											{producto.detalle && (
												<p className="mt-1 text-xs text-slate-500">{producto.detalle}</p>
											)}
										</div>
										<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
											x{producto.cantidad || 1}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className="mt-3 text-slate-500">No hay productos cargados para este pedido.</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
