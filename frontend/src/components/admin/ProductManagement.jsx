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
  const [editProduct, setEditProduct] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { fetchProducts(); }, [page]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { page, limit: 10 } });
      setProducts(res.data.products || res.data.data || []);
      setTotalPages(res.data.totalPages || res.data.pages || 1);
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
    } catch {
      // silently fail
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Products</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Product
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-right text-gray-800">${p.price?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditProduct(p)}
                      className="text-blue-600 hover:underline text-xs mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!products.length && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Product">
        <ProductForm
          onSaved={() => { setShowCreate(false); fetchProducts(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        <ProductForm
          product={editProduct}
          onSaved={() => { setEditProduct(null); fetchProducts(); }}
          onCancel={() => setEditProduct(null)}
        />
      </Modal>
    </div>
  );
}
