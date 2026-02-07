import FarmerCard from "@/components/landingpage/Services"
import Navbar from "@/components/landingpage/NavBar";
import HeroSection from "@/components/landingpage/HeroSection";
import BenefitsSection from "@/components/landingpage/whatweProvide";
import FarmingBasics from "@/components/landingpage/FarmingBasics";
import HowItWorks from "@/components/landingpage/HowItWorks";
import FAQ from "@/components/landingpage/FAQ";
import Footer from "@/components/landingpage/Footer";
export default function Home() {
  return (
    <div className="flex flex-col">
    <div className="relative min-h-screen">
      <Navbar/>
      <HeroSection/>
       
     
    </div>
    <div>
      <HowItWorks/>
       <BenefitsSection/>
       <FarmingBasics/>
     <FAQ/>
     <Footer/>
    </div>
    </div>
  );
}