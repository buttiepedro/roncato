import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

export default function OrderCard({ order, index }) {
  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
          className={`bg-white rounded-xl mb-4 shadow-md border border-slate-200 overflow-hidden transition-all ${
            snapshot.isDragging ? 'opacity-80 scale-105' : 'opacity-100'
          }`}
        >
          {/* Cabecera */}
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
            <strong className="text-blue-900 font-semibold">{order.title}</strong>
            <span className="text-xs text-slate-500 font-medium">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Cuerpo */}
          <div className="p-4 text-sm text-slate-600 space-y-2">
            {order.cliente && (
              <p>
                <span className="font-bold text-slate-800">👤 Cliente:</span> {order.cliente}
              </p>
            )}

            {order.monto !== undefined && (
              <p>
                <span className="font-bold text-slate-800">💰 Monto:</span> 
                <span className="text-emerald-600 font-bold ml-1">${order.monto}</span>
              </p>
            )}
            <div>
              {order.productos && order.productos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                  <span className="font-bold text-slate-800 block mb-1">📦 Productos:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-500">
                    {order.productos.map((p, i) => (
                      <li key={i}>
                        {p.nombre} <span className="text-slate-400 text-xs">x{p.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                className="mt-4 w-full bg-blue-500 text-white text-sm py-2 rounded hover:bg-blue-600 transition-colors"
                onClick={() => alert(`Detalles del pedido #${order.id}`)}
              >Ver Detalle</button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}