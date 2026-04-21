import React, { memo, useCallback, useEffect, useState } from 'react';
import { useContext } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import api from '../services/api';
import { spacing } from '../constants/theme';
import { getCache, setCache } from '../services/storage';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const AnnouncementItem = memo(function AnnouncementItem({ item, colors, isAdmin, onDelete, deleting }) {
  const styles = createStyles(colors);

  const createdLabel = item.createdAt?._seconds
    ? new Date(item.createdAt._seconds * 1000).toLocaleString()
    : item.createdAt || 'Recently';

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemText}>{item.message}</Text>
      <Text style={styles.itemMeta}>Posted by: {item.postedBy || item.adminName || 'Admin'}</Text>
      <Text style={styles.itemMeta}>{createdLabel}</Text>
      {isAdmin ? (
        <Pressable
          style={[styles.deleteButton, deleting ? styles.deleteButtonDisabled : null]}
          onPress={() => onDelete(item)}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete Announcement'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

export default function AnnouncementScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [form, setForm] = useState({ title: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/announcements');
      setAnnouncements(response.data);
      await setCache('announcements_cache', response.data);
    } catch (error) {
      const cached = await getCache('announcements_cache');
      if (cached) {
        setAnnouncements(cached);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  useFocusEffect(
    useCallback(() => {
      loadAnnouncements();
    }, [loadAnnouncements])
  );

  const handleSubmit = useCallback(async () => {
    if (!isAdmin) {
      return;
    }

    setErrors({});

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      postedBy: user?.displayName || user?.email || 'Admin',
      adminEmail: user?.email || '',
    };

    if (!payload.title || !payload.message) {
      setErrors({
        title: payload.title ? '' : 'Title is required',
        message: payload.message ? '' : 'Message is required',
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/announcements', payload);
      setForm({ title: '', message: '' });
      loadAnnouncements();
    } catch (error) {
      const responseMessage = error?.response?.data?.message;
      Alert.alert('Error', responseMessage || error.message || 'Could not post announcement.');
    } finally {
      setSubmitting(false);
    }
  }, [form.message, form.title, isAdmin, loadAnnouncements, user?.displayName, user?.email]);

  const handleDeleteAnnouncement = useCallback(
    (announcement) => {
      if (!isAdmin) {
        return;
      }

      Alert.alert('Delete Announcement', `Delete \"${announcement.title}\"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(announcement.id);
              await api.delete(`/announcements/${announcement.id}`);
              const nextAnnouncements = announcements.filter((item) => item.id !== announcement.id);
              setAnnouncements(nextAnnouncements);
              await setCache('announcements_cache', nextAnnouncements);
            } catch (error) {
              const responseMessage = error?.response?.data?.message;
              Alert.alert('Error', responseMessage || error.message || 'Could not delete announcement.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    },
    [announcements, isAdmin]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <AnnouncementItem
        item={item}
        colors={colors}
        isAdmin={isAdmin}
        onDelete={handleDeleteAnnouncement}
        deleting={deletingId === item.id}
      />
    ),
    [colors, deletingId, handleDeleteAnnouncement, isAdmin]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        style={styles.list}
        data={announcements}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={loadAnnouncements}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.emptyText}>No announcements yet.</Text>}
        ListHeaderComponent={(
          <View>
            <Text style={styles.heading}>Announcements</Text>
            {isAdmin ? (
              <View style={styles.formCard}>
                <CustomInput
                  label="Announcement Title"
                  value={form.title}
                  error={errors.title}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
                />
                <CustomInput
                  label="Announcement Message"
                  value={form.message}
                  error={errors.message}
                  multiline
                  numberOfLines={5}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, message: value }))}
                />
                <CustomButton title="Post Announcement" onPress={handleSubmit} loading={submitting} />
              </View>
            ) : (
              <Text style={styles.sectionHint}>Latest announcements from the admin are shown below.</Text>
            )}
            <Text style={styles.heading}>Feed</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </KeyboardAvoidingView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    heading: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginVertical: spacing.sm,
    },
    sectionHint: {
      color: colors.muted,
      marginBottom: spacing.sm,
    },
    formCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    itemCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    itemTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    itemText: {
      color: colors.muted,
      marginTop: 6,
    },
    itemMeta: {
      color: colors.primary,
      marginTop: 8,
      fontWeight: '600',
    },
    deleteButton: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.danger,
      backgroundColor: colors.surface,
    },
    deleteButtonDisabled: {
      opacity: 0.6,
    },
    deleteButtonText: {
      color: colors.danger,
      fontWeight: '700',
    },
    emptyText: {
      color: colors.muted,
      marginTop: spacing.sm,
    },
  });
}