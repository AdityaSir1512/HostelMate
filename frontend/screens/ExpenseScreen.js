import React, { memo, useCallback, useEffect, useState } from 'react';
import { useContext } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import api from '../services/api';
import { expenseSchema } from '../utils/validationSchemas';
import { spacing } from '../constants/theme';
import { getCache, setCache } from '../services/storage';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ExpenseItem = memo(function ExpenseItem({ item, colors, onDelete, deleting }) {
  const styles = createStyles(colors);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTitle}>{item.item}</Text>
      <Text style={styles.itemMeta}>Amount: Rs. {item.amount}</Text>
      <Text style={styles.itemText}>{item.note || 'No note'}</Text>
      <Pressable
        style={[styles.deleteButton, deleting ? styles.deleteButtonDisabled : null]}
        onPress={() => onDelete(item)}
        disabled={deleting}
      >
        <Text style={styles.deleteButtonText}>{deleting ? 'Deleting...' : 'Delete'}</Text>
      </Pressable>
    </View>
  );
});

export default function ExpenseScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({ item: '', amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  const loadExpenses = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/expenses');
      setExpenses(response.data);
      await setCache('expenses_cache', response.data);
    } catch (error) {
      const cached = await getCache('expenses_cache');
      if (cached) {
        setExpenses(cached);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSubmit = useCallback(async () => {
    setErrors({});
    try {
      const payload = {
        item: form.item.trim(),
        amount: Number(form.amount),
        note: form.note.trim(),
      };

      await expenseSchema.validate(payload, { abortEarly: false });
      setSubmitting(true);
      await api.post('/expenses', {
        ...payload,
        userEmail: user?.email || '',
      });
      setForm({ item: '', amount: '', note: '' });
      loadExpenses();
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
        Alert.alert('Error', responseMessage || error.message || 'Could not submit expense.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, loadExpenses, user?.email]);

  const handleDeleteExpense = useCallback(
    (expense) => {
      Alert.alert('Delete Expense', `Delete ${expense.item}?`, [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(expense.id);
              await api.delete(`/expenses/${expense.id}`);
              const nextExpenses = expenses.filter((entry) => entry.id !== expense.id);
              setExpenses(nextExpenses);
              await setCache('expenses_cache', nextExpenses);
            } catch (error) {
              const responseMessage = error?.response?.data?.message;
              Alert.alert('Error', responseMessage || error.message || 'Could not delete expense.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]);
    },
    [expenses]
  );

  const renderItem = useCallback(
    ({ item }) => (
      <ExpenseItem
        item={item}
        colors={colors}
        onDelete={handleDeleteExpense}
        deleting={deletingId === item.id}
      />
    ),
    [colors, deletingId, handleDeleteExpense]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        style={styles.list}
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={loadExpenses}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.emptyText}>No expenses yet.</Text>}
        ListHeaderComponent={(
          <View>
            <Text style={styles.heading}>Add Expense</Text>
            <CustomInput
              label="Item"
              value={form.item}
              error={errors.item}
              onChangeText={(value) => setForm((prev) => ({ ...prev, item: value }))}
            />
            <CustomInput
              label="Amount"
              value={form.amount}
              error={errors.amount}
              keyboardType="numeric"
              onChangeText={(value) => setForm((prev) => ({ ...prev, amount: value }))}
            />
            <CustomInput
              label="Note"
              value={form.note}
              onChangeText={(value) => setForm((prev) => ({ ...prev, note: value }))}
            />
            <CustomButton title="Save Expense" onPress={handleSubmit} loading={submitting} />
            <Text style={styles.heading}>Expense List</Text>
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
    itemMeta: {
      color: colors.accent,
      marginTop: 4,
      fontWeight: '700',
    },
    itemText: {
      color: colors.muted,
      marginTop: 6,
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
