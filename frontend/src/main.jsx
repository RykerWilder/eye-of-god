import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Layout    from './components/Layout'
import HomePage  from './pages/HomePage'
import Recon from './pages/recon/Recon'
import UtilityLinks from './pages/UtilityLinks'
import ThreatIntel from "./pages/threat-intel/ThreatIntel";



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recon" element={<Recon />} />
          <Route path="utility-links" element={<UtilityLinks />} /> 
          <Route path="/threat-intel" element={<ThreatIntel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)