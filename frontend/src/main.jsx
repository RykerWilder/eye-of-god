import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Layout    from './components/Layout'
import HomePage  from './pages/HomePage'
import ThreatIntel from './pages/threatIntel/ThreatIntel'
import UtilityLinks from './pages/UtilityLinks'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/threat-intel" element={<ThreatIntel />} />
          <Route path="utility-links" element={<UtilityLinks />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)