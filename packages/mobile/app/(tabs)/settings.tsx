import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { logout } from '../../src/services/auth';
import { useAuth } from '../../src/hooks/useAuth';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Выход', 'Вы уверены, что хотите выйти?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          // Используем функцию logout из API клиента
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
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
}

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

