import AdminSidebar from '../components/admin/AdminSidebar';
import UserManagement from '../components/admin/UserManagement';

export default function AdminUsersPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <UserManagement />
        </div>
      </main>
    </div>
  );
}
