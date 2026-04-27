import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { updateOrderStatus, fetchOrders, API_BASE } from '../services/api.js';
import { io } from 'socket.io-client';
import OrderCard from '../components/OrderCard.jsx';
import DetallePedido from '../components/DetallePedido.jsx';

const columns = [
  { id: 'incoming', title: 'Pedidos Entrantes' },
  { id: 'preparing', title: 'En Preparación' },
  { id: 'delivered', title: 'Entregados' }
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
      const updatedOrder = await updateOrderStatus(draggableId, newStatus);
      setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, ...updatedOrder } : o));
    } catch (e) {
      setOrders(prev => prev.map(o => o.id === draggableId ? { ...o, status: source.droppableId } : o));
      alert('No se pudo actualizar el estado');
    }
  }

  return (
  <DragDropContext onDragEnd={onDragEnd}>
    {/* h-[calc(100vh-2rem)]: Ajusta la altura para que ocupe casi toda la pantalla.
      overflow-hidden: Evita que toda la página scrollee, queremos que scrolleen las columnas.
    */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8 p-3 md:p-4 bg-slate-50 h-full min-h-0 overflow-y-auto">
      {columns.map(column => (
        <div 
          key={column.id} 
          className="flex flex-col min-w-0 max-w-full lg:max-w-87.5 mx-auto w-full min-h-64 pb-4"
        >
          {/* Título fijo arriba */}
          <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4 px-3 border-l-4 border-blue-500 shrink-0">
            {column.title}
          </h3>
          
          <Droppable droppableId={column.id}>
  {(provided, snapshot) => (
    <div
      {...provided.droppableProps}
      ref={provided.innerRef}
      /* CLAVE 1: overflow-y-auto debe estar AQUÍ.
         CLAVE 2: background dinámico (opcional) ayuda a ver dónde estás soltando.
         CLAVE 3: min-h-full o un alto definido para que la librería detecte el área.
      */
      className={`flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0 transition-colors ${
        snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
      }`}
      style={{ minHeight: '12rem' }}
    >
      {grouped[column.id].length === 0 && (
        <div className="mx-2 mt-2 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 px-4 py-6 text-center text-sm text-slate-500">
          No hay pedidos en esta columna
        </div>
      )}
      {grouped[column.id].map((order, index) => (
        <OrderCard
          key={order.id}
          order={order}
          index={index}
          onViewDetail={setSelectedOrder}
        />
      ))}
      {provided.placeholder}
    </div>
  )}
</Droppable>
        </div>
      ))}
    </div>
    <DetallePedido
      order={selectedOrder}
      onClose={() => setSelectedOrder(null)}
      onOrderUpdate={(updated) => {
        setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
        setSelectedOrder(updated);
      }}
    />
  </DragDropContext>
);
}