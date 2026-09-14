import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <section className="container auth-section w-440">
        <RegisterForm />
      </section>
      <Footer />
    </>
  );
}
