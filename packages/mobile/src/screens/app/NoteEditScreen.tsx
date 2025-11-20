import React, { useState, useEffect } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppStackParamList } from '../../navigation/AppStack';
import { getNote, createNote, updateNote, deleteNote } from '../../services/notes';

type RoutePropType = RouteProp<AppStackParamList, 'NoteEdit'>;
type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const NoteEditScreen = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { noteId } = route.params || {};
  const isNew = !noteId;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Заглушка для загрузки заметки
  const { data: noteData, isLoading } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId!),
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

  // Заглушки для мутаций
  const createMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) => createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось создать заметку');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { title: string; content: string; isArchived: boolean }) =>
      updateNote(noteId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось сохранить заметку');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNote(noteId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось удалить заметку');
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

  const handleDelete = () => {
    Alert.alert('Удаление', 'Вы уверены, что хотите удалить эту заметку?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  if (!isNew && isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isLoadingMutation =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Заголовок"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          editable={!isLoadingMutation}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Содержимое заметки"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          placeholderTextColor="#999"
          editable={!isLoadingMutation}
        />

        {!isNew && (
          <View style={styles.archiveRow}>
            <Text style={styles.archiveLabel}>Архивировать</Text>
            <Switch value={isArchived} onValueChange={setIsArchived} disabled={isLoadingMutation} />
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

        {!isNew && (
          <TouchableOpacity
            style={[styles.deleteButton, isLoadingMutation && styles.buttonDisabled]}
            onPress={handleDelete}
            disabled={isLoadingMutation}
          >
            <Text style={styles.deleteButtonText}>Удалить</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

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
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
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
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NoteEditScreen;

