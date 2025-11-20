import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNoteById, updateNote, createNote } from '../../../src/services/notes';

export default function NoteEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  const { data: noteData, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id!),
    enabled: !isNew,
  });

  useEffect(() => {
    if (noteData?.data?.note) {
      const note = noteData.data.note;
      setTitle(note.title);
      setContent(note.content);
      setIsArchived(note.isArchived);
    }
  }, [noteData]);

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isArchived: boolean }) =>
      updateNote(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось сохранить заметку');
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать заметку');
    },
  });

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Заголовок обязателен');
      return;
    }

    if (isNew) {
      createMutation.mutate({ title, content });
    } else {
      updateMutation.mutate({ title, content, isArchived });
    }
  };

  if (!isNew && isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isLoadingMutation = updateMutation.isPending || createMutation.isPending;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Заголовок"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Содержимое заметки"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#999"
        />

        {!isNew && (
          <View style={styles.archiveRow}>
            <Text style={styles.archiveLabel}>Архивировать</Text>
            <Switch value={isArchived} onValueChange={setIsArchived} />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isLoadingMutation && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isLoadingMutation}
        >
          {isLoadingMutation ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Сохранить</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contentInput: {
    fontSize: 16,
    minHeight: 200,
    marginBottom: 16,
  },
  archiveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  archiveLabel: {
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

