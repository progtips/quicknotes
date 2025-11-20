import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AppStackParamList } from '../../navigation/AppStack';
import { getNotes } from '../../services/notes';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const NotesListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [includeArchived, setIncludeArchived] = useState(false);

  // Заглушка для API вызова
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notes', includeArchived],
    queryFn: () => getNotes(includeArchived),
  });

  const notes = data?.data?.notes || [];

  const handleCreateNote = () => {
    navigation.navigate('NoteEdit', {});
  };

  const handleNotePress = (noteId: string) => {
    navigation.navigate('NoteEdit', { noteId });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setIncludeArchived(!includeArchived)}
        >
          <Text style={styles.filterText}>
            {includeArchived ? 'Только активные' : 'Включая архивные'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => handleNotePress(item.id)}
          >
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent} numberOfLines={2}>
              {item.content}
            </Text>
            <View style={styles.noteFooter}>
              <Text style={styles.noteDate}>
                {new Date(item.updatedAt).toLocaleDateString('ru-RU')}
              </Text>
              {item.isArchived && <Text style={styles.archivedBadge}>Архив</Text>}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Нет заметок</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterButton: {
    paddingVertical: 8,
  },
  filterText: {
    color: '#007AFF',
    fontSize: 14,
  },
  noteCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  archivedBadge: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default NotesListScreen;

