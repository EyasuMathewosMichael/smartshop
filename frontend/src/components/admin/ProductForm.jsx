import { useState, useEffect } from 'react';
import api from '../../utils/api';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys', 'Beauty', 'Food', 'Other'];

export default function ProductForm({ product, onSaved, onCancel }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || CATEGORIES[0],
    stock: product?.stock || ''
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) errs.price = 'Valid price required';
    if (form.stock === '' || isNaN(form.stock) || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);

    try {
      // Always use FormData so images can be included in the same request
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', Number(form.price));
      formData.append('stock', Number(form.stock));
      formData.append('category', form.category);
      images.forEach(img => formData.append('images', img));

      if (isEdit) {
        await api.put(`/products/${product._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      onSaved?.();
    } catch (err) {
      setApiError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'Failed to save product.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleImageChange(e) {
    const files = Array.from(e.target.files).slice(0, 5);
    setImages(files);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {apiError && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded text-sm" role="alert">
          {apiError}
        </div>
      )}

      <div>
        <label htmlFor="pname" className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input
          id="pname"
          type="text"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="pdesc" className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
        <textarea
          id="pdesc"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
        />
        {errors.description && <p className="text-red-600 text-xs mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pprice" className="block text-xs font-medium text-gray-600 mb-1">Price (USD) *</label>
          <input
            id="pprice"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.price ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.price && <p className="text-red-600 text-xs mt-1">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="pstock" className="block text-xs font-medium text-gray-600 mb-1">Stock *</label>
          <input
            id="pstock"
            type="number"
            min="0"
            value={form.stock}
            onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
            className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-400' : 'border-gray-300'}`}
          />
          {errors.stock && <p className="text-red-600 text-xs mt-1">{errors.stock}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="pcategory" className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
        <select
          id="pcategory"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="pimages" className="block text-xs font-medium text-gray-600 mb-1">
          Images (up to 5)
        </label>
        <input
          id="pimages"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="w-full text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {images.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
