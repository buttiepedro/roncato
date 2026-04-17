import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatArgentineDate } from '../utils/formatArgentineDate.jsx';

export default function OrderCard({ order, index, onViewDetail }) {
  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={provided.draggableProps.style}
          className={`bg-white rounded-lg mb-3 shadow-sm border border-slate-200 overflow-hidden transition-all ${
            snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'
          }`}
        >
          {/* Cabecera: Pequeña en tablet (py-1.5), normal en desktop (lg:py-3) */}
          <div
            {...provided.dragHandleProps}
            className="cursor-grab active:cursor-grabbing px-2.5 py-2 md:px-3 md:py-2.5 bg-blue-50 border-b border-blue-100 flex flex-col items-start gap-1 lg:flex-row lg:justify-between lg:items-center lg:gap-2"
            aria-label={`Mover pedido ${order.title}`}
          >
            <strong className="text-blue-900 font-bold text-xs md:text-sm lg:text-sm leading-tight truncate">
              {order.title}
            </strong>
            <div className="flex items-center gap-2 shrink-0">
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

            {/* Lista de productos: 
              Mostramos solo la cantidad de productos
            */}
            {order.productos && order.productos.length > 0 && (
              <p className="text-xs md:text-sm text-slate-400">
                Cant. de Productos:
                <span className="text-slate-700">{order.productos.length}</span> 
              </p>
            )}           
            
            <button
              type="button"
              className="mt-2.5 w-full bg-blue-600 text-white text-xs md:text-sm py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
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