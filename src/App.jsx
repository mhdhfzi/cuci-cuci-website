import { useState } from "react";
import { LangProvider } from "./i18n";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServiceMarquee from "./components/ServiceMarquee";
import About from "./components/About";
import Services from "./components/Services";
import HowItWorks from "./components/HowItWorks";
import WhyChooseUs from "./components/WhyChooseUs";
import Gallery from "./components/Gallery";
import Reviews from "./components/Reviews";
import Location from "./components/Location";
import EnquiryForm from "./components/EnquiryForm";
import ClosingCta from "./components/ClosingCta";
import Footer from "./components/Footer";
import FloatingWhatsApp from "./components/FloatingWhatsApp";

export default function App() {
  // Set when a service card's "Get a quote" is clicked; the form pre-selects it.
  // A fresh object each click so re-selecting the same service still applies.
  const [selectedService, setSelectedService] = useState(null);
  // Gallery filter ("all" or a service id) — set from the gallery or a service card.
  const [galleryFilter, setGalleryFilter] = useState("all");

  return (
    <LangProvider>
      <Navbar />
      <main id="main">
        <Hero />
        <ServiceMarquee />
        <About />
        <Services onSelect={(id) => setSelectedService({ id })} onViewWork={setGalleryFilter} />
        <HowItWorks />
        <WhyChooseUs />
        <Gallery filter={galleryFilter} onFilterChange={setGalleryFilter} />
        <Reviews />
        <Location />
        <EnquiryForm selectedService={selectedService} />
        <ClosingCta />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </LangProvider>
  );
}
