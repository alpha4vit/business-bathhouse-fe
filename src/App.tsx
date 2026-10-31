import {BrowserRouter as Router, Route, Routes, useLocation, useNavigate, useSearchParams} from 'react-router-dom'
import {lazy, Suspense, useEffect, useState} from 'react'
import LoadingScreen from "./components/LoadingScreen.tsx";
import Navbar from "./components/Navbar.tsx";
import {AUTH_ERROR_EVENT, MANDATORY_CHAT_SUBSCRIPTION_EVENT} from "./utils/apiClient.ts";
import {UserProvider} from "./contexts/UserContext.tsx";
import MandatoryChatsPage from "./components/MandatoryChatsPage.tsx";
import './App.css';

const InvoicePage = lazy(() => import("./components/InvoicePage.tsx"));
const PersonalCabinet = lazy(() => import("./components/PersonalCabinet.tsx"));
const SpecialOffers = lazy(() => import("./components/SpecialOffers.tsx"));
const SpecialOffersAdmin = lazy(() => import("./components/SpecialOffersAdmin.tsx"));
const PointsInstructions = lazy(() => import("./components/PointsInstructions.tsx"));
const ResidentSearch = lazy(() => import("./components/ResidentSearch.tsx"));
const PointsAdjustmentsTable = lazy(() => import("./components/PointsAdjustmentsTable.tsx"));
const TransactionHistory = lazy(() => import("./components/TransactionHistory.tsx"));
const EventsPage = lazy(() => import("./components/EventsPage.tsx"));
const NewsletterSender = lazy(() => import("./components/NewsletterSender.tsx"));
const EventRegistrationsPage = lazy(() => import("./components/EventRegistrationsPage.tsx"));
const EventsAdmin = lazy(() => import("./components/EventsAdmin.tsx"));
const BalanceAdjustmentPage = lazy(() => import("./components/BalanceAdjustmentPage.tsx"));
const UserDeactivationPage = lazy(() => import("./components/UserDeactivationPage.tsx"));
const ChatsPage = lazy(() => import("./components/ChatsPage.tsx"));
const LoyaltyAdmin = lazy(() => import("./components/LoyaltyAdmin.tsx"));
const SupportPage = lazy(() => import("./components/SupportPage.tsx"));
const RegistrationPage = lazy(() => import("./components/RegistrationPage.tsx"));
const ReportsPage = lazy(() => import("./components/ReportsPage.tsx"));
const OtpLoginPage = lazy(() => import("./components/OtpLoginPage.tsx"));
const MembershipAdjustmentPage = lazy(() => import("./components/MembershipAdjustmentPage.tsx"));

function AppContent() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [_, setAuthError] = useState<{ message: string } | null>(null);
    const [showMandatoryChats, setShowMandatoryChats] = useState(false);
    const isRegisterPage = location.pathname === '/register' || location.pathname === '/otp-login';

    useEffect(() => {
        const startApp = searchParams.get('startapp');
        if (startApp && location.pathname === '/') {
            navigate(startApp);
        }
    }, [searchParams, navigate, location.pathname]);

    useEffect(() => {
        const handleAuthError = (event: Event) => {
            const customEvent = event as CustomEvent<{ message: string; status: number }>;
            // Не показывать модалку если пользователь уже был редиректнут на регистрацию
            if (window.location.pathname === '/register') {
                return;
            }
            // Don't redirect to registration page on 403 error - let users see their profile
            setAuthError(customEvent.detail);
        };

        window.addEventListener(AUTH_ERROR_EVENT, handleAuthError);
        return () => {
            window.removeEventListener(AUTH_ERROR_EVENT, handleAuthError);
        };
    }, [navigate, showMandatoryChats])

    useEffect(() => {
        const handleMandatoryChatSubscription = () => {
            // Only show mandatory chats page if not already on it
            if (!showMandatoryChats) {
                setShowMandatoryChats(true);
            }
        };

        window.addEventListener(MANDATORY_CHAT_SUBSCRIPTION_EVENT, handleMandatoryChatSubscription);

        return () => {
            window.removeEventListener(MANDATORY_CHAT_SUBSCRIPTION_EVENT, handleMandatoryChatSubscription);
        };
    }, [navigate, showMandatoryChats]);

    // Reset mandatory chats state when navigating to cabinet or other routes
    useEffect(() => {
        if (showMandatoryChats && (location.pathname === '/cabinet' || location.pathname === '/')) {
            setShowMandatoryChats(false);
        }
    }, [location.pathname, showMandatoryChats]);

    return (
        <div>
            <Navbar hideMenuButton={isRegisterPage || showMandatoryChats}/>
            <Suspense fallback={<LoadingScreen/>}>
                <Routes>
                    <Route path="/" element={<PersonalCabinet/>}/>
                    <Route path="/invoice" element={<InvoicePage/>}/>
                    <Route path="/invoice/individual" element={<InvoicePage/>}/>
                    <Route path="/cabinet" element={<PersonalCabinet/>}/>
                    <Route path="/offers" element={<SpecialOffers/>}/>
                    <Route path="/points/instructions" element={<PointsInstructions/>}/>
                    <Route path="/residents/search" element={<ResidentSearch/>}/>
                    <Route path="/transactions" element={<TransactionHistory/>}/>
                    <Route path="/events" element={<EventsPage/>}/>
                    <Route path="/events/registration" element={<EventRegistrationsPage/>}/>
                    <Route path="/admin/events" element={<EventsAdmin/>}/>
                    <Route path="/chats" element={<ChatsPage/>}/>
                    <Route path="/support" element={<SupportPage/>}/>
                    <Route path="/admin/newsletter" element={<NewsletterSender/>}/>
                    <Route path="/admin/points/adjustments" element={<PointsAdjustmentsTable/>}/>
                    <Route path="/admin/balance/adjustment" element={<BalanceAdjustmentPage/>}/>
                    <Route path="/admin/users/deactivate" element={<UserDeactivationPage/>}/>
                    <Route path="/admin/membership/adjustment" element={<MembershipAdjustmentPage/>}/>
                    <Route path="/admin/reports" element={<ReportsPage/>}/>
                    <Route path="/admin/special-offers" element={<SpecialOffersAdmin/>}/>
                    <Route path="/admin/loyalty" element={<LoyaltyAdmin/>}/>
                    <Route path="/register" element={<RegistrationPage/>}/>
                    <Route path="/otp-login" element={<OtpLoginPage/>}/>
                </Routes>
            </Suspense>
            {showMandatoryChats && (
                <div className="mandatory-chats-overlay">
                    <MandatoryChatsPage/>
                </div>
            )}
        </div>
    );
}

function App() {
    return (
        <Router>
            <UserProvider>
                <AppContent/>
            </UserProvider>
        </Router>
    )
}

export default App
