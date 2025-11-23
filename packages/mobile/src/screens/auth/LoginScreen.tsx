import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AxiosError } from 'axios';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Инициализация...');

  React.useEffect(() => {
    console.log('✅ LoginScreen: компонент загружен');
    setDebugInfo('LoginScreen загружен');
    
    try {
      if (!navigation) {
        setDebugInfo('❌ Ошибка: navigation недоступен');
        return;
      }
      if (!login) {
        setDebugInfo('❌ Ошибка: login функция недоступна');
        return;
      }
      setDebugInfo('✅ LoginScreen готов к работе');
    } catch (error) {
      setDebugInfo(`❌ Ошибка инициализации: ${error}`);
    }
  }, [navigation, login]);

  const handleLogin = async () => {
    console.log('LoginScreen.handleLogin: начало', { email, hasPassword: !!password });
    
    if (!email || !password) {
      console.warn('LoginScreen.handleLogin: не заполнены поля');
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    setDebugInfo('Отправка запроса...');
    
    try {
      console.log('LoginScreen.handleLogin: вызываем login функцию');
      await login(email, password);
      console.log('LoginScreen.handleLogin: login успешно завершен');
      setDebugInfo('✅ Вход выполнен успешно');
      // Навигация произойдет автоматически через RootNavigator
    } catch (error) {
      console.error('LoginScreen.handleLogin: ошибка', error);
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 
                          axiosError.message || 
                          'Не удалось войти';
      setDebugInfo(`❌ Ошибка: ${errorMessage}`);
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      {__DEV__ && (
        <View style={styles.debugBanner}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      )}
      <Text style={styles.title}>Вход</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.loadingText}>Вход...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Войти</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={handleNavigateToRegister}
        disabled={isLoading}
      >
        <Text style={styles.switchText}>Нет аккаунта? Зарегистрироваться</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#007AFF',
    fontSize: 14,
  },
  debugBanner: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 8,
    marginBottom: 10,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#007AFF',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

