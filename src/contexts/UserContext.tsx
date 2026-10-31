import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {TelegramUserResponse, userService} from '../services/userService';
import {telegramUtils} from "../utils/telegram.ts";
import {useNavigate} from "react-router-dom";

interface UserContextType {
    user: TelegramUserResponse | null;
    role: string | null;
    isLoading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
    const [user, setUser] = useState<TelegramUserResponse | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const navigate = useNavigate();

    const refreshUser = async () => {
        if (isFetching) return;
        
        setIsFetching(true);
        setIsLoading(true);
        setError(null);
        
        try {
            const userData = await userService.getCurrentUser();
            setUser(userData);
            setRole(userData.role || null);
            setIsLoading(false);
        } catch (err) {
            let initData = telegramUtils.getInitData()

            console.error('Error fetching user data:', err);
            // При ошибке авторизации редиректим на регистрацию
            // Не устанавливаем isLoading=false чтобы предотвратить моргание
            if (window.location.pathname !== '/register' && window.location.pathname !== '/otp-login') {
                if (!initData){
                    navigate('/otp-login')
                } else {
                    navigate('/register')
                }
            } else {
                setIsLoading(false);
            }
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <UserContext.Provider value={{ user, role, isLoading, error, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};
