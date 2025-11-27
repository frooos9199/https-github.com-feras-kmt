import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, I18nManager } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FCMService from './FCMService';
import { sendFcmTokenToServer } from './fcmApi';
import { UserContext } from './UserContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('خطأ', 'يرجى إدخال البريد وكلمة المرور');
      return;
    }
    try {
      const response = await fetch('https://www.kmtsys.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('LOGIN RESPONSE:', response.status, response.ok, data);
      // طباعة جميع الحقول لمعرفة مكان التوكن
      Object.keys(data).forEach(k => console.log('LOGIN FIELD:', k, data[k]));
      if (data.user) {
        Object.keys(data.user).forEach(k => console.log('USER FIELD:', k, data.user[k]));
      }
      if (!response.ok) throw new Error(data.message || 'فشل تسجيل الدخول');

      setUser({
        name: data.user?.name || '',
        employeeId: data.user?.employee_number || '',
        avatar: data.user?.image || '',
        token: data.accessToken || data.token || data.jwt || data.user?.token || '',
      });
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('خطأ', err.message);
    }
  };

  return (
    <LinearGradient
      colors={["#1a1a1a", "#dc2626", "#991b1b"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoBox}>
        <Image source={require('./kmt-logo-white.png')} style={styles.logo} />
        <Text style={styles.systemTitle}>نظام إدارة المارشلات</Text>
        <Text style={styles.clubTitle}>نادي الكويت للسيارات</Text>
      </View>
      <View style={styles.formBox}>
        <Text style={styles.title}>تسجيل الدخول</Text>
        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />
        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>دخول</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupLink} onPress={() => Alert.alert('قريباً', 'ميزة تسجيل حساب جديد ستتوفر قريباً!')}>
          <Text style={styles.signupText}>ليس لديك حساب؟ <Text style={{color:'#dc2626',fontWeight:'bold'}}>سجل الآن</Text></Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  logoBox: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 16,
    borderRadius: 32,
    backgroundColor: '#fff1',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  systemTitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'System',
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  clubTitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'System',
    textShadowColor: '#991b1b',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  formBox: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#dc2626',
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
    fontSize: 16,
    color: '#222',
    fontFamily: 'System',
    backgroundColor: '#f8f9fa',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  button: {
    width: '100%',
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#991b1b',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  signupLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  signupText: {
    color: '#222',
    fontSize: 15,
    opacity: 0.8,
  },
});

export default LoginScreen;
