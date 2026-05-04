import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatArgentineDate } from '../utils/formatArgentineDate.jsx';

export default function OrderCard({ order, index, onViewDetail }) {
  const isPartialDelivery = Boolean(order.partialDelivery);
  const isDeliveredComplete = order.status === 'delivered' && !isPartialDelivery;
  const cardClasses = isPartialDelivery
    ? 'bg-amber-50 border-amber-300'
    : isDeliveredComplete
      ? 'bg-emerald-50 border-emerald-300'
      : 'bg-white border-slate-200';
  const headerClasses = isPartialDelivery
    ? 'bg-amber-100 border-amber-200'
    : isDeliveredComplete
      ? 'bg-emerald-100 border-emerald-200'
      : 'bg-blue-50 border-blue-100';
  const titleClasses = isPartialDelivery
    ? 'text-amber-900'
    : isDeliveredComplete
      ? 'text-emerald-900'
      : 'text-blue-900';
  const buttonClasses = isPartialDelivery
    ? 'bg-amber-600 hover:bg-amber-700 focus-visible:outline-amber-600'
    : isDeliveredComplete
      ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600'
      : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600';

  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={`rounded-lg mb-3 shadow-sm border overflow-hidden transition-all ${cardClasses} ${
            snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'
          }`}
        >
          {/* Cabecera: Pequeña en tablet (py-1.5), normal en desktop (lg:py-3) */}
          <div
            {...provided.dragHandleProps}
            className={`cursor-grab active:cursor-grabbing px-2.5 py-2 md:px-3 md:py-2.5 border-b flex flex-col items-start gap-1 lg:flex-row lg:justify-between lg:items-center lg:gap-2 ${headerClasses}`}
            aria-label={`Mover pedido ${order.title}`}
          >
            <strong className={`font-bold text-xs md:text-sm lg:text-sm leading-tight truncate ${titleClasses}`}>
              {order.title}
            </strong>
            <div className="flex items-center gap-2 shrink-0">
              {isDeliveredComplete && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Completa
                </span>
              )}
              <span className="text-[11px] md:text-xs lg:text-sm text-slate-500 font-medium whitespace-nowrap">
              {formatArgentineDate(order.updatedAt || order.createdAt)}
              </span>
            </div>
          </div>

          {/* Cuerpo: p-2 en tablet, p-4 en desktop */}
          <div className="p-2.5 md:p-3 text-xs md:text-sm text-slate-600 space-y-2.5">
            
            {/* Info Cliente y Monto: 
              En tablet: misma línea (flex-row)
              En desktop: una debajo de otra (lg:flex-col) si querés que ocupe más espacio
            */}
            <div className="flex flex-col justify-between items-start gap-1.5 md:flex-col md:items-start lg:flex-col lg:items-start">
              {order.cliente && (
                <p className="truncate font-medium flex items-center lg:mb-1">
                  <span className="mr-1.5 text-sm" aria-hidden="true">👤</span>
                  <span className="truncate">{order.cliente}</span>
                </p>
              )}
              {order.monto !== undefined && (
                <p className="text-emerald-600 font-bold whitespace-nowrap text-sm md:text-base lg:text-lg">
                  <span className="text-slate-400 font-normal mr-1 text-xs md:text-sm">Monto:</span>
                  ${order.monto}
                </p>
              )}
            </div>

            {order.lastOperator && (
              <p className="text-xs md:text-sm text-slate-400">
                Ult. operario: <span className="font-semibold text-slate-700">{order.lastOperator}</span>
              </p>
            )}

            <p className="text-xs md:text-sm text-slate-400">
              Armo: <span className="font-semibold text-slate-700">{order.armoPedido || 'Sin asignar'}</span>
            </p>
            
            <button
              type="button"
              className={`mt-2.5 w-full text-white text-xs md:text-sm py-2 rounded-md transition-colors font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonClasses}`}
              onClick={() => onViewDetail(order)}
              aria-label={`Ver detalle de ${order.title}`}
            >
              Ver Detalle
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}