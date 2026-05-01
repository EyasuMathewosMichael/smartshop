import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AdminDashboard from '../components/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <AdminHeader title="Dashboard" />
          <AdminDashboard />
        </div>
      </main>
    </div>
  );
}
