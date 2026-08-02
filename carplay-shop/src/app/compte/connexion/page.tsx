import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <Header />
      <section className="container" style={{ padding: "60px 0", maxWidth: 420 }}>
        <LoginForm />
      </section>
      <Footer />
    </>
  );
}
