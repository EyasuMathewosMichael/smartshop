import { useState, useRef } from 'react';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name A–Z' },
];

export default function ProductSearch({ onChange }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const debounceRef = useRef(null);

  function emit(overrides = {}) {
    onChange?.({ search, category, minPrice, maxPrice, sortBy, ...overrides });
  }

  function handleSearch(e) {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => emit({ search: val }), 300);
  }

  return (
    <div className="card p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products…"
            className="input pl-9"
            aria-label="Search products"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); emit({ category: e.target.value }); }}
          className="input"
          aria-label="Filter by category"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Price range */}
        <div className="flex gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            onBlur={() => emit({})}
            placeholder="Min $"
            min="0"
            className="input"
            aria-label="Minimum price"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            onBlur={() => emit({})}
            placeholder="Max $"
            min="0"
            className="input"
            aria-label="Maximum price"
          />
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => { setSortBy(e.target.value); emit({ sortBy: e.target.value }); }}
          className="input"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}
