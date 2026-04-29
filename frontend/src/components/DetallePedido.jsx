import React, { useEffect, useRef, useState } from 'react';
import { formatArgentineDate } from '../utils/formatArgentineDate.jsx';
import { fetchOrderProducts, updateOrder, updateOrderProduct } from '../services/api.js';
import DetalleTextoSection from './DetalleTextoSection.jsx';
import ProductosSection from './ProductosSection.jsx';
import ResumenInfoPedidoSection from './ResumenInfoPedidoSection.jsx';

export default function DetallePedido({ order, onClose, onOrderUpdate }) {
	const dialogRef = useRef(null);
	const closeButtonRef = useRef(null);
	const [productos, setProductos] = useState([]);
	const [loadingProducts, setLoadingProducts] = useState(false);
	const [partialDelivery, setPartialDelivery] = useState(false);
	const [savingPartialDelivery, setSavingPartialDelivery] = useState(false);

	useEffect(() => {
		setPartialDelivery(Boolean(order?.partialDelivery));
	}, [order?.id, order?.partialDelivery]);

	useEffect(() => {
		if (!order?.id) {
			setProductos([]);
			return;
		}

		(async () => {
			setLoadingProducts(true);
			try {
				const items = await fetchOrderProducts(order.id);
				setProductos(Array.isArray(items) ? items : []);
			} catch (e) {
				console.error('Error al cargar productos del pedido:', e);
				setProductos([]);
			} finally {
				setLoadingProducts(false);
			}
		})();
	}, [order?.id]);

	const updateProductQuantity = async (productId, field, value) => {
		if (!order?.id) return;
		if (field === 'quantityOrdered') return;

		const numericValue = Number(value);
		if (Number.isNaN(numericValue) || numericValue < 0) return;

		const previous = [...productos];
		const updated = productos.map((p) => {
			if (p.productId !== productId) return p;
			const maxDelivered = Math.max(0, Number(p.quantityOrdered) || 0);
			const clampedDelivered = Math.min(Math.max(0, numericValue), maxDelivered);
			return { ...p, [field]: clampedDelivered };
		});
		setProductos(updated);

		const currentItem = updated.find((p) => p.productId === productId);
		if (!currentItem) return;

		try {
			await updateOrderProduct(order.id, productId, {
				quantityOrdered: currentItem.quantityOrdered,
				quantityDelivered: currentItem.quantityDelivered,
				ubication: currentItem.ubication,
			});
			onOrderUpdate?.({ ...order });
		} catch (e) {
			setProductos(previous);
			console.error('Error al guardar cantidades del producto:', e);
		}
	};

	const adjustDeliveredQuantity = (producto, delta) => {
		const currentDelivered = Number(producto.quantityDelivered) || 0;
		const maxDelivered = Math.max(0, Number(producto.quantityOrdered) || 0);
		const nextDelivered = Math.min(Math.max(0, currentDelivered + delta), maxDelivered);
		if (nextDelivered === currentDelivered) return;
		updateProductQuantity(producto.productId, 'quantityDelivered', nextDelivered);
	};

	const updateProductUbication = async (producto, nextUbication) => {
		if (!order?.id) return;

		const previous = [...productos];
		const updated = productos.map((p) => p.productId === producto.productId ? {
			...p,
			ubication: nextUbication,
		} : p);
		setProductos(updated);

		const currentItem = updated.find((p) => p.productId === producto.productId);
		if (!currentItem) return;

		try {
			await updateOrderProduct(order.id, producto.productId, {
				quantityOrdered: currentItem.quantityOrdered,
				quantityDelivered: currentItem.quantityDelivered,
				ubication: currentItem.ubication,
			});
			onOrderUpdate?.({ ...order });
		} catch (e) {
			setProductos(previous);
			console.error('Error al actualizar ubicacion del producto:', e);
		}
	};

	const persistPartialDelivery = async (nextValue) => {
		if (!order?.id) return;

		const previous = partialDelivery;
		setPartialDelivery(nextValue);
		setSavingPartialDelivery(true);

		try {
			const updatedOrder = await updateOrder(order.id, { partialDelivery: nextValue });
			setPartialDelivery(Boolean(updatedOrder.partialDelivery));
			onOrderUpdate?.(updatedOrder);
		} catch (e) {
			setPartialDelivery(previous);
			console.error('Error al actualizar entrega parcial:', e);
		} finally {
			setSavingPartialDelivery(false);
		}
	};

	const toggleProductAdded = async (producto) => {
		if (!order?.id) return;

		const isAdded = (producto.quantityDelivered || 0) >= (producto.quantityOrdered || 0) && (producto.quantityOrdered || 0) > 0;
		const nextOrdered = (producto.quantityOrdered || 0) > 0 ? producto.quantityOrdered : 1;
		const nextDelivered = isAdded ? 0 : nextOrdered;

		const previous = [...productos];
		const updated = productos.map((p) => p.productId === producto.productId ? {
			...p,
			quantityOrdered: nextOrdered,
			quantityDelivered: nextDelivered,
		} : p);
		setProductos(updated);

		const currentItem = updated.find((p) => p.productId === producto.productId);
		if (!currentItem) return;

		try {
			await updateOrderProduct(order.id, producto.productId, {
				quantityOrdered: currentItem.quantityOrdered,
				quantityDelivered: currentItem.quantityDelivered,
				ubication: currentItem.ubication,
			});
			onOrderUpdate?.({ ...order });
		} catch (e) {
			setProductos(previous);
			console.error('Error al marcar producto como agregado:', e);
		}
	};

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

	const totalOrdered = productos.reduce((acc, item) => acc + (item.quantityOrdered || 0), 0);
	const totalDelivered = productos.reduce((acc, item) => acc + (item.quantityDelivered || 0), 0);
	const hasMissingProducts = productos.some((item) => (item.quantityDelivered || 0) < (item.quantityOrdered || 0));

	useEffect(() => {
		if (!order?.id || loadingProducts || productos.length === 0) return;
		if (partialDelivery && !hasMissingProducts && !savingPartialDelivery) {
			persistPartialDelivery(false);
		}
	}, [order?.id, loadingProducts, productos, partialDelivery, hasMissingProducts, savingPartialDelivery]);

	if (!order) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm transition-opacity duration-300"
			onClick={onClose}
			aria-hidden="true"
		>
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby="detalle-pedido-titulo"
				className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl transform-gpu transition-all duration-300"
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
					<ResumenInfoPedidoSection
						order={order}
						totalOrdered={totalOrdered}
						totalDelivered={totalDelivered}
						partialDelivery={partialDelivery}
						savingPartialDelivery={savingPartialDelivery}
						hasMissingProducts={hasMissingProducts}
						onTogglePartialDelivery={persistPartialDelivery}
					/>

					<DetalleTextoSection detailText={order.details} />

					<ProductosSection
						loadingProducts={loadingProducts}
						productos={productos}
						partialDelivery={partialDelivery}
						onToggleAdded={toggleProductAdded}
						onAdjustDelivered={adjustDeliveredQuantity}
						onUpdateUbication={updateProductUbication}
					/>
				</div>
			</div>
		</div>
	);
}
