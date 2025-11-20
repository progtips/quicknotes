import { Stack } from 'expo-router';

export default function NoteLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="[id]" options={{ title: 'Заметка' }} />
    </Stack>
  );
}

