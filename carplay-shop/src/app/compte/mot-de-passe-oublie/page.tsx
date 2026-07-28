import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <section className="container" style={{ padding: "60px 0", maxWidth: 420 }}>
        <ForgotPasswordForm />
      </section>
      <Footer />
    </>
  );
}
