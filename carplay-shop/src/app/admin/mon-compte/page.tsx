import AdminSidebar from "@/components/AdminSidebar";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="admin-layout">
      <AdminSidebar active="mon-compte" />
      <div className="admin-main">
        <div className="page-header">
          <h1 className="page-title">Mon compte</h1>
          <p className="page-lead">Connecté en tant que {session?.user?.email}</p>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
