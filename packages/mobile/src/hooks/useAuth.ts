import { useState, useEffect } from 'react';
import { tokenStorage } from '../utils/storage';

interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await tokenStorage.getUser();
        if (userData) {
          setUser(userData as User);
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, isLoading };
};

