import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { uiStyles } from '../styles/KanbanStyles.jsx';

export default function OrderCard({ order, index }) {
  return (
    <Draggable draggableId={order.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...uiStyles.card,
            opacity: snapshot.isDragging ? 0.8 : 1,
            ...provided.draggableProps.style
          }}
        >
          {/* Cabecera de la Card */}
          <div style={uiStyles.cardHeader}>
            <strong style={{ color: '#1e3a8a' }}>{order.title}</strong>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Cuerpo de la Card */}
          <div style={uiStyles.cardBody}>
            {order.cliente && (
              <div style={{ marginBottom: '8px' }}>
                <span style={uiStyles.tag}>👤 Cliente:</span> {order.cliente}
              </div>
            )}

            {order.monto !== undefined && (
              <div style={{ marginBottom: '8px' }}>
                <span style={uiStyles.tag}>💰 Monto:</span> 
                <span style={{ color: '#059669', fontWeight: 'bold' }}>${order.monto}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column'}}>
              {order.productos && order.productos.length > 0 && (
                <div style={{ marginTop: '12px', borderTop: '1px dashed #e2e8f0', paddingTop: '8px' }}>
                  <span style={uiStyles.tag}>📦 Productos:</span>
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', listStyleType: 'circle' }}>
                    {order.productos.map((p, i) => (
                      <li key={i} style={{ color: '#475569', marginBottom: '2px' }}>
                        {p.nombre} <span style={{ color: '#94a3b8' }}>x{p.cantidad}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                style={{
                  ...uiStyles.detailBtn,
                }}
                onClick={() => alert(`Detalles del pedido #${order.id}`)}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Detalles
              </button>
            </div> 
          </div>
        </div>
      )}
    </Draggable>
  );
}