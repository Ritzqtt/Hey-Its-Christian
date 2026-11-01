import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Portfolio from "./pages/Portfolio";
import ParticleNetwork from "./components/ParticleNetwork";
import LoadingScreen from "./components/LoadingScreen";

import "./App.css";

function App() {
  return (
    <>
      <LoadingScreen />

      <ParticleNetwork />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
