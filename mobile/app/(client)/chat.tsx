import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import { format } from 'date-fns';

const INITIAL_MESSAGES = [
  {
    id: 'm0',
    senderId: 'counselor',
    senderName: 'ดร. สุภาพร',
    content: 'สวัสดีค่ะ คุณเป็นอย่างไรบ้างวันนี้คะ? 😊',
    sentAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'm1',
    senderId: 'counselor',
    senderName: 'ดร. สุภาพร',
    content: 'อย่าลืมทำแบบประเมินประจำสัปดาห์นะคะ ผลจะช่วยให้เราติดตามความคืบหน้าได้ดีขึ้น',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export default function ClientChat() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now().toString(),
      senderId: user?.id || 'client',
      senderName: user?.fullName || 'คุณ',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // Simulate counselor typing and reply
    setIsTyping(true);
    setTimeout(() => {
      const replies = [
        'ขอบคุณที่แชร์ค่ะ ดิฉันเข้าใจความรู้สึกของคุณ 💙',
        'คุณทำได้ดีมากเลยนะคะ ขอบคุณที่เปิดเผยความรู้สึก',
        'มีอะไรอื่นอยากพูดถึงไหมคะ? ดิฉันรับฟังอยู่นะคะ',
        'ฟังดูท้าทายมากเลยนะคะ เราค่อยๆ ทำงานด้วยกันได้ค่ะ',
      ];
      const reply = {
        id: (Date.now() + 1).toString(),
        senderId: 'counselor',
        senderName: 'ดร. สุภาพร',
        content: replies[Math.floor(Math.random() * replies.length)],
        sentAt: new Date().toISOString(),
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, reply]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, 2000);
  };

  const groupedMessages = () => {
    const groups: { date: string; messages: typeof INITIAL_MESSAGES }[] = [];
    let lastDate = '';
    messages.forEach((m) => {
      const d = format(new Date(m.sentAt), 'dd/MM/yyyy');
      if (d !== lastDate) {
        groups.push({ date: d, messages: [] });
        lastDate = d;
      }
      groups[groups.length - 1].messages.push(m);
    });
    return groups;
  };

  const allItems: any[] = [];
  groupedMessages().forEach((g) => {
    allItems.push({ type: 'date', date: g.date });
    g.messages.forEach((m) => allItems.push({ type: 'message', ...m }));
  });
  if (isTyping) allItems.push({ type: 'typing' });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <View style={styles.counselorAvatar}>
            <Ionicons name="medical" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.counselorName}>ดร. สุภาพร มั่นคง</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>ออนไลน์</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={allItems}
          keyExtractor={(item, i) => item.id || item.date || `typing-${i}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View style={styles.dateSeparator}>
                  <View style={styles.dateLine} />
                  <Text style={styles.dateText}>{item.date}</Text>
                  <View style={styles.dateLine} />
                </View>
              );
            }
            if (item.type === 'typing') {
              return (
                <View style={[styles.messageWrapper, styles.messageLeft]}>
                  <View style={[styles.bubble, styles.bubbleOther, styles.typingBubble]}>
                    <Text style={styles.typingDots}>● ● ●</Text>
                  </View>
                </View>
              );
            }
            const isMine = item.senderId !== 'counselor';
            return (
              <View style={[styles.messageWrapper, isMine ? styles.messageRight : styles.messageLeft]}>
                {!isMine && (
                  <View style={styles.senderAvatar}>
                    <Ionicons name="medical" size={14} color={Colors.primary} />
                  </View>
                )}
                <View style={{ maxWidth: '78%' }}>
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
                      {item.content}
                    </Text>
                  </View>
                  <Text style={[styles.messageTime, isMine ? { alignSelf: 'flex-end' } : {}]}>
                    {format(new Date(item.sentAt), 'HH:mm')}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + 4 }]}>
          <TextInput
            style={styles.messageInput}
            value={text}
            onChangeText={setText}
            placeholder="พิมพ์ข้อความ..."
            placeholderTextColor={Colors.textLight}
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!text.trim()}>
            <Ionicons name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  chatHeader: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  counselorAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  counselorName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  statusText: { fontSize: 12, color: Colors.success },
  headerAction: { padding: 4 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 6 },
  messageLeft: { alignSelf: 'flex-start' },
  messageRight: { alignSelf: 'flex-end' },
  senderAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: Colors.secondary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { color: Colors.white },
  bubbleTextOther: { color: Colors.text },
  typingBubble: { paddingVertical: 12 },
  typingDots: { color: Colors.textSecondary, fontSize: 14, letterSpacing: 2 },
  messageTime: { fontSize: 11, color: Colors.textLight, marginTop: 3 },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dateText: { fontSize: 11, color: Colors.textSecondary, fontWeight: '600' },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 8,
    borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface,
  },
  messageInput: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text,
    backgroundColor: Colors.background, maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
