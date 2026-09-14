import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <>
      <Header />
      <section className="container auth-section w-420">
        <ResetPasswordForm token={searchParams.token || ""} />
      </section>
      <Footer />
    </>
  );
}
