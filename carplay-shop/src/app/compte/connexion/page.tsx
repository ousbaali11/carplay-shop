import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <section className="container auth-section w-420">
        <LoginForm />
      </section>
      <Footer />
    </>
  );
}
