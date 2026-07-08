import {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {telegramUtils} from '../utils/telegram';
import {TelegramUserResponse, userService} from '../services/userService';

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

    const refreshUser = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const initData = telegramUtils.getInitData();
            
            if (!initData) {
                throw new Error('Telegram initData not available');
            }

            const userData = await userService.login(initData);
            setUser(userData);
            setRole(userData.role || null);
        } catch (err) {
            console.error('Error fetching user data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch user data');
        } finally {
            setIsLoading(false);
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
