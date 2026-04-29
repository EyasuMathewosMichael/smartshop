import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import RatingDisplay from '../components/products/RatingDisplay';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import Loader from '../components/common/Loader';

const DEFAULT_RATE = 56.5;

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const currency = localStorage.getItem('currency') || 'USD';
  const rate = parseFloat(localStorage.getItem('etbRate')) || DEFAULT_RATE;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get(`/products/${id}/reviews`),
    ]).then(([prodRes, revRes]) => {
      setProduct(prodRes.data.product || prodRes.data);
      setReviews(revRes.data.reviews || []);
    }).catch(() => {
      setError('Product not found.');
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAddingToCart(true);
    try { await addItem(product._id, quantity); }
    finally { setAddingToCart(false); }
  }

  function formatPrice(price) {
    if (currency === 'ETB') return `ETB ${(price * rate).toFixed(2)}`;
    return `$${price.toFixed(2)}`;
  }

  async function fetchReviews() {
    try {
      const res = await api.get(`/products/${id}/reviews`);
      setReviews(res.data.reviews || []);
    } catch { /* silently fail */ }
  }

  if (loading) return <Loader />;
  if (error) return (
    <div className="page-container text-center py-20">
      <p className="text-slate-500 mb-4">{error}</p>
      <Link to="/products" className="btn-primary">Back to Products</Link>
    </div>
  );
  if (!product) return null;

  const images = product.images || [];
  const outOfStock = !product.isAvailable || product.stock === 0;

  return (
    <div className="page-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/products" className="hover:text-indigo-600 transition-colors">Products</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-600 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="card overflow-hidden aspect-square bg-slate-50 flex items-center justify-center">
            {images[selectedImage]?.url ? (
              <img
                src={images[selectedImage].url}
                alt={product.name}
                className="w-full h-full object-contain cursor-zoom-in hover:scale-105 transition-transform duration-300"
                onClick={() => window.open(images[selectedImage].url, '_blank')}
              />
            ) : (
              <div className="text-slate-200">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === selectedImage ? 'border-indigo-500 shadow-md' : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">{product.category}</p>
            <h1 className="text-2xl font-bold text-slate-800 leading-tight">{product.name}</h1>
          </div>

          <RatingDisplay rating={product.averageRating || 0} count={product.reviewCount || 0} size="lg" />

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-800">{formatPrice(product.price)}</span>
            {currency === 'ETB' && (
              <span className="text-sm text-slate-400">(${product.price.toFixed(2)} USD)</span>
            )}
          </div>

          {/* Stock status */}
          <div>
            {outOfStock ? (
              <span className="badge bg-red-100 text-red-700 text-sm px-3 py-1">Out of Stock</span>
            ) : (
              <span className="badge bg-emerald-100 text-emerald-700 text-sm px-3 py-1">
                In Stock {product.stock <= 10 && `(${product.stock} left)`}
              </span>
            )}
          </div>

          <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>

          {/* Quantity + Add to cart */}
          {!outOfStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  aria-label="Decrease"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-10 text-center font-semibold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
                  aria-label="Increase"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn-primary flex-1 py-3"
              >
                {addingToCart ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Adding…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Customer Reviews</h2>
          {product.reviewCount > 0 && (
            <RatingDisplay rating={product.averageRating || 0} count={product.reviewCount || 0} size="lg" />
          )}
        </div>

        {isAuthenticated && (
          <ReviewForm productId={id} onReviewAdded={fetchReviews} />
        )}

        <div className="card p-5">
          <ReviewList reviews={reviews} onReviewChanged={fetchReviews} />
        </div>
      </div>
    </div>
  );
}
