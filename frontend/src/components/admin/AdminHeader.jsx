export default function AdminHeader({ title }) {
  return (
    <div className="hidden md:block sticky top-0 z-20 bg-slate-50 border-b border-slate-200 px-6 py-4 -mx-6 -mt-6 mb-6">
      <h1 className="text-xl font-bold text-slate-800">{title}</h1>
    </div>
  );
}
