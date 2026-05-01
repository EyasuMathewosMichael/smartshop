export default function AdminHeader({ title }) {
  return (
    // Desktop only — hidden on mobile (mobile uses the top bar in AdminSidebar)
    <div className="hidden md:flex items-center bg-white border-b border-slate-200 px-6 py-4 shrink-0 z-10">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
    </div>
  );
}
