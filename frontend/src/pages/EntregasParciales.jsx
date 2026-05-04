import React, { useEffect, useState } from 'react';
import { fetchEntregasParciales, completarEntregaParcial, updateOrderProduct } from '../services/api.js';

export default function EntregasParciales({ onPendingCountChange }) {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingProductKey, setSavingProductKey] = useState('');
  const [completingEntregaId, setCompletingEntregaId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchEntregasParciales();
        setEntregas(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error cargando entregas parciales:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const pendingCount = entregas.filter(e => !e.completed).length;
    onPendingCountChange?.(pendingCount);
  }, [entregas, onPendingCountChange]);

  async function handleComplete(id) {
    const entrega = entregas.find((e) => e.id === id);
    if (!entrega) return;

    const hasPending = entrega.missingProducts.some(
      (product) => (product.quantityDelivered || 0) < (product.quantityOrdered || 0)
    );
    if (hasPending) {
      return;
    }

    setCompletingEntregaId(id);
    try {
      const updated = await completarEntregaParcial(id);
      setEntregas(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
    } catch (err) {
      console.error('Error al completar entrega parcial:', err);
    } finally {
      setCompletingEntregaId(null);
    }
  }

  async function updateEntregaProduct(entregaId, orderId, producto, nextDelivered) {
    const quantityOrdered = Number(producto.quantityOrdered) || 0;
    const clampedDelivered = Math.min(Math.max(0, Number(nextDelivered) || 0), quantityOrdered);
    const productKey = `${entregaId}-${producto.productId}`;

    setSavingProductKey(productKey);
    try {
      await updateOrderProduct(orderId, producto.productId, {
        quantityOrdered,
        quantityDelivered: clampedDelivered,
        ubication: producto.ubication,
      });

      setEntregas((prev) => prev.map((entrega) => {
        if (entrega.id !== entregaId) return entrega;
        return {
          ...entrega,
          missingProducts: entrega.missingProducts.map((item) => (
            item.productId === producto.productId
              ? { ...item, quantityDelivered: clampedDelivered }
              : item
          )),
        };
      }));
    } catch (err) {
      console.error('Error al actualizar producto de entrega parcial:', err);
    } finally {
      setSavingProductKey('');
    }
  }

  async function handleToggleProduct(entrega, producto) {
    const isDelivered = (producto.quantityDelivered || 0) >= (producto.quantityOrdered || 0)
      && (producto.quantityOrdered || 0) > 0;
    const nextOrdered = (producto.quantityOrdered || 0) > 0 ? producto.quantityOrdered : 1;
    const nextDelivered = isDelivered ? 0 : nextOrdered;
    await updateEntregaProduct(entrega.id, entrega.orderId, { ...producto, quantityOrdered: nextOrdered }, nextDelivered);
  }

  async function handleAdjustDelivered(entrega, producto, delta) {
    const currentDelivered = Number(producto.quantityDelivered) || 0;
    const maxDelivered = Math.max(0, Number(producto.quantityOrdered) || 0);
    const nextDelivered = Math.min(Math.max(0, currentDelivered + delta), maxDelivered);
    if (nextDelivered === currentDelivered) return;
    await updateEntregaProduct(entrega.id, entrega.orderId, producto, nextDelivered);
  }

  const pending = entregas.filter(e => !e.completed);
  const completed = entregas.filter(e => e.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-slate-500 text-sm">Cargando entregas parciales...</span>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 h-full overflow-y-auto motion-safe:animate-[pageEnter_560ms_cubic-bezier(0.22,1,0.36,1)]">
      <h2 className="text-lg font-bold text-slate-800 mb-5 border-l-4 border-amber-500 pl-3">
        Entregas Parciales
      </h2>

      {/* Pendientes */}
      <section className="mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Pendientes ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-6 text-center text-sm text-slate-500">
            No hay entregas parciales pendientes
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pending.map(entrega => (
              <EntregaCard
                key={entrega.id}
                entrega={entrega}
                onComplete={handleComplete}
                onToggleProduct={handleToggleProduct}
                onAdjustDelivered={handleAdjustDelivered}
                savingProductKey={savingProductKey}
                completing={completingEntregaId === entrega.id}
              />
            ))}
          </div>
        )}
      </section>

      {/* Completadas */}
      {completed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Completadas ({completed.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completed.map(entrega => (
              <EntregaCard
                key={entrega.id}
                entrega={entrega}
                onComplete={handleComplete}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EntregaCard({
  entrega,
  onComplete,
  onToggleProduct,
  onAdjustDelivered,
  savingProductKey,
  completing = false,
}) {
  const { id, order, missingProducts, completed, completedAt, createdAt } = entrega;
  const pendingProducts = missingProducts.filter(
    (product) => (product.quantityDelivered || 0) < (product.quantityOrdered || 0)
  );
  const canComplete = !completed && pendingProducts.length === 0;

  return (
    <div className={`rounded-xl border bg-white shadow-sm p-4 flex flex-col gap-3 transition-opacity ${completed ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-800 truncate">{order?.title ?? '—'}</p>
          <p className="text-xs text-slate-500 truncate">{order?.cliente ?? '—'}</p>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title={completed ? 'Completado' : 'Marcar como completado'}>
          <input
            type="checkbox"
            checked={completed}
            disabled={completed || !canComplete || completing}
            onChange={() => !completed && onComplete(id)}
            className="w-5 h-5 rounded accent-green-500 cursor-pointer disabled:cursor-default"
          />
          {completed && <span className="text-xs text-green-600 font-medium">Listo</span>}
          {!completed && completing && <span className="text-xs text-slate-500 font-medium">Guardando...</span>}
        </label>
      </div>

      {/* Productos faltantes */}
      <div className="border-t border-slate-100 pt-2 flex flex-col gap-1.5">
        <p className="text-xs font-medium text-slate-500 mb-1">Productos de la entrega parcial:</p>
        {missingProducts.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Sin datos de productos</p>
        ) : (
          missingProducts.map(mp => {
            const delivered = mp.quantityDelivered || 0;
            const ordered = mp.quantityOrdered || 0;
            const falta = Math.max(0, ordered - delivered);
            const productKey = `${id}-${mp.productId}`;
            const isDelivered = ordered > 0 && delivered >= ordered;
            const isSaving = savingProductKey === productKey;
            return (
              <div key={mp.productId} className={`rounded-lg border px-2.5 py-2 ${isDelivered ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}>
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3">
                  <button
                    type="button"
                    className={`row-span-2 h-5 w-5 self-center rounded-full border-2 text-[10px] font-bold transition-colors ${
                      isDelivered
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-amber-400 bg-white text-amber-600'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    onClick={() => onToggleProduct?.(entrega, mp)}
                    disabled={completed || isSaving}
                    aria-label={isDelivered ? 'Desmarcar producto entregado' : 'Marcar producto entregado'}
                  >
                    {isDelivered ? '✓' : ''}
                  </button>

                  <span className={`min-w-0 self-center truncate text-sm font-medium leading-none ${isDelivered ? 'text-emerald-800 line-through' : 'text-slate-700'}`}>
                    {mp.product?.name ?? `#${mp.productId}`}
                  </span>

                  <div className="inline-flex shrink-0 self-center overflow-hidden rounded-md border border-slate-300 bg-white">
                    <button
                      type="button"
                      className="h-7 w-7 bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => onAdjustDelivered?.(entrega, mp, -1)}
                      disabled={completed || isSaving || delivered <= 0}
                      aria-label="Restar cantidad entregada"
                    >
                      -
                    </button>
                    <span className="inline-flex min-w-14 items-center justify-center border-x border-slate-300 px-2 text-xs font-semibold text-slate-700">
                      {delivered}/{ordered}
                    </span>
                    <button
                      type="button"
                      className="h-7 w-7 bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => onAdjustDelivered?.(entrega, mp, 1)}
                      disabled={completed || isSaving || delivered >= ordered}
                      aria-label="Sumar cantidad entregada"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {!completed && pendingProducts.length > 0 && (
          <p className="text-xs text-amber-700">
            Para completar la entrega parcial, todos los productos deben quedar en entregado.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-2">
        <span>
          Creado: {createdAt ? new Date(createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
        </span>
        {completed && completedAt && (
          <span className="text-green-600">
            ✓ {new Date(completedAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
