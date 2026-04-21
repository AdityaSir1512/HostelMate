import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContext } from 'react';
import { Alert, FlatList, Image, Linking, StyleSheet, Text, View } from 'react-native';
import api from '../services/api';
import { logSchema } from '../utils/validationSchemas';
import { scaleFont, spacing } from '../constants/theme';
import { getCache, setCache } from '../services/storage';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LogItem = memo(function LogItem({ item, colors }) {
  const styles = createStyles(colors);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemType}>{String(item.type).toUpperCase()}</Text>
      <Text style={styles.itemText}>{item.note}</Text>
      <Text style={styles.itemMeta}>{item.timestamp}</Text>
    </View>
  );
});

export default function InOutLogScreen() {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors, fontScale);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [logs, setLogs] = useState([]);
  const lastHandledUrlRef = useRef('');

  const qrPayloadIn = useMemo(() => 'hostelmate://log?type=in', []);
  const qrPayloadOut = useMemo(() => 'hostelmate://log?type=out', []);

  const qrInUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayloadIn)}`,
    [qrPayloadIn]
  );
  const qrOutUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrPayloadOut)}`,
    [qrPayloadOut]
  );

  const loadLogs = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await api.get('/logs');
      setLogs(response.data);
      await setCache('logs_cache', response.data);
    } catch (error) {
      const cached = await getCache('logs_cache');
      if (cached) {
        setLogs(cached);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const submitLog = useCallback(
    async (type) => {
      try {
        const now = new Date().toLocaleString();
        const payload = {
          type,
          note: type === 'in' ? 'IN QR scanned' : 'OUT QR scanned',
          timestamp: now,
          userEmail: user?.email || '',
        };

        await logSchema.validate(payload, { abortEarly: false });
        await api.post('/logs', payload);
        await loadLogs();
        Alert.alert('Success', `${type.toUpperCase()} recorded at ${now}`);
      } catch (error) {
        Alert.alert('Error', error?.response?.data?.message || error.message || 'Could not submit log entry.');
      }
    },
    [loadLogs, user?.email]
  );

  const handleQrDeepLink = useCallback(
    (url) => {
      const normalizedUrl = String(url || '').trim();
      if (!normalizedUrl || normalizedUrl === lastHandledUrlRef.current) {
        return;
      }

      lastHandledUrlRef.current = normalizedUrl;
      const match = normalizedUrl.match(/[?&]type=(in|out)/i);
      const type = match?.[1]?.toLowerCase();

      if (type === 'in' || type === 'out') {
        submitLog(type);
      }
    },
    [submitLog]
  );

  useEffect(() => {
    let mounted = true;

    Linking.getInitialURL()
      .then((initialUrl) => {
        if (mounted && initialUrl) {
          handleQrDeepLink(initialUrl);
        }
      })
      .catch(() => {
        // Ignore URL bootstrap errors.
      });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleQrDeepLink(url);
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, [handleQrDeepLink]);

  const latestInTime = useMemo(() => {
    const latestIn = logs.find((item) => String(item.type).toLowerCase() === 'in');
    return latestIn?.timestamp || 'Not recorded yet';
  }, [logs]);

  const latestOutTime = useMemo(() => {
    const latestOut = logs.find((item) => String(item.type).toLowerCase() === 'out');
    return latestOut?.timestamp || 'Not recorded yet';
  }, [logs]);

  const renderItem = useCallback(({ item }) => <LogItem item={item} colors={colors} />, [colors]);

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={(
          <>
            <Text style={[styles.heading, { fontFamily }]}>Track Entry/Exit</Text>

            <View style={styles.summaryCard}>
              <Text style={[styles.summaryTitle, { fontFamily }]}>Latest Status</Text>
              <Text style={[styles.summaryText, { fontFamily }]}>Last IN: {latestInTime}</Text>
              <Text style={[styles.summaryText, { fontFamily }]}>Last OUT: {latestOutTime}</Text>
            </View>

            <View style={styles.qrCard}>
              <Text style={[styles.qrTitle, { fontFamily }]}>IN QR Code</Text>
              <Text style={[styles.qrSubText, { fontFamily }]}>Scan this at entry gate. IN will be auto-registered.</Text>
              <Image source={{ uri: qrInUrl }} style={styles.qrImage} />
            </View>

            <View style={styles.qrCard}>
              <Text style={[styles.qrTitle, { fontFamily }]}>OUT QR Code</Text>
              <Text style={[styles.qrSubText, { fontFamily }]}>Scan this at exit gate. OUT will be auto-registered.</Text>
              <Image source={{ uri: qrOutUrl }} style={styles.qrImage} />
            </View>

            <Text style={[styles.heading, { fontFamily }]}>Recent Logs</Text>
          </>
        )}
        refreshing={refreshing}
        onRefresh={loadLogs}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={[styles.emptyText, { fontFamily }]}>No logs yet.</Text>}
      />
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
    listContent: {
      paddingBottom: spacing.lg,
    },
    heading: {
      fontSize: scaleFont(18, fontScale),
      fontWeight: '700',
      color: colors.text,
      marginVertical: spacing.sm,
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    summaryTitle: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: scaleFont(15, fontScale),
      marginBottom: 4,
    },
    summaryText: {
      color: colors.text,
      fontSize: scaleFont(13, fontScale),
      marginTop: 2,
    },
    qrCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.sm,
      alignItems: 'center',
    },
    qrTitle: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: scaleFont(16, fontScale),
    },
    qrSubText: {
      color: colors.muted,
      fontSize: scaleFont(12, fontScale),
      marginTop: 4,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    qrImage: {
      width: 180,
      height: 180,
      borderRadius: 10,
      backgroundColor: '#ffffff',
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
    itemType: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: scaleFont(13, fontScale),
      marginBottom: 4,
    },
    itemText: {
      color: colors.text,
      fontSize: scaleFont(13, fontScale),
    },
    itemMeta: {
      color: colors.muted,
      marginTop: 6,
      fontSize: scaleFont(12, fontScale),
    },
    emptyText: {
      color: colors.muted,
      fontSize: scaleFont(13, fontScale),
      marginTop: spacing.sm,
    },
  });
}
