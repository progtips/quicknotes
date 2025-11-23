import React from 'react';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  // Логируем изменения состояния для отладки
  React.useEffect(() => {
    const stateInfo = {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userEmail: user?.email,
    };
    console.log('RootNavigator: состояние изменилось', stateInfo);
  }, [isAuthenticated, isLoading, user]);

  // Обработка ошибок навигации
  React.useEffect(() => {
    try {
      // Проверяем доступность навигации
      if (typeof NavigationContainer === 'undefined') {
        setError('NavigationContainer недоступен');
        return;
      }
      setError(null);
    } catch (err) {
      setError(`Ошибка инициализации навигации: ${err}`);
    }
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Загрузка приложения...</Text>
        <Text style={styles.debugText}>
          Состояние: isLoading={String(isLoading)}
        </Text>
        <Text style={styles.debugText}>
          isAuthenticated: {String(isAuthenticated)}
        </Text>
        <Text style={styles.debugText}>
          Пользователь: {user ? user.email : 'не загружен'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>❌ Ошибка навигации</Text>
        <Text style={styles.debugText}>{error}</Text>
      </View>
    );
  }

  // Конфигурация linking для веб-платформы
  const linking: LinkingOptions<any> | undefined = Platform.select({
    web: {
      enabled: true,
      prefixes: ['/'],
      config: {
        screens: {
          // AuthStack
          Login: '/login',
          Register: '/register',
          // AppStack
          MainTabs: {
            screens: {
              Notes: '/',
              Settings: '/settings',
            },
          },
          NoteEdit: '/notes/:noteId?',
        },
      },
    },
    default: undefined,
  });

  try {
    return (
      <NavigationContainer
        linking={linking}
        onReady={() => {
          console.log('✅ NavigationContainer готов');
        }}
        onStateChange={(state) => {
          console.log('🔄 Навигация изменилась:', state?.routes?.[state?.index]?.name);
        }}
      >
        {isAuthenticated ? (
          <>
            <View style={styles.debugBanner}>
              <Text style={styles.debugBannerText}>
                🔐 Авторизован: {user?.email || 'неизвестно'} | Экран: AppStack
              </Text>
            </View>
            <AppStack />
          </>
        ) : (
          <>
            <View style={styles.debugBanner}>
              <Text style={styles.debugBannerText}>
                🔓 Не авторизован | Экран: AuthStack
              </Text>
            </View>
            <AuthStack />
          </>
        )}
      </NavigationContainer>
    );
  } catch (err) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>❌ Ошибка рендеринга навигации</Text>
        <Text style={styles.debugText}>{String(err)}</Text>
        <Text style={styles.debugText}>
          isAuthenticated: {String(isAuthenticated)}
        </Text>
        <Text style={styles.debugText}>
          isLoading: {String(isLoading)}
        </Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff0000',
    marginBottom: 8,
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  debugBanner: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#007AFF',
  },
  debugBannerText: {
    fontSize: 10,
    color: '#007AFF',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

