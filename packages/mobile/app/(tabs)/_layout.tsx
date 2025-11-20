import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: Platform.select({
          web: {
            display: 'none',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Заметки',
          tabBarLabel: 'Заметки',
          headerTitle: 'Заметки',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Настройки',
          tabBarLabel: 'Настройки',
          headerTitle: 'Настройки',
        }}
      />
      <Tabs.Screen
        name="note"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

