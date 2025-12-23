import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css'
import NavBar from './components/navbar.jsx';
import RoadMap from './pages/roadmap.jsx';
import Pricing from './pages/pricing.jsx';
import LandingPage from './pages/landing_page.jsx';

function App() {


  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<LandingPage />}/>
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  )

  
}



export default App
