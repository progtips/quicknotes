import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Компонент для отображения диагностической информации
const DiagnosticOverlay = ({ messages }: { messages: string[] }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <View style={styles.diagnosticContainer}>
      <View style={styles.diagnosticHeader}>
        <Text style={styles.diagnosticTitle}>🔍 Диагностика приложения</Text>
        <Text
          style={styles.diagnosticClose}
          onPress={() => setIsVisible(false)}
        >
          ✕
        </Text>
      </View>
      <ScrollView style={styles.diagnosticScroll}>
        {messages.map((msg, index) => (
          <Text key={index} style={styles.diagnosticText}>
            {msg}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

export default function App() {
  const [diagnosticMessages, setDiagnosticMessages] = useState<string[]>([]);
  const [appStage, setAppStage] = useState<string>('Инициализация...');

  const addDiagnosticMessage = React.useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const fullMessage = `[${timestamp}] ${message}`;
    setDiagnosticMessages((prev) => [...prev, fullMessage]);
    console.log(fullMessage);
  }, []);

  // Обработка глобальных ошибок для предотвращения пустого экрана
  React.useEffect(() => {
    addDiagnosticMessage('✅ App.tsx: Компонент монтирован');
    setAppStage('Настройка обработчиков ошибок...');

    if (typeof window === 'undefined') {
      addDiagnosticMessage('⚠️ window не определен (не веб-платформа)');
      return;
    }

    addDiagnosticMessage('✅ window доступен');

    const errorHandler = (error: ErrorEvent) => {
      addDiagnosticMessage(`❌ Глобальная ошибка: ${error.error?.message || error.message}`);
      console.error('Глобальная ошибка:', error.error);
    };

    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      addDiagnosticMessage(`❌ Необработанное отклонение промиса: ${event.reason}`);
      console.error('Необработанное отклонение промиса:', event.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    addDiagnosticMessage('✅ Обработчики ошибок установлены');

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, [addDiagnosticMessage]);

  React.useEffect(() => {
    addDiagnosticMessage('✅ ErrorBoundary: Инициализирован');
    setAppStage('Загрузка провайдеров...');
  }, [addDiagnosticMessage]);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <View style={styles.container}>
              <RootNavigator />
              {__DEV__ && (
                <DiagnosticOverlay messages={diagnosticMessages} />
              )}
            </View>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  diagnosticContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 300,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 10,
    ...Platform.select({
      web: {
        zIndex: 9999,
      },
      default: {
        zIndex: 9999,
      },
    }),
  },
  diagnosticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diagnosticTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  diagnosticClose: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 4,
  },
  diagnosticScroll: {
    maxHeight: 250,
  },
  diagnosticText: {
    color: '#0f0',
    fontSize: 11,
    fontFamily: Platform.select({
      web: 'monospace',
      default: 'monospace',
    }),
    marginBottom: 4,
  },
});

