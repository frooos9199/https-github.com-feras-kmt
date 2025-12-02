import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, I18nManager, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import FCMService from './FCMService';
import { sendFcmTokenToServer } from './fcmApi';
import { UserContext } from './UserContext';
import { API_ENDPOINTS } from './apiConfig';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useContext(UserContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      console.log('LOGIN RESPONSE:', response.status, response.ok, data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // التحقق من وجود التوكن و البيانات
      if (!data.accessToken || !data.user) {
        throw new Error('Invalid response from server');
      }

      // حفظ بيانات المستخدم مع التوكن
      const userData = {
        id: data.user.id,
        name: data.user.name || '',
        email: data.user.email || email,
        employeeId: data.user.employee_number || '',
        avatar: data.user.image || '',
        token: data.accessToken, // التوكن الصحيح من API
        role: data.user.role || 'marshal',
        civilId: data.user.civilId || '',
        nationality: data.user.nationality || '',
        birthdate: data.user.birthdate || '',
        phone: data.user.phone || '',
      };

      console.log('[LOGIN] ✅ Saving user data:', {
        email: userData.email,
        role: userData.role,
        hasToken: !!userData.token,
        tokenPreview: userData.token.substring(0, 30) + '...'
      });
      
      await setUser(userData);
      
      // Get FCM token and send to server
      try {
        const fcmToken = await FCMService.getToken();
        if (fcmToken) {
          console.log('[LOGIN] 📱 FCM Token obtained');
          await sendFcmTokenToServer(fcmToken, userData.token);
        }
      } catch (fcmError) {
        console.error('[LOGIN] ❌ Failed to get/send FCM token:', fcmError);
        // Don't block login if FCM fails
      }
      
      console.log('[LOGIN] ✅ Navigating to MainTabs');
      navigation.replace('MainTabs');
    } catch (err) {
      console.error('[LOGIN] ❌ Login error:', err);
      Alert.alert('Error', err.message || 'Login failed');
    }
  };

  return (
    <LinearGradient
      colors={["#1a1a1a", "#dc2626", "#991b1b"]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoBox}>
            <Image source={require('./kmt-logo-white.png')} style={styles.logo} />
            <Text style={styles.systemTitle}>Marshal Management System</Text>
            <Text style={styles.clubTitle}>KUWAIT MOTOR TOWN</Text>
          </View>
          <View style={styles.formBox}>
            <Text style={styles.title}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              textAlign="left"
              keyboardType="email-address"
            />
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textAlign="left"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye" : "eye-off"} 
                  size={24} 
                  color="#888" 
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.signupLink} 
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupText}>
                Don't have an account? <Text style={{color:'#dc2626',fontWeight:'bold'}}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#222',
    fontFamily: 'System',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  eyeIcon: {
    padding: 12,
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
