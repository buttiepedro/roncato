import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { formatArgentineDate } from '../utils/formatArgentineDate.jsx';

export default function OrderCard({ order, index }) {
  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`bg-white rounded-lg mb-3 shadow-sm border border-slate-200 overflow-hidden transition-all ${
            snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'
          }`}
        >
          {/* Cabecera: Pequeña en tablet (py-1.5), normal en desktop (lg:py-3) */}
          <div className="px-2 py-1.5 lg:px-4 lg:py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center gap-2">
            <strong className="text-blue-900 font-bold text-[10px] md:text-xs lg:text-sm leading-tight truncate">
              {order.title}
            </strong>
            <span className="text-[9px] lg:text-xs text-slate-500 font-medium whitespace-nowrap">
              {formatArgentineDate(order.updatedAt || order.createdAt)}
            </span>
          </div>

          {/* Cuerpo: p-2 en tablet, p-4 en desktop */}
          <div className="p-2 lg:p-4 text-[11px] lg:text-sm text-slate-600 space-y-2">
            
            {/* Info Cliente y Monto: 
              En tablet: misma línea (flex-row)
              En desktop: una debajo de otra (lg:flex-col) si querés que ocupe más espacio
            */}
            <div className="flex lg:flex-col justify-between lg:justify-start items-center lg:items-start gap-1">
              {order.cliente && (
                <p className="truncate font-medium flex items-center lg:mb-1">
                  <span className="mr-1 text-[12px] lg:text-base">👤</span> 
                  <span className="truncate">{order.cliente}</span>
                </p>
              )}
              {order.monto !== undefined && (
                <p className="text-emerald-600 font-bold whitespace-nowrap lg:text-lg">
                  <span className="lg:hidden">$</span>{/* Solo sigo el estilo de tu imagen anterior */}
                  <span className="hidden lg:inline text-slate-400 font-normal mr-1 text-sm">Monto:</span>
                  ${order.monto}
                </p>
              )}
            </div>

            {/* Lista de productos: 
                En tablet: Solo 2 y chiquitos
                En desktop: Lista completa y más clara
            */}
            {order.productos && order.productos.length > 0 && (
              <div className="mt-1 pt-2 border-t border-dashed border-slate-200">
                <span className="hidden lg:block font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                   📦 Productos
                </span>
                <ul className="list-none lg:list-disc lg:list-inside space-y-0.5 text-slate-500 text-[10px] lg:text-xs">
                  {/* Si es pantalla chica cortamos, si es grande mostramos todo */}
                  {order.productos.map((p, i) => (
                    <li key={i} className={`truncate ${i >= 2 ? 'hidden lg:list-item' : ''}`}>
                      {p.nombre} <span className="text-slate-400 text-[9px] lg:text-xs">x{p.cantidad}</span>
                    </li>
                  ))}
                  {order.productos.length > 2 && (
                    <li className="lg:hidden italic text-[9px] opacity-70">
                      + {order.productos.length - 2} más
                    </li>
                  )}
                </ul>
              </div>
            )}
            
            <button
              className="mt-3 w-full bg-blue-600 text-white text-[10px] lg:text-xs py-1.5 lg:py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm"
              onClick={() => alert(`Detalles del pedido #${order.id}`)}
            >
              Ver Detalle
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
}