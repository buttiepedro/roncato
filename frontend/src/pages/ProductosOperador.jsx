import React, { useEffect, useState } from 'react';
import { createProduct, fetchProducts, updateProduct } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const UBI_OPTIONS = ['Deposito', 'Negocio', 'Congelado'];

function toUbicationOption(value) {
  const normalized = (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (normalized.includes('congelado')) return 'Congelado';
  if (normalized.includes('negocio')) return 'Negocio';
  return 'Deposito';
}

export default function ProductosOperador() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;
  const [newProductName, setNewProductName] = useState('');
  const [newProductUbication, setNewProductUbication] = useState('Deposito');
  const [savingNewProduct, setSavingNewProduct] = useState(false);

  const getProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(
        Array.isArray(data)
          ? data.map((product) => ({
              ...product,
              defaultUbication: toUbicationOption(product.defaultUbication),
            }))
          : []
      );
    } catch (err) {
      console.error('Error al obtener productos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleUbicationChange = (id, value) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, defaultUbication: value } : p)));
  };

  const handleSaveUbication = async (product) => {
    setSavingId(product.id);
    try {
      const updated = await updateProduct(product.id, { defaultUbication: product.defaultUbication });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch (err) {
      console.error('Error al actualizar ubicacion por defecto:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    const name = newProductName.trim();
    if (!name) return;

    setSavingNewProduct(true);
    try {
      const created = await createProduct({
        name,
        defaultUbication: newProductUbication,
      });
      setProducts((prev) => {
        const next = [...prev, created];
        setCurrentPage(Math.ceil(next.length / PRODUCTS_PER_PAGE));
        return next;
      });
      setIsModalOpen(false);
      setNewProductName('');
      setNewProductUbication('Deposito');
    } catch (err) {
      console.error('Error al crear producto:', err);
    } finally {
      setSavingNewProduct(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans motion-safe:animate-[pageEnter_560ms_cubic-bezier(0.22,1,0.36,1)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 border-l-4 border-blue-600 pl-3">
            Productos y Ubicaciones
          </h1>
          <p className="text-slate-500 text-sm ml-4 mt-1">Visualiza productos y ajusta su ubicacion predeterminada</p>
        </div>
        {user?.role === 'admin' && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 text-sm"
          >
            <span className="text-lg">+</span> Nuevo Producto
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Producto</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500">Ubicacion predeterminada</th>
                <th className="px-6 py-4 text-xs uppercase tracking-wider font-bold text-slate-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!loading && products.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-slate-500">
                    No hay productos cargados.
                  </td>
                </tr>
              ) : loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-slate-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : (
                products.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE).map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{product.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.defaultUbication || 'Deposito'}
                        onChange={(e) => handleUbicationChange(product.id, e.target.value)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                      >
                        {UBI_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSaveUbication(product)}
                        disabled={savingId === product.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingId === product.id ? 'Guardando...' : 'Guardar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginacion */}
      {products.length > PRODUCTS_PER_PAGE && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-sm text-slate-500">
            Página {currentPage} de {Math.ceil(products.length / PRODUCTS_PER_PAGE)}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            {Array.from({ length: Math.ceil(products.length / PRODUCTS_PER_PAGE) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(products.length / PRODUCTS_PER_PAGE)))}
              disabled={currentPage === Math.ceil(products.length / PRODUCTS_PER_PAGE)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {isModalOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform-gpu transition-all duration-300">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Crear Nuevo Producto</h2>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre del producto
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
                  placeholder="Ej: Milanesa napolitana"
                  required
                />
              </div>

              <div>
                <label htmlFor="product-ubication" className="block text-sm font-medium text-slate-700 mb-1">
                  Ubicacion predeterminada
                </label>
                <select
                  id="product-ubication"
                  value={newProductUbication}
                  onChange={(e) => setNewProductUbication(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  {UBI_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50"
                  disabled={savingNewProduct}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={savingNewProduct}
                >
                  {savingNewProduct ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
