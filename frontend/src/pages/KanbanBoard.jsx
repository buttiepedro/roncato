import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateOrderStatus, fetchOrders, API_BASE } from '../services/api.js';
import { io } from 'socket.io-client';

const columns = [
  { id: 'incoming', title: 'Pedidos Entrantes' },
  { id: 'preparing', title: 'En Preparación' },
  { id: 'delivered', title: 'Entregados' }
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchOrders();
        setOrders(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Error cargando órdenes:', e);
      }
    })();
    const s = io(API_BASE, { transports: ['websocket'] });
    s.on('order_created', (o) => {
      setOrders(prev => [o, ...prev]);
    });
    s.on('order_updated', (upd) => {
      setOrders(prev => prev.map(o => o.id === upd.id ? { ...o, ...upd } : o));
    });
    return () => s.disconnect();
  }, []);

  const safeOrders = Array.isArray(orders) ? orders : [];

  const grouped = useMemo(() => ({
    incoming: safeOrders.filter(o => o.status === 'incoming'),
    preparing: safeOrders.filter(o => o.status === 'preparing'),
    delivered: safeOrders.filter(o => o.status === 'delivered'),
  }), [safeOrders]);

  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Actualización optimista
    setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: newStatus } : o));
    
    try {
      await updateOrderStatus(draggableId, newStatus);
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: source.droppableId } : o));
      alert('No se pudo actualizar el estado');
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', overflowX: 'auto' }}>
        {columns.map(column => (
          <div key={column.id} style={{ background: '#f3f4f6', borderRadius: '8px', width: '300px', minHeight: '500px' }}>
            <h3 style={{ padding: '16px', margin: 0 }}>{column.title}</h3>
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ padding: '8px', minHeight: '100px' }}
                >
                  {grouped[column.id].map((o, index) => (
                    <Draggable key={o.id} draggableId={o.id.toString()} index={index}>
                      {(provided2) => ( // Aquí es donde se define provided2
                        <div
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          {...provided2.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: 12,
                            marginBottom: 8,
                            border: '1px solid #e5e7eb',
                            borderRadius: 8,
                            background: o.color || '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            ...provided2.draggableProps.style
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{o.title}</strong>
                            <small>{new Date(o.createdAt).toLocaleTimeString()}</small>
                          </div>

                          {o.cliente && (
                            <div style={{ marginTop: 6 }}>
                              <strong>Cliente:</strong> {o.cliente}
                            </div>
                          )}

                          {o.monto !== undefined && (
                            <div style={{ marginTop: 4 }}>
                              <strong>Monto:</strong> ${o.monto}
                            </div>
                          )}

                          {o.productos && o.productos.length > 0 && (
                            <div style={{ marginTop: 6 }}>
                              <strong>Productos:</strong>
                              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                                {o.productos.map((p, i) => (
                                  <li key={i}>{p.nombre} x {p.cantidad}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}