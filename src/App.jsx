import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";

import About from "./sections/About";
import Resume from "./sections/Resume";
import Skills from "./sections/Skills";
import Services from "./sections/Services";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";

import "./App.css";

function App() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(
        window.scrollY > window.innerHeight - 100
      );
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Home />

      {showNavbar && <Navbar />}

      <main>
        <About />
        <Resume />
        <Skills />
        <Services />
        <Projects />
        <Contact />
      </main>
    </>
  );
}

export default App;