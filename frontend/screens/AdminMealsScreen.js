import React, { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const initialMeals = {
  breakfast: '',
  lunch: '',
  dinner: '',
};

const MEAL_KEYS = ['breakfast', 'lunch', 'dinner'];

function normalizeMealKey(value = '') {
  const normalized = String(value).toLowerCase().trim();
  if (normalized.includes('breakfast')) return 'breakfast';
  if (normalized.includes('lunch')) return 'lunch';
  if (normalized.includes('dinner')) return 'dinner';
  return '';
}

function getMealsFromSnapshot(snapshot) {
  const pickedMeals = {
    breakfast: null,
    lunch: null,
    dinner: null,
  };

  snapshot.docs.forEach((mealDoc) => {
    const data = mealDoc.data();
    const keyFromId = normalizeMealKey(mealDoc.id);
    const keyFromMeal = normalizeMealKey(data.meal);
    const mealKey = keyFromId || keyFromMeal;

    if (!mealKey) {
      return;
    }

    const candidate = {
      menu: data.menu || '',
      canonical: mealDoc.id === mealKey,
    };

    const current = pickedMeals[mealKey];
    if (!current || (!current.canonical && candidate.canonical)) {
      pickedMeals[mealKey] = candidate;
    }
  });

  return {
    breakfast: pickedMeals.breakfast?.menu || '',
    lunch: pickedMeals.lunch?.menu || '',
    dinner: pickedMeals.dinner?.menu || '',
  };
}

export default function AdminMealsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [form, setForm] = useState(initialMeals);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMeals = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'messMenu'));
      setForm(getMealsFromSnapshot(snapshot));
    } catch (error) {
      Alert.alert('Load failed', error.message || 'Unable to load meal details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const saveMeals = async () => {
    try {
      setSaving(true);
      await Promise.all([
        setDoc(
          doc(db, 'messMenu', 'breakfast'),
          { meal: 'Breakfast', menu: form.breakfast, updatedAt: serverTimestamp() },
          { merge: true }
        ),
        setDoc(
          doc(db, 'messMenu', 'lunch'),
          { meal: 'Lunch', menu: form.lunch, updatedAt: serverTimestamp() },
          { merge: true }
        ),
        setDoc(
          doc(db, 'messMenu', 'dinner'),
          { meal: 'Dinner', menu: form.dinner, updatedAt: serverTimestamp() },
          { merge: true }
        ),
      ]);

      const snapshot = await getDocs(collection(db, 'messMenu'));
      const duplicateDocs = snapshot.docs.filter((mealDoc) => {
        const data = mealDoc.data();
        const mealKey = normalizeMealKey(mealDoc.id) || normalizeMealKey(data.meal);

        if (!mealKey) {
          return false;
        }

        return mealDoc.id !== mealKey;
      });

      if (duplicateDocs.length > 0) {
        await Promise.all(duplicateDocs.map((mealDoc) => deleteDoc(mealDoc.ref)));
      }

      Alert.alert('Saved', 'Meal details updated successfully.');
    } catch (error) {
      Alert.alert('Save failed', error.message || 'Unable to save meal details.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Loading meal details...</Text>
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
        <Text style={styles.heading}>Meal Details</Text>
        <Text style={styles.subheading}>Edit the daily mess menu shown to students.</Text>

        <CustomInput
          label="Breakfast"
          value={form.breakfast}
          onChangeText={(value) => setForm((prev) => ({ ...prev, breakfast: value }))}
          multiline
        />
        <CustomInput
          label="Lunch"
          value={form.lunch}
          onChangeText={(value) => setForm((prev) => ({ ...prev, lunch: value }))}
          multiline
        />
        <CustomInput
          label="Dinner"
          value={form.dinner}
          onChangeText={(value) => setForm((prev) => ({ ...prev, dinner: value }))}
          multiline
        />

        <CustomButton title="Save Meal Details" onPress={saveMeals} loading={saving} />
      </ScrollView>
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
  });
}
