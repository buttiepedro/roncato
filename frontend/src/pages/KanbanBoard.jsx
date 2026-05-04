import React, { useMemo, useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { updateOrderStatus, fetchOrders, fetchUsers, API_BASE } from '../services/api.js';
import { io } from 'socket.io-client';
import OrderCard from '../components/OrderCard.jsx';
import KanbanFilters from '../components/KanbanFilters.jsx';
import DetallePedido from '../components/DetallePedido.jsx';
import ActionDialog from '../components/ActionDialog.jsx';

const columns = [
  { id: 'incoming', title: 'Pedidos Entrantes' },
  { id: 'preparing', title: 'En Preparación' },
  { id: 'delivered', title: 'Entregados' }
];

export default function KanbanBoard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusErrorOpen, setStatusErrorOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [users, setUsers] = useState([]);
  const [armadorFilter, setArmadorFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [list, usersList] = await Promise.all([fetchOrders(), fetchUsers()]);
        setOrders(Array.isArray(list) ? list : []);
        setUsers(Array.isArray(usersList) ? usersList : []);
      } catch (e) {
        console.error('Error cargando datos del tablero:', e);
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
  const armadorOptions = useMemo(
    () => (Array.isArray(users) ? users : [])
      .map((user) => user?.username)
      .filter((username) => Boolean(username))
      .sort((a, b) => a.localeCompare(b, 'es')),
    [users]
  );

  const matchesDateFilter = (order) => {
    if (!dateFrom && !dateTo) return true;

    const rawDate = order.updatedAt || order.createdAt;
    if (!rawDate) return false;

    const orderDate = new Date(rawDate);
    if (Number.isNaN(orderDate.getTime())) return false;

    if (dateFrom) {
      const fromDate = new Date(`${dateFrom}T00:00:00`);
      if (orderDate < fromDate) return false;
    }

    if (dateTo) {
      const toDate = new Date(`${dateTo}T23:59:59.999`);
      if (orderDate > toDate) return false;
    }

    return true;
  };

  const matchesArmadorFilter = (order) => {
    if (!armadorFilter) return true;
    if (armadorFilter === '__unassigned__') return !order.armoPedido;
    return order.armoPedido === armadorFilter;
  };

  const filteredOrders = safeOrders.filter((order) => matchesDateFilter(order) && matchesArmadorFilter(order));
  const hasActiveFilters = Boolean(dateFrom || dateTo || armadorFilter);
  const activeFilterLabel = armadorFilter
    ? armadorFilter === '__unassigned__'
      ? 'Armador: Sin asignar'
      : `Armador: ${armadorFilter}`
    : '';

  const grouped = useMemo(() => ({
    incoming: filteredOrders.filter(o => o.status === 'incoming'),
    preparing: filteredOrders.filter(o => o.status === 'preparing'),
    delivered: filteredOrders.filter(o => o.status === 'delivered' && !o.partialDelivery),
  }), [filteredOrders]);

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
      setStatusErrorOpen(true);
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-3 md:p-4 bg-slate-50 h-full min-h-0 overflow-y-auto motion-safe:animate-[pageEnter_560ms_cubic-bezier(0.22,1,0.36,1)]">
        <div className="mx-auto w-full max-w-415">
          <KanbanFilters
            dateFrom={dateFrom}
            dateTo={dateTo}
            armadorFilter={armadorFilter}
            armadorOptions={armadorOptions}
            filteredCount={filteredOrders.length}
            totalCount={safeOrders.length}
            hasActiveFilters={hasActiveFilters}
            activeFilterLabel={activeFilterLabel}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onArmadorFilterChange={setArmadorFilter}
            onClear={() => {
              setDateFrom('');
              setDateTo('');
              setArmadorFilter('');
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
            {columns.map(column => (
              <div
                key={column.id}
                className="flex flex-col min-w-0 max-w-full lg:max-w-87.5 mx-auto w-full min-h-64 pb-4"
              >
                <h3 className="text-base lg:text-lg font-bold text-slate-800 mb-4 px-3 border-l-4 border-blue-500 shrink-0">
                  {column.title}
                </h3>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
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
        </div>
      </div>

      <DetallePedido
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdate={(updated) => {
          setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
          setSelectedOrder(updated);
        }}
      />

      <ActionDialog
        open={statusErrorOpen}
        title="No se pudo actualizar el estado"
        message="Se revirtió el cambio en la tarjeta. Verificá la conexión e intentá nuevamente."
        confirmText="Entendido"
        hideCancel={true}
        onConfirm={() => setStatusErrorOpen(false)}
        onClose={() => setStatusErrorOpen(false)}
      />
    </DragDropContext>
  );
}