import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { scaleFont } from '../constants/theme';

function ChatMessage({ item }) {
  const { colors, fontFamily, fontScale } = useTheme();
  const styles = createStyles(colors);
  const isBot = item.sender === 'bot';

  return (
    <View style={[styles.row, isBot ? styles.left : styles.right]}>
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text
          style={[
            styles.text,
            { fontFamily, fontSize: scaleFont(15, fontScale) },
            isBot ? styles.botText : styles.userText,
          ]}
        >
          {item.text}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    row: {
      marginBottom: 10,
      flexDirection: 'row',
    },
    left: {
      justifyContent: 'flex-start',
    },
    right: {
      justifyContent: 'flex-end',
    },
    bubble: {
      maxWidth: '80%',
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    botBubble: {
      backgroundColor: colors.botBubble,
    },
    userBubble: {
      backgroundColor: colors.primary,
    },
    text: {
      lineHeight: 20,
    },
    botText: {
      color: colors.text,
    },
    userText: {
      color: colors.onPrimary,
    },
  });
}

export default memo(ChatMessage);
