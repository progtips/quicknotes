import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { tokenStorage } from '../src/utils/storage';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Используем универсальное хранилище токенов
        const token = await tokenStorage.getToken();
        setHasToken(!!token);
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return null;
  }

  if (hasToken) {
    return <Redirect href="/(tabs)/notes" />;
  }

  return <Redirect href="/(auth)/login" />;
}

