export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, currentPage - delta);
  const right = Math.min(totalPages, currentPage + delta);
  for (let i = left; i <= right; i++) pages.push(i);

  const btnBase = 'w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors';
  const btnActive = 'bg-indigo-600 text-white shadow-sm';
  const btnInactive = 'text-slate-600 hover:bg-slate-100 border border-slate-200';
  const btnDisabled = 'text-slate-300 cursor-not-allowed border border-slate-100';

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} px-3 ${currentPage === 1 ? btnDisabled : btnInactive}`}
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {left > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={`${btnBase} ${btnInactive}`}>1</button>
          {left > 2 && <span className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
          aria-current={p === currentPage ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {right < totalPages && (
        <>
          {right < totalPages - 1 && <span className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">…</span>}
          <button onClick={() => onPageChange(totalPages)} className={`${btnBase} ${btnInactive}`}>{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} px-3 ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
