import {BrowserRouter as Router, Route, Routes, useSearchParams} from 'react-router-dom'
import {useEffect, useState} from 'react'
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
import BalanceAdjustmentPage from "./components/BalanceAdjustmentPage.tsx"
import UserDeactivationPage from "./components/UserDeactivationPage.tsx";
import ChatsPage from "./components/ChatsPage.tsx";
import AccessDenied from "./components/AccessDenied.tsx";
import {AUTH_ERROR_EVENT} from "./utils/apiClient.ts";
import {UserProvider} from "./contexts/UserContext.tsx";

function AppContent() {
    const [searchParams] = useSearchParams();
    const [authError, setAuthError] = useState<{ message: string } | null>(null);

    useEffect(() => {
        // Получаем ID пользователя из URL параметров
        const userId = searchParams.get('id');

        if (userId) {
            // Сохраняем ID в localStorage если его нет или он отличается
            userStorage.setUserId(userId);
        }
    }, [searchParams]);

    useEffect(() => {
        const handleAuthError = (event: Event) => {
            const customEvent = event as CustomEvent<{ message: string }>;
            setAuthError(customEvent.detail);
        };

        window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);

        return () => {
            window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
        };
    }, []);

    return (
        <div>
            <Navbar/>
            <Routes>
                <Route path="/" element={<PersonalCabinet/>}/>
                <Route path="/invoice" element={<InvoicePage/>}/>
                <Route path="/cabinet"/>
                <Route path="/offers" element={<SpecialOffers/>}/>
                <Route path="/points/instructions" element={<PointsInstructions/>}/>
                <Route path="/residents/search" element={<ResidentSearch/>}/>
                <Route path="/transactions" element={<TransactionHistory/>}/>
                <Route path="/events" element={<EventsPage/>}/>
                <Route path="/events/registration" element={<EventRegistrationsPage/>}/>
                <Route path="/chats" element={<ChatsPage/>}/>
                <Route path="/admin/newsletter" element={<NewsletterSender/>}/>
                <Route path="/admin/points/adjustments" element={<PointsAdjustmentsTable/>}/>
                <Route path="/admin/balance/adjustment" element={<BalanceAdjustmentPage/>}/>
                <Route path="/admin/users/deactivate" element={<UserDeactivationPage/>}/>
            </Routes>
            {authError && (
                <AccessDenied
                    message={authError.message}
                    onDismiss={() => setAuthError(null)}
                />
            )}
        </div>
    );
}

function App() {
    return (
        <UserProvider>
            <Router>
                <AppContent/>
            </Router>
        </UserProvider>
    )
}

export default App
