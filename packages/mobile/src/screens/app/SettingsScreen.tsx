import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    console.log('SettingsScreen: handleLogout вызван');
    
    // Предотвращаем множественные вызовы
    if (isLoggingOut) {
      console.log('SettingsScreen: выход уже выполняется, пропускаем');
      return;
    }
    
    // На web используем window.confirm, на native - Alert.alert
    if (Platform.OS === 'web') {
      // Используем setTimeout для неблокирующего выполнения
      setTimeout(() => {
        const confirmed = window.confirm('Вы уверены, что хотите выйти?');
        if (confirmed) {
          performLogout();
        } else {
          console.log('SettingsScreen: выход отменен');
        }
      }, 0);
    } else {
      Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
        { 
          text: 'Отмена', 
          style: 'cancel',
          onPress: () => {
            console.log('SettingsScreen: выход отменен');
          },
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const performLogout = async () => {
    if (isLoggingOut) {
      console.log('SettingsScreen: выход уже выполняется, пропускаем');
      return;
    }

    try {
      setIsLoggingOut(true);
      console.log('SettingsScreen: начало выхода, вызываем logout');
      await logout();
      console.log('SettingsScreen: logout завершен успешно');
      // Навигация произойдет автоматически через RootNavigator при изменении user в AuthContext
    } catch (error) {
      console.error('SettingsScreen: ошибка при выходе', error);
      if (Platform.OS === 'web') {
        window.alert('Не удалось выйти из аккаунта. Попробуйте еще раз.');
      } else {
        Alert.alert('Ошибка', 'Не удалось выйти из аккаунта. Попробуйте еще раз.');
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Профиль</Text>
        <View style={styles.profileCard}>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  email: {
    fontSize: 16,
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;

