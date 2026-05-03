import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Thai } from '../../constants/Thai';
import Input from '../../components/Input';
import Button from '../../components/Button';

type Role = 'counselor' | 'client';

export default function RegisterScreen() {
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!email.trim()) e.email = 'กรุณากรอกอีเมล';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) e.password = 'กรุณากรอกรหัสผ่าน';
    else if (password.length < 6) e.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    if (password !== confirmPassword) e.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ email: email.trim().toLowerCase(), password, fullName: fullName.trim(), role });
    } catch (err: any) {
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', err?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← {Thai.login}</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{Thai.register}</Text>
          <Text style={styles.subtitle}>สร้างบัญชีเพื่อเริ่มต้นใช้งาน</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>{Thai.selectRole}</Text>
          <View style={styles.roleRow}>
            {(['counselor', 'client'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleCard, role === r && styles.roleCardActive]}
                onPress={() => setRole(r)}
              >
                <Text style={styles.roleEmoji}>{r === 'counselor' ? '👨‍⚕️' : '👤'}</Text>
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'counselor' ? Thai.counselor : Thai.client}
                </Text>
                {role === r && (
                  <View style={styles.roleCheck}>
                    <Text style={{ color: Colors.white, fontSize: 12 }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label={Thai.fullName}
            value={fullName}
            onChangeText={setFullName}
            placeholder="ชื่อ-นามสกุล"
            leftIcon="person-outline"
            error={errors.fullName}
          />
          <Input
            label={Thai.email}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
          />
          <Input
            label={Thai.password}
            value={password}
            onChangeText={setPassword}
            placeholder="อย่างน้อย 6 ตัวอักษร"
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />
          <Input
            label={Thai.confirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="ยืนยันรหัสผ่าน"
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.confirmPassword}
          />

          <Button title={Thai.register} onPress={handleRegister} loading={loading} fullWidth size="large" style={{ marginTop: 8 }} />

          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>
              {Thai.hasAccount} <Text style={styles.loginLinkBold}>{Thai.login}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  back: { marginBottom: 16 },
  backText: { fontSize: 15, color: Colors.primary, fontWeight: '600' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  roleSection: { marginBottom: 24 },
  roleLabel: { fontSize: 14, fontWeight: '600', color: Colors.text, marginBottom: 12 },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleCard: {
    flex: 1, padding: 16, borderRadius: 14, backgroundColor: Colors.surface,
    alignItems: 'center', borderWidth: 2, borderColor: Colors.border,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  roleEmoji: { fontSize: 28, marginBottom: 6 },
  roleText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, textAlign: 'center' },
  roleTextActive: { color: Colors.primaryDark },
  roleCheck: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  form: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  loginLink: { marginTop: 16, alignItems: 'center' },
  loginLinkText: { fontSize: 14, color: Colors.textSecondary },
  loginLinkBold: { color: Colors.primary, fontWeight: '700' },
});
