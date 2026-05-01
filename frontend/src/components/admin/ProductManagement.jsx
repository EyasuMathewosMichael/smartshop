import { useState, useEffect } from 'react';
import api from '../../utils/api';
import ProductForm from './ProductForm';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import Loader from '../common/Loader';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchProducts(); }, [page]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { page, limit: 10 } });
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch { /* silently fail */ }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 md:hidden">Products</h2>
          {!loading && <p className="text-sm text-slate-400 mt-0.5">{total} total products</p>}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Product
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Category</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Price</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Stock</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {p.images?.[0]?.url ? (
                        <img src={p.images[0].url} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-semibold text-slate-800 max-w-[140px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 capitalize">{p.category}</td>
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">${p.price?.toFixed(2)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditProduct(p)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    No products yet. Click "New Product" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Product" size="lg">
        <ProductForm
          onSaved={() => { setShowCreate(false); fetchProducts(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product" size="lg">
        <ProductForm
          product={editProduct}
          onSaved={() => { setEditProduct(null); fetchProducts(); }}
          onCancel={() => setEditProduct(null)}
        />
      </Modal>
    </div>
  );
}
