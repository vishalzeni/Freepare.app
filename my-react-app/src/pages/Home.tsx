import Hierarchy from "./Hierarchy/Hierarchy";
import Navbar from "../components/Navbar";
import SessionExpireDialog from "../SessionExpireCheck/SessionExpireDialog";
import JoinUs from "../components/JoinUs";
import Footer from "../components/Footer";
import WhyFreepare from "../components/WhyFreepare";
import FAQ from "../components/FAQ";

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-sky-100">
      <div className="bg-gradient-to-b from-[#fbfdff] to-sky-100">
        <Navbar />
        <main aria-label="Main content">
          <Hierarchy />
        </main>
        <section aria-label="Signup" className="mx-auto w-full max-w-7xl">
          <JoinUs />
        </section>
        <section aria-label="Why Freepare" className="mx-auto w-full max-w-7xl">
          <WhyFreepare />
        </section>
        <section aria-label="FAQ" className="mx-auto w-full max-w-7xl">
          <FAQ />
        </section>
        <section aria-label="Footer" className="mx-auto w-full max-w-7xl">
          <Footer />
        </section>
      </div>
      <SessionExpireDialog />
    </div>
  );
};

export default Home;
