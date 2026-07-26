import AdminSidebar from "@/components/AdminSidebar";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function AdminAccountPage() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar active="mon-compte" />
      <div style={{ flex: 1, padding: "36px 40px" }}>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Mon compte</h1>
        <p style={{ marginBottom: 24 }}>Connecté en tant que {session?.user?.email}</p>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
