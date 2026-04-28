import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import Invoice from "./components/Invoice.tsx";
import PersonalCabinet from "./components/PersonalCabinet.tsx";
import SpecialOffers from "./components/SpecialOffers.tsx";
import PointsInstructions from "./components/PointsInstructions.tsx";
import ResidentSearch from "./components/ResidentSearch.tsx";
import Navbar from "./components/Navbar.tsx";

function App() {
    return (
        <Router basename="/view">
            <div>
                <Navbar />
                <Routes>
                    <Route path="/" element={<div><h1>Home Page</h1></div>}/>
                    <Route path="/invoice" element={<Invoice/>}/>
                    <Route path="/cabinet" element={<PersonalCabinet/>}/>
                    <Route path="/offers" element={<SpecialOffers/>}/>
                    <Route path="/points/instructions" element={<PointsInstructions/>}/>
                    <Route path="/residents/search" element={<ResidentSearch/>}/>
                </Routes>
            </div>
        </Router>
    )
}

export default App
