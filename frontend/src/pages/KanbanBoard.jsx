import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateOrderStatus, fetchOrders, API_BASE } from '../services/api.js';
import { io } from 'socket.io-client';
import OrderCard from '../components/OrderCard.jsx';
// --- Estilos de UI ---
import { uiStyles } from '../styles/KanbanStyles.jsx';


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
      <div style={uiStyles.board}>
        {columns.map(column => (
          <div key={column.id} style={uiStyles.column}>
            <h3 style={uiStyles.columnTitle}>{column.title}</h3>
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ minHeight: '500px' }}
                >
                  {grouped[column.id].map((order, index) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      index={index} 
                    />
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