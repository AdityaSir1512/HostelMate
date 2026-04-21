import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { listStudentProfiles, saveStudentRecord } from '../services/studentProfileService';

const emptyForm = {
  displayName: '',
  enrollmentNo: '',
  hostelBuilding: '',
  roomNo: '',
  department: '',
  gender: '',
  fatherName: '',
  fatherPhone: '',
  motherName: '',
  motherPhone: '',
  profilePic: '',
};

export default function AdminStudentsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const records = await listStudentProfiles();
      setStudents(records);
      if (!selectedStudent && records.length > 0) {
        setSelectedStudent(records[0]);
      }
    } catch (error) {
      Alert.alert('Load failed', error.message || 'Unable to load students.');
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (selectedStudent) {
      setForm({
        displayName: selectedStudent.displayName || '',
        enrollmentNo: selectedStudent.enrollmentNo || '',
        hostelBuilding: selectedStudent.hostelBuilding || '',
        roomNo: selectedStudent.roomNo || '',
        department: selectedStudent.department || '',
        gender: selectedStudent.gender || '',
        fatherName: selectedStudent.fatherName || '',
        fatherPhone: selectedStudent.fatherPhone || '',
        motherName: selectedStudent.motherName || '',
        motherPhone: selectedStudent.motherPhone || '',
        profilePic: selectedStudent.profilePic || '',
      });
    }
  }, [selectedStudent]);

  const saveStudent = async () => {
    if (!selectedStudent?.id) {
      Alert.alert('Select student', 'Please choose a student first.');
      return;
    }

    if (!form.enrollmentNo.trim()) {
      Alert.alert('Enrollment required', 'Enrollment number is required.');
      return;
    }

    setSaving(true);
    try {
      await saveStudentRecord(selectedStudent.id, {
        role: 'student',
        displayName: form.displayName.trim(),
        email: selectedStudent.email || '',
        enrollmentNo: form.enrollmentNo.trim(),
        hostelBuilding: form.hostelBuilding,
        roomNo: form.roomNo,
        department: form.department,
        gender: form.gender,
        fatherName: form.fatherName,
        fatherPhone: form.fatherPhone,
        motherName: form.motherName,
        motherPhone: form.motherPhone,
        profilePic: form.profilePic,
      });
      Alert.alert('Saved', 'Student profile updated successfully.');
      await loadStudents();
    } catch (error) {
      Alert.alert('Save failed', error.message || 'Unable to save student details.');
    } finally {
      setSaving(false);
    }
  };

  const renderStudent = useCallback(
    ({ item }) => {
      const active = item.id === selectedStudent?.id;
      return (
        <Pressable
          onPress={() => setSelectedStudent(item)}
          style={[styles.studentCard, active ? styles.studentCardActive : null]}
        >
          <Text style={styles.studentName}>{item.displayName || 'Unnamed Student'}</Text>
          <Text style={styles.studentMeta}>{item.enrollmentNo || 'No enrollment'}</Text>
          <Text style={styles.studentMeta}>{item.hostelBuilding || 'No hostel building'}</Text>
          <Text style={styles.studentMeta}>{item.roomNo || 'No room'}</Text>
        </Pressable>
      );
    },
    [selectedStudent?.id]
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading students...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Student Details</Text>
        <Text style={styles.subheading}>Select a student and edit their saved profile details.</Text>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />

        <CustomInput
          label="Student Name"
          value={form.displayName}
          onChangeText={(value) => setForm((prev) => ({ ...prev, displayName: value }))}
        />
        <CustomInput
          label="Enrollment Number"
          value={form.enrollmentNo}
          onChangeText={(value) => setForm((prev) => ({ ...prev, enrollmentNo: value }))}
        />
        <CustomInput
          label="Hostel Building"
          value={form.hostelBuilding}
          onChangeText={(value) => setForm((prev) => ({ ...prev, hostelBuilding: value }))}
        />
        <CustomInput
          label="Room Number"
          value={form.roomNo}
          onChangeText={(value) => setForm((prev) => ({ ...prev, roomNo: value }))}
        />
        <CustomInput
          label="Department"
          value={form.department}
          onChangeText={(value) => setForm((prev) => ({ ...prev, department: value }))}
        />
        <Text style={styles.sectionLabel}>Gender</Text>
        <View style={styles.choiceRow}>
          <GenderChoice
            label="Male"
            active={form.gender === 'male'}
            onPress={() => setForm((prev) => ({ ...prev, gender: 'male' }))}
            colors={colors}
          />
          <GenderChoice
            label="Female"
            active={form.gender === 'female'}
            onPress={() => setForm((prev) => ({ ...prev, gender: 'female' }))}
            colors={colors}
          />
        </View>
        <CustomInput
          label="Father Name"
          value={form.fatherName}
          onChangeText={(value) => setForm((prev) => ({ ...prev, fatherName: value }))}
        />
        <CustomInput
          label="Father Phone"
          value={form.fatherPhone}
          keyboardType="phone-pad"
          onChangeText={(value) => setForm((prev) => ({ ...prev, fatherPhone: value }))}
        />
        <CustomInput
          label="Mother Name"
          value={form.motherName}
          onChangeText={(value) => setForm((prev) => ({ ...prev, motherName: value }))}
        />
        <CustomInput
          label="Mother Phone"
          value={form.motherPhone}
          keyboardType="phone-pad"
          onChangeText={(value) => setForm((prev) => ({ ...prev, motherPhone: value }))}
        />

        <CustomButton title="Save Student Details" onPress={saveStudent} loading={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GenderChoice({ label, active, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flex: 1,
          paddingVertical: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.border,
          backgroundColor: active ? colors.secondaryButton : colors.surface,
          alignItems: 'center',
        },
      ]}
    >
      <Text style={{ color: active ? colors.primaryDark : colors.text, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: spacing.lg,
    },
    heading: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    subheading: {
      color: colors.muted,
      marginBottom: spacing.md,
    },
    listContent: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    studentCard: {
      width: 180,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: spacing.sm,
    },
    studentCardActive: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    studentName: {
      color: colors.text,
      fontWeight: '700',
      marginBottom: 4,
    },
    studentMeta: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 2,
    },
    sectionLabel: {
      color: colors.text,
      fontWeight: '600',
      marginTop: spacing.xs,
      marginBottom: spacing.xs,
    },
    choiceRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
  });
}
