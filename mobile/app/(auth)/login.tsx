import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';
import { Thai } from '../../constants/Thai';
import Input from '../../components/Input';
import Button from '../../components/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'กรุณากรอกอีเมล';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    if (!password) e.password = 'กรุณากรอกรหัสผ่าน';
    else if (password.length < 6) e.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', err?.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'counselor' | 'client') => {
    if (role === 'counselor') {
      setEmail('counselor@demo.com');
      setPassword('demo1234');
    } else {
      setEmail('client@demo.com');
      setPassword('demo1234');
    }
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <Text style={styles.appName}>{Thai.appName}</Text>
          <Text style={styles.tagline}>{Thai.appTagline}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>{Thai.login}</Text>

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
            placeholder="รหัสผ่านของคุณ"
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password}
          />

          <Button
            title={Thai.login}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="large"
            style={styles.loginBtn}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.registerLink}>
            <Text style={styles.registerLinkText}>
              {Thai.noAccount}{' '}
              <Text style={styles.registerLinkBold}>{Thai.register}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Demo accounts */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>บัญชีทดลองใช้</Text>
          <View style={styles.demoButtons}>
            <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.counselor }]} onPress={() => fillDemo('counselor')}>
              <Text style={[styles.demoBtnText, { color: Colors.counselor }]}>👨‍⚕️ นักจิตวิทยา</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.demoBtn, { borderColor: Colors.client }]} onPress={() => fillDemo('client')}>
              <Text style={[styles.demoBtnText, { color: Colors.client }]}>👤 ผู้รับบริการ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2, borderColor: Colors.primary + '30',
  },
  logoEmoji: { fontSize: 44 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.primary, letterSpacing: 1 },
  tagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  form: {
    backgroundColor: Colors.surface, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, marginBottom: 24, textAlign: 'center' },
  loginBtn: { marginTop: 8 },
  registerLink: { marginTop: 16, alignItems: 'center' },
  registerLinkText: { fontSize: 14, color: Colors.textSecondary },
  registerLinkBold: { color: Colors.primary, fontWeight: '700' },
  demoSection: { marginTop: 24 },
  demoTitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginBottom: 10 },
  demoButtons: { flexDirection: 'row', gap: 12 },
  demoBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  demoBtnText: { fontSize: 13, fontWeight: '600' },
});
