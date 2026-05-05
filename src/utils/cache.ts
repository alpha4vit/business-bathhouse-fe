import { useState, useEffect } from 'react';

interface CacheItem<T> {
    data: T;
    timestamp: number;
    key: string;
}

class SimpleCache {
    private cache = new Map<string, CacheItem<any>>();
    private readonly TTL = 5 * 60 * 1000; // 5 минут

    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            key
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        
        if (!item) {
            return null;
        }

        // Проверяем TTL
        if (Date.now() - item.timestamp > this.TTL) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    clear(): void {
        this.cache.clear();
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    size(): number {
        return this.cache.size;
    }

    // Очистка устаревших записей
    cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > this.TTL) {
                this.cache.delete(key);
            }
        }
    }
}

export const cache = new SimpleCache();

// Хук для кеширования данных
export function useCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    dependencies: any[] = []
): {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
} {
    const [data, setData] = useState<T | null>(() => cache.get<T>(key));
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await fetcher();
            cache.set(key, result);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка');
        } finally {
            setLoading(false);
        }
    };

    const refetch = () => {
        cache.delete(key);
        fetchData();
    };

    useEffect(() => {
        // Проверяем кеш при монтировании
        const cachedData = cache.get<T>(key);
        if (cachedData) {
            setData(cachedData);
        } else {
            fetchData();
        }
    }, dependencies);

    return { data, loading, error, refetch };
}
