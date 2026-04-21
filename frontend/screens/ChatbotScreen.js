import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { KeyboardAvoidingView, Platform } from 'react-native';
import ChatMessage from '../components/ChatMessage';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import { getBotReply } from '../utils/chatbotRules';
import { spacing } from '../constants/theme';
import { sendChatMessage } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ChatbotScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'bot',
      text: 'Hi! I am your HostelMate assistant. Ask me about mess menu, complaints, expenses, in/out logs, or profile.',
    },
  ]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    const nextHistory = [...history, { role: 'user', text }].slice(-8);
    setHistory(nextHistory);
    setInput('');
    setSending(true);

    try {
      const result = await sendChatMessage(text, nextHistory);
      const reply = result?.reply || getBotReply(text);

      const botMessage = {
        id: `${Date.now()}-bot`,
        sender: 'bot',
        text: reply,
      };

      setMessages((prev) => [...prev, botMessage]);
      setHistory((prev) => [...prev, { role: 'assistant', text: reply }].slice(-8));
    } catch (error) {
      const fallbackMessage = {
        id: `${Date.now()}-bot-fallback`,
        sender: 'bot',
        text: getBotReply(text),
      };

      setMessages((prev) => [...prev, fallbackMessage]);
      setHistory((prev) => [...prev, { role: 'assistant', text: fallbackMessage.text }].slice(-8));
    } finally {
      setSending(false);
    }
  }, [history, input, sending]);

  const renderItem = useCallback(({ item }) => <ChatMessage item={item} />, []);

  const hint = useMemo(
    () => 'Try: "Where is mess?" or "How to file complaint?"',
    []
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Text style={styles.heading}>HostelMate Chatbot</Text>
      <Text style={styles.hint}>{hint}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      <CustomInput
        value={input}
        onChangeText={setInput}
        placeholder="Ask your question"
        style={styles.input}
      />
      <CustomButton title="Send" onPress={sendMessage} loading={sending} />
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
    heading: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    hint: {
      color: colors.muted,
      marginTop: 4,
      marginBottom: spacing.sm,
    },
    listContent: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    input: {
      marginBottom: 0,
    },
  });
}
