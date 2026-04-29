import AdminSidebar from '../components/admin/AdminSidebar';
import ProductManagement from '../components/admin/ProductManagement';

export default function AdminProductsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <ProductManagement />
        </div>
      </main>
    </div>
  );
}
