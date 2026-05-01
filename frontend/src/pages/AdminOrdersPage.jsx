import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminOrderList from '../components/admin/AdminOrderList';

export default function AdminOrdersPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <AdminHeader title="Orders" />
          <AdminOrderList />
        </div>
      </main>
    </div>
  );
}
