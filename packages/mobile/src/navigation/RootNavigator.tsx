import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Логируем изменения состояния для отладки
  React.useEffect(() => {
    console.log('RootNavigator: состояние изменилось', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userEmail: user?.email,
    });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

