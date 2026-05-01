import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title="Dashboard" />
        <main className="flex-1 overflow-y-auto p-6 pt-20 md:pt-6">
          <div className="max-w-7xl mx-auto">
            <AdminDashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
