import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { scaleFont, spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const fallbackMenu = [
  { id: '1', meal: 'Breakfast', menu: 'Poha, Banana, Tea' },
  { id: '2', meal: 'Lunch', menu: 'Rice, Dal, Roti, Mixed Veg' },
  { id: '3', meal: 'Dinner', menu: 'Roti, Paneer Curry, Salad' },
];

const MEAL_META = {
  breakfast: {
    time: '07:00 AM - 09:30 AM',
    image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1000&q=80',
  },
  lunch: {
    time: '12:30 PM - 02:30 PM',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  },
  dinner: {
    time: '07:30 PM - 09:30 PM',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
  },
};

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner'];

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

function normalizeMealKey(value = '') {
  const normalized = String(value).toLowerCase().trim();
  if (normalized.includes('breakfast')) return 'breakfast';
  if (normalized.includes('lunch')) return 'lunch';
  if (normalized.includes('dinner')) return 'dinner';
  return '';
}

function buildMenuFromDocs(docs) {
  const pickedByMeal = {
    breakfast: null,
    lunch: null,
    dinner: null,
  };

  docs.forEach((mealDoc) => {
    const data = mealDoc.data();
    const keyFromId = normalizeMealKey(mealDoc.id);
    const keyFromMeal = normalizeMealKey(data.meal);
    const mealKey = keyFromId || keyFromMeal;

    if (!mealKey) {
      return;
    }

    const candidate = {
      id: mealKey,
      meal: MEAL_LABELS[mealKey],
      menu: data.menu || '',
      canonical: mealDoc.id === mealKey,
    };

    const current = pickedByMeal[mealKey];
    if (!current || (!current.canonical && candidate.canonical)) {
      pickedByMeal[mealKey] = candidate;
    }
  });

  return MEAL_ORDER.map((mealKey) => pickedByMeal[mealKey]).filter(Boolean);
}

function getMealMeta(mealName = '') {
  const key = String(mealName).toLowerCase().trim();
  return MEAL_META[key] || {
    time: 'Meal Time',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
  };
}

const MenuItem = memo(function MenuItem({ item, colors, fontFamily, fontScale, onEatPress }) {
  const styles = createStyles(colors, fontScale);
  const mealMeta = getMealMeta(item.meal);

  return (
    <View style={styles.itemCard}>
      <Image source={{ uri: mealMeta.image }} style={styles.mealImage} />
      <View style={styles.itemContent}>
        <View style={styles.mealHeaderRow}>
          <Text style={[styles.meal, { fontFamily }]}>{item.meal}</Text>
          <Text style={[styles.mealTime, { fontFamily }]}>{mealMeta.time}</Text>
        </View>
        <Text style={[styles.menu, { fontFamily }]}>{item.menu}</Text>

        <Pressable style={styles.eatButton} onPress={() => onEatPress(item)}>
          <Text style={[styles.eatButtonText, { fontFamily }]}>Eat</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function MessMenuScreen() {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'messMenu'));
      const normalizedMenu = buildMenuFromDocs(snapshot.docs);

      if (normalizedMenu.length > 0) {
        setMenu(normalizedMenu);
      } else {
        const rawData = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        setMenu(rawData.length > 0 ? rawData : fallbackMenu);
      }
    } catch (error) {
      setMenu(fallbackMenu);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const handleEatPress = useCallback((item) => {
    setSelectedMeal(item);
  }, []);

  const qrPayload = useMemo(() => {
    if (!selectedMeal) {
      return '';
    }

    const meta = getMealMeta(selectedMeal.meal);
    return JSON.stringify({
      meal: selectedMeal.meal,
      time: meta.time,
      menu: selectedMeal.menu,
      date: new Date().toDateString(),
    });
  }, [selectedMeal]);

  const qrUrl = useMemo(() => {
    if (!qrPayload) {
      return '';
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPayload)}`;
  }, [qrPayload]);

  const renderItem = useCallback(
    ({ item }) => (
      <MenuItem
        item={item}
        colors={colors}
        fontFamily={fontFamily}
        fontScale={fontScale}
        onEatPress={handleEatPress}
      />
    ),
    [colors, fontFamily, fontScale, handleEatPress]
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { fontFamily }]}>Today&apos;s Mess Menu</Text>
      <FlatList data={menu} keyExtractor={(item) => item.id} renderItem={renderItem} />

      <Modal
        visible={Boolean(selectedMeal)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMeal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, { fontFamily }]}>Scan To View Meal</Text>
            {selectedMeal ? (
              <Text style={[styles.modalSubTitle, { fontFamily }]}>
                {selectedMeal.meal} | {getMealMeta(selectedMeal.meal).time}
              </Text>
            ) : null}

            {qrUrl ? <Image source={{ uri: qrUrl }} style={styles.qrImage} /> : null}

            {selectedMeal ? <Text style={[styles.modalMenuText, { fontFamily }]}>{selectedMeal.menu}</Text> : null}

            <Pressable style={styles.closeButton} onPress={() => setSelectedMeal(null)}>
              <Text style={[styles.closeButtonText, { fontFamily }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors, fontScale) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
    },
    heading: {
      fontSize: scaleFont(24, fontScale),
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.md,
    },
    itemCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      marginBottom: spacing.sm,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    mealImage: {
      width: '100%',
      height: 130,
      backgroundColor: colors.border,
    },
    itemContent: {
      padding: spacing.md,
    },
    mealHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    meal: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: scaleFont(18, fontScale),
      flex: 1,
    },
    mealTime: {
      color: colors.muted,
      fontSize: scaleFont(12, fontScale),
    },
    menu: {
      color: colors.text,
      marginTop: spacing.xs,
      fontSize: scaleFont(14, fontScale),
      lineHeight: scaleFont(20, fontScale),
    },
    eatButton: {
      marginTop: spacing.sm,
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 18,
    },
    eatButtonText: {
      color: colors.onPrimary,
      fontWeight: '700',
      fontSize: scaleFont(14, fontScale),
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    modalCard: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      alignItems: 'center',
    },
    modalTitle: {
      color: colors.text,
      fontWeight: '700',
      fontSize: scaleFont(20, fontScale),
    },
    modalSubTitle: {
      color: colors.muted,
      marginTop: 4,
      marginBottom: spacing.sm,
      fontSize: scaleFont(13, fontScale),
    },
    qrImage: {
      width: 220,
      height: 220,
      borderRadius: 12,
      backgroundColor: '#ffffff',
    },
    modalMenuText: {
      color: colors.text,
      marginTop: spacing.sm,
      textAlign: 'center',
      fontSize: scaleFont(14, fontScale),
      lineHeight: scaleFont(20, fontScale),
    },
    closeButton: {
      marginTop: spacing.md,
      backgroundColor: colors.secondaryButton,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    closeButtonText: {
      color: colors.secondaryText,
      fontWeight: '700',
      fontSize: scaleFont(14, fontScale),
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
  });
}
