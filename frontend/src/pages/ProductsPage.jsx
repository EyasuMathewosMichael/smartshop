import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import ProductSearch from '../components/products/ProductSearch';
import ProductList from '../components/products/ProductList';
import Pagination from '../components/common/Pagination';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({});
  const currency = localStorage.getItem('currency') || 'USD';

  const fetchProducts = useCallback(async (currentFilters, currentPage) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category && currentFilters.category !== 'All') params.category = currentFilters.category;
      if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
      if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
      if (currentFilters.sortBy) {
        const sortMap = {
          price_asc: { sortBy: 'price', sortOrder: 'asc' },
          price_desc: { sortBy: 'price', sortOrder: 'desc' },
          name: { sortBy: 'name', sortOrder: 'asc' },
          newest: { sortBy: 'createdAt', sortOrder: 'desc' },
        };
        Object.assign(params, sortMap[currentFilters.sortBy] || {});
      }
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
      setTotal(res.data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(filters, page); }, [filters, page, fetchProducts]);

  function handleFilterChange(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="section-title">All Products</h1>
        {!loading && (
          <p className="text-slate-500 text-sm mt-1">
            {total} {total === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      <ProductSearch onChange={handleFilterChange} />
      <ProductList products={products} loading={loading} currency={currency} />
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
