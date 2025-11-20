import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import NotesListScreen from '../screens/app/NotesListScreen';
import NoteEditScreen from '../screens/app/NoteEditScreen';
import SettingsScreen from '../screens/app/SettingsScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  NoteEdit: { noteId?: string };
};

export type MainTabsParamList = {
  Notes: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Notes"
        component={NotesListScreen}
        options={{
          title: 'Заметки',
          tabBarLabel: 'Заметки',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Настройки',
          tabBarLabel: 'Настройки',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NoteEdit"
        component={NoteEditScreen}
        options={{ title: 'Заметка' }}
      />
    </Stack.Navigator>
  );
};

