import React, { memo, useCallback, useEffect, useState } from 'react';
import { useContext } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import api from '../services/api';
import { complaintSchema } from '../utils/validationSchemas';
import { spacing } from '../constants/theme';
import { getCache, setCache } from '../services/storage';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const COMPLAINT_DEPARTMENTS = [
  'Electricity',
  'Cleaning',
  'Furniture',
  'Plumbing',
  'Food/Mess',
  'Security',
  'Other',
];

const ComplaintItem = memo(function ComplaintItem({ item, colors }) {
  const styles = createStyles(colors);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.title}</Text>
      <Text style={styles.itemText}>{item.description}</Text>
      <Text style={styles.itemText}>Student: {item.studentName}</Text>
      <Text style={styles.itemText}>Building: {item.hostelBuilding} | Room: {item.roomNo}</Text>
      <Text style={styles.itemMeta}>Status: {item.status || 'open'}</Text>
    </View>
  );
});

export default function ComplaintScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: COMPLAINT_DEPARTMENTS[0],
    description: '',
    studentName: user?.displayName || '',
    hostelBuilding: user?.hostelBuilding || '',
    roomNo: user?.roomNo || '',
  });
  const [customDepartment, setCustomDepartment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [complaints, setComplaints] = useState([]);

  const loadComplaints = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/complaints');
      setComplaints(response.data);
      await setCache('complaints_cache', response.data);
    } catch (error) {
      const cached = await getCache('complaints_cache');
      if (cached) {
        setComplaints(cached);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    try {
      const selectedTitle = form.title === 'Other'
        ? (customDepartment.trim() || 'Other')
        : form.title;
      const payload = {
        title: selectedTitle,
        description: form.description.trim(),
        studentName: form.studentName.trim(),
        hostelBuilding: form.hostelBuilding.trim(),
        roomNo: form.roomNo.trim(),
      };

      await complaintSchema.validate(payload, { abortEarly: false });
      setSubmitting(true);
      await api.post('/complaints', {
        ...payload,
        status: 'open',
        userEmail: user?.email || '',
      });
      setForm({
        title: COMPLAINT_DEPARTMENTS[0],
        description: '',
        studentName: user?.displayName || '',
        hostelBuilding: user?.hostelBuilding || '',
        roomNo: user?.roomNo || '',
      });
      setCustomDepartment('');
      loadComplaints();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const nextErrors = {};
        error.inner.forEach((item) => {
          if (!nextErrors[item.path]) {
            nextErrors[item.path] = item.message;
          }
        });
        setErrors(nextErrors);
      } else {
        const responseMessage = error?.response?.data?.message;
        Alert.alert('Error', responseMessage || error.message || 'Could not submit complaint.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [customDepartment, form, loadComplaints, user?.email, user?.displayName, user?.hostelBuilding, user?.roomNo]);

  const renderItem = useCallback(({ item }) => <ComplaintItem item={item} colors={colors} />, [colors]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        style={styles.list}
        data={complaints}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={loadComplaints}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints yet.</Text>}
        ListHeaderComponent={(
          <View>
            <Text style={styles.heading}>Raise Complaint</Text>
            <Text style={styles.sectionLabel}>Department</Text>
            <View style={styles.departmentGrid}>
              {COMPLAINT_DEPARTMENTS.map((department) => {
                const active = form.title === department;

                return (
                  <Pressable
                    key={department}
                    onPress={() => setForm((prev) => ({ ...prev, title: department }))}
                    style={[styles.departmentChip, active ? styles.departmentChipActive : null]}
                  >
                    <Text style={[styles.departmentChipText, active ? styles.departmentChipTextActive : null]}>{department}</Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

            {form.title === 'Other' ? (
              <CustomInput
                label="Other Department"
                value={customDepartment}
                error={errors.title}
                onChangeText={setCustomDepartment}
              />
            ) : null}

            <CustomInput
              label="Description"
              value={form.description}
              error={errors.description}
              multiline
              numberOfLines={4}
              onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
            />

            <CustomInput
              label="Student Name"
              value={form.studentName}
              error={errors.studentName}
              onChangeText={(value) => setForm((prev) => ({ ...prev, studentName: value }))}
              editable={!user?.displayName}
            />

            <CustomInput
              label="Hostel Building"
              value={form.hostelBuilding}
              error={errors.hostelBuilding}
              onChangeText={(value) => setForm((prev) => ({ ...prev, hostelBuilding: value }))}
              editable={!user?.hostelBuilding}
            />

            <CustomInput
              label="Room Number"
              value={form.roomNo}
              error={errors.roomNo}
              onChangeText={(value) => setForm((prev) => ({ ...prev, roomNo: value }))}
              editable={!user?.roomNo}
            />

            <CustomButton title="Submit Complaint" onPress={handleSubmit} loading={submitting} />

            <Text style={styles.heading}>Complaint List</Text>
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
    sectionLabel: {
      color: colors.text,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    departmentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    departmentChip: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingHorizontal: spacing.sm,
      paddingVertical: 8,
    },
    departmentChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.secondaryButton,
    },
    departmentChipText: {
      color: colors.text,
      fontWeight: '600',
    },
    departmentChipTextActive: {
      color: colors.primaryDark,
    },
    errorText: {
      color: colors.danger,
      marginBottom: spacing.xs,
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
      marginTop: 4,
    },
    itemMeta: {
      color: colors.primary,
      marginTop: 8,
      fontWeight: '600',
    },
    emptyText: {
      color: colors.muted,
      marginTop: spacing.sm,
    },
  });
}
