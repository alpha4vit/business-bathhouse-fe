import {BrowserRouter as Router, Route, Routes, useSearchParams} from 'react-router-dom'
import {useEffect} from 'react'
import InvoicePage from "./components/InvoicePage.tsx";
import PersonalCabinet from "./components/PersonalCabinet.tsx";
import SpecialOffers from "./components/SpecialOffers.tsx";
import PointsInstructions from "./components/PointsInstructions.tsx";
import ResidentSearch from "./components/ResidentSearch.tsx";
import PointsAdjustmentsTable from "./components/PointsAdjustmentsTable.tsx";
import TransactionHistory from "./components/TransactionHistory.tsx";
import EventsPage from "./components/EventsPage.tsx";
import NewsletterSender from "./components/NewsletterSender.tsx";
import Navbar from "./components/Navbar.tsx";
import {userStorage} from "./utils/userStorage.ts";
import EventRegistrationsPage from "./components/EventRegistrationsPage.tsx";

function AppContent() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Получаем ID пользователя из URL параметров
        const userId = searchParams.get('userId');

        if (userId) {
            // Сохраняем ID в localStorage если его нет или он отличается
            userStorage.setUserId(userId);
        }
    }, [searchParams]);

    return (
        <div>
            <Navbar/>
            <Routes>
                <Route path="/" element={<div><h1>Home Page</h1></div>}/>
                <Route path="/invoice" element={<InvoicePage/>}/>
                <Route path="/cabinet" element={<PersonalCabinet/>}/>
                <Route path="/offers" element={<SpecialOffers/>}/>
                <Route path="/points/instructions" element={<PointsInstructions/>}/>
                <Route path="/residents/search" element={<ResidentSearch/>}/>
                <Route path="/points/adjustments" element={<PointsAdjustmentsTable/>}/>
                <Route path="/transactions" element={<TransactionHistory/>}/>
                <Route path="/events" element={<EventsPage/>}/>
                <Route path="/newsletter" element={<NewsletterSender/>}/>
                <Route path="/events/registration" element={<EventRegistrationsPage/>}/>
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router basename="/view">
            <AppContent/>
        </Router>
    )
}

export default App
