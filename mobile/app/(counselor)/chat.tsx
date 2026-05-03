import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import { format } from 'date-fns';

const MOCK_ROOMS = [
  {
    id: 'r1', clientId: 'u1', clientName: 'สมชาย ใจดี',
    lastMessage: { content: 'ขอบคุณครับ จะลองทำดู', sentAt: new Date().toISOString() },
    unreadCount: 2,
  },
  {
    id: 'r2', clientId: 'u2', clientName: 'นิดา แสงทอง',
    lastMessage: { content: 'หนูจะลองคุยกับแม่นะคะ', sentAt: new Date(Date.now() - 3600000).toISOString() },
    unreadCount: 0,
  },
  {
    id: 'r3', clientId: 'u3', clientName: 'ปรีชา มณีรัตน์',
    lastMessage: { content: 'นอนหลับดีขึ้นแล้วครับ', sentAt: new Date(Date.now() - 7200000).toISOString() },
    unreadCount: 1,
  },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  r1: [
    { id: 'm1', senderId: 'u1', senderName: 'สมชาย', content: 'สวัสดีครับ อยากขอคำแนะนำเรื่องงาน', sentAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: 'm2', senderId: 'c1', senderName: 'นักจิตวิทยา', content: 'สวัสดีครับ คุณสมชาย มีอะไรอยากปรึกษาไหมครับ?', sentAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'm3', senderId: 'u1', senderName: 'สมชาย', content: 'ขอบคุณครับ จะลองทำดู', sentAt: new Date().toISOString() },
  ],
  r2: [
    { id: 'm4', senderId: 'u2', senderName: 'นิดา', content: 'หนูจะลองคุยกับแม่นะคะ', sentAt: new Date(Date.now() - 3600000).toISOString() },
  ],
  r3: [
    { id: 'm5', senderId: 'u3', senderName: 'ปรีชา', content: 'นอนหลับดีขึ้นแล้วครับ', sentAt: new Date(Date.now() - 7200000).toISOString() },
  ],
};

export default function CounselorChat() {
  const insets = useSafeAreaInsets();
  const [activeRoom, setActiveRoom] = useState<(typeof MOCK_ROOMS)[0] | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const openRoom = (room: typeof MOCK_ROOMS[0]) => {
    setActiveRoom(room);
    setMessages(MOCK_MESSAGES[room.id] || []);
  };

  const sendMessage = () => {
    if (!text.trim() || !activeRoom) return;
    const msg = {
      id: Date.now().toString(),
      senderId: 'c1',
      senderName: 'นักจิตวิทยา',
      content: text.trim(),
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (activeRoom) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setActiveRoom(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>{activeRoom.clientName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.chatHeaderName}>{activeRoom.clientName}</Text>
              <Text style={styles.chatHeaderStatus}>🟢 ออนไลน์</Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isMine = item.senderId === 'c1';
              return (
                <View style={[styles.messageWrapper, isMine ? styles.messageRight : styles.messageLeft]}>
                  <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isMine ? styles.bubbleTextMine : styles.bubbleTextOther]}>
                      {item.content}
                    </Text>
                  </View>
                  <Text style={styles.messageTime}>{format(new Date(item.sentAt), 'HH:mm')}</Text>
                </View>
              );
            }}
          />

          <View style={[styles.inputBar, { paddingBottom: insets.bottom + 4 }]}>
            <TextInput
              style={styles.messageInput}
              value={text}
              onChangeText={setText}
              placeholder="พิมพ์ข้อความ..."
              placeholderTextColor={Colors.textLight}
              multiline
            />
            <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={sendMessage} disabled={!text.trim()}>
              <Ionicons name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="แชท" subtitle="การสื่อสารกับผู้รับบริการ" />
      <FlatList
        data={MOCK_ROOMS}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingVertical: 8, paddingBottom: insets.bottom + 80 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.roomItem} onPress={() => openRoom(item)}>
            <View style={styles.roomAvatar}>
              <Text style={styles.roomAvatarText}>{item.clientName.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.roomName}>{item.clientName}</Text>
              <Text style={styles.roomLastMsg} numberOfLines={1}>{item.lastMessage.content}</Text>
            </View>
            <View style={styles.roomMeta}>
              <Text style={styles.roomTime}>{format(new Date(item.lastMessage.sentAt), 'HH:mm')}</Text>
              {item.unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>{item.unreadCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  roomItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  roomAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  roomAvatarText: { fontSize: 19, fontWeight: '700', color: Colors.primary },
  roomName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  roomLastMsg: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },
  roomMeta: { alignItems: 'flex-end', gap: 4 },
  roomTime: { fontSize: 11, color: Colors.textLight },
  unreadBadge: { backgroundColor: Colors.primary, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadText: { color: Colors.white, fontSize: 11, fontWeight: '700' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backBtn: { padding: 4 },
  chatHeaderAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  chatHeaderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  chatHeaderName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  chatHeaderStatus: { fontSize: 12, color: Colors.success },
  messageWrapper: { marginBottom: 12, maxWidth: '80%' },
  messageLeft: { alignSelf: 'flex-start' },
  messageRight: { alignSelf: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { color: Colors.white },
  bubbleTextOther: { color: Colors.text },
  messageTime: { fontSize: 11, color: Colors.textLight, marginTop: 3, alignSelf: 'flex-end' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  messageInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.text, backgroundColor: Colors.background, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
