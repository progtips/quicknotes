import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { AxiosError } from 'axios';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const RegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    console.log('Регистрация: отправляем запрос', { email, passwordLength: password?.length, confirmPasswordLength: confirmPassword?.length });
    
    // Предотвращаем множественные клики
    if (isLoading) {
      console.log('Регистрация уже выполняется, пропускаем');
      return;
    }

    // Очищаем предыдущие ошибки
    setErrorMessage(null);

    // Валидация: проверяем, что email не пустой
    console.log('Регистрация: проверка email', { email, trimmed: email?.trim() });
    if (!email || !email.trim()) {
      console.log('Регистрация: email пустой');
      const error = 'Введите email';
      setErrorMessage(error);
      Alert.alert('Ошибка', error);
      return;
    }

    // Валидация: проверяем, что пароли заполнены
    console.log('Регистрация: проверка паролей', { hasPassword: !!password, hasConfirmPassword: !!confirmPassword });
    if (!password || !confirmPassword) {
      console.log('Регистрация: пароли не заполнены');
      const error = 'Заполните все поля';
      setErrorMessage(error);
      Alert.alert('Ошибка', error);
      return;
    }

    // Валидация: проверяем, что пароли совпадают
    console.log('Регистрация: проверка совпадения паролей', { passwordsMatch: password === confirmPassword });
    if (password !== confirmPassword) {
      console.log('Регистрация: пароли не совпадают');
      const error = 'Пароли не совпадают';
      setErrorMessage(error);
      Alert.alert('Ошибка', error);
      return;
    }

    // Валидация: проверяем минимальную длину пароля
    console.log('Регистрация: проверка длины пароля', { passwordLength: password.length });
    if (password.length < 6) {
      console.log('Регистрация: пароль слишком короткий');
      const error = 'Пароль должен содержать минимум 6 символов';
      setErrorMessage(error);
      Alert.alert('Ошибка', error);
      return;
    }

    console.log('Регистрация: все проверки пройдены, начинаем регистрацию');
    setIsLoading(true);
    
    try {
      console.log('Регистрация: вызываем register из AuthContext', { email, registerFunction: typeof register });
      if (!register || typeof register !== 'function') {
        throw new Error('Функция register не доступна из AuthContext');
      }
      await register(email, password);
      console.log('Регистрация: успешно завершена');
      // Навигация произойдет автоматически через RootNavigator при изменении user в AuthContext
    } catch (error) {
      console.error('Регистрация: ошибка', error);
      
      // Обработка ошибок с сервера
      const axiosError = error as AxiosError<{ error?: string; message?: string }>;
      
      let errorMessage = 'Не удалось зарегистрироваться';
      
      if (axiosError.response) {
        // Ошибка от сервера
        const serverError = axiosError.response.data;
        const status = axiosError.response.status;
        
        // Специальная обработка для 409 Conflict (пользователь уже существует)
        if (status === 409) {
          errorMessage = serverError?.error || serverError?.message || 'Пользователь с таким email уже зарегистрирован';
        } else {
          // Для других ошибок показываем общее сообщение + детали с сервера
          const serverMessage = serverError?.error || serverError?.message;
          errorMessage = serverMessage 
            ? `Ошибка регистрации: ${serverMessage}` 
            : `Ошибка регистрации (код ${status})`;
        }
        
        console.error('Регистрация: ошибка сервера', {
          status,
          data: serverError,
        });
      } else if (axiosError.request) {
        // Запрос отправлен, но ответа нет
        errorMessage = 'Не удалось подключиться к серверу. Проверьте подключение к интернету.';
        console.error('Регистрация: нет ответа от сервера', axiosError.request);
      } else {
        // Ошибка при настройке запроса
        errorMessage = axiosError.message || error?.toString() || 'Произошла ошибка при регистрации';
        console.error('Регистрация: ошибка запроса', axiosError.message || error);
      }
      
      setErrorMessage(errorMessage);
      Alert.alert('Ошибка регистрации', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

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

      <TextInput
        style={styles.input}
        placeholder="Подтвердите пароль"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={() => {
          console.log('Кнопка "Зарегистрироваться" нажата');
          handleRegister();
        }}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Зарегистрироваться</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={handleNavigateToLogin}
        disabled={isLoading}
      >
        <Text style={styles.switchText}>Уже есть аккаунт? Войти</Text>
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
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default RegisterScreen;

