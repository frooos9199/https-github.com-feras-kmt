/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import * as React from 'react';
import * as RNLocalize from 'react-native-localize';
import { I18n } from 'i18n-js';
import en from './locales/en.json';
import ar from './locales/ar.json';

const i18n = new I18n({ en, ar });
 (i18n as any).fallbacks = true;
i18n.locale = RNLocalize.getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity, Image, TextInput, Alert, Linking } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// Type declaration for react-native-linear-gradient
import type { LinearGradientProps } from 'react-native-linear-gradient';

const Stack = createNativeStackNavigator();
const RED_COLOR = '#d0021b';
const DARK_COLOR = '#1a0000';
const BUTTON_RADIUS = 10;

function HomeScreen({ navigation }: any) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
  const response = await fetch('https://kmtsys.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      // NextAuth.js expects POST only, never GET
      if (response.status === 405) {
        Alert.alert('Login Error', 'يجب استخدام POST وليس GET.');
        setLoading(false);
        return;
      }
      let data: any = {};
      try {
        data = await response.json();
      } catch (e) {
        Alert.alert('Login Error',
          'لم يتم استقبال رد من السيرفر.\n' +
          'تفاصيل الخطأ: ' + (e?.message || JSON.stringify(e))
        );
        setLoading(false);
        return;
      }
      // Debug: Show full response data for troubleshooting
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        Alert.alert('Login Error', 'لم يتم استقبال أي بيانات من السيرفر. تأكد من صحة الرابط أو جرب من متصفح أو Postman.');
        setLoading(false);
        return;
      }
      // تحقق من الحقول الصحيحة حسب الرد المتوقع من NextAuth
      // إذا كان الرد يحتوي على error
      if (data.error) {
        Alert.alert('Login Failed', data.error);
        setLoading(false);
        return;
      }
      // إذا كان الرد يحتوي على user أو token أو أي بيانات أخرى
      if (response.ok && (data.user || data.token || data.accessToken)) {
        Alert.alert('Login Successful', 'تم تسجيل الدخول بنجاح!');
        // التنقل حسب دور المستخدم إذا وجد
        if (data.user && data.user.role === 'admin') {
          navigation.navigate('Settings');
        } else if (data.user && data.user.role === 'user') {
          navigation.navigate('Details');
        } else {
          // إذا لم يوجد دور، فقط عرض رسالة نجاح
          // يمكنك هنا حفظ التوكن أو بيانات المستخدم حسب الحاجة
        }
      } else {
        Alert.alert('Login Failed', 'الرد من السيرفر: ' + JSON.stringify(data));
      }
    } catch (error: any) {
      // عرض الخطأ الكامل
      Alert.alert('Error',
        'رسالة الخطأ: ' + (error?.message || 'Network error') +
        '\nتفاصيل الخطأ: ' + JSON.stringify(error)
      );
    }
    setLoading(false);
  };

  return (
    <LinearGradient colors={[DARK_COLOR, RED_COLOR]} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <Image source={require('./assests/logo.png')} style={styles.logo} />
        <Text style={styles.loading}>{i18n.t('loading')}</Text>
        <Text style={styles.title}>{i18n.t('title')}</Text>
        <Text style={styles.subtitle}>{i18n.t('subtitle')}</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Image source={require('./assests/icon1.png')} style={{ width: 24, height: 24, marginRight: 8 }} />
              <Text style={styles.loginText}>{loading ? '...' : i18n.t('login')}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Details')}>
              <Text style={styles.registerText}>{i18n.t('signup')}</Text>
        </TouchableOpacity>
            {/* Website Link */}
            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL('https://kmtsys.com')}>
              <Text style={styles.linkText}>الموقع الرسمي</Text>
            </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
// ...existing code...
// API Endpoints
const API_BASE = 'https://kmtsys.com/api';
const API_ENDPOINTS = {
  login: API_BASE + '/auth/[...nextauth]',
  signup: API_BASE + '/auth/signup',
  attendance: API_BASE + '/admin/attendance',
  upload: API_BASE + '/upload',
  notifications: API_BASE + '/notifications',
  events: API_BASE + '/events',
  profile: API_BASE + '/profile',
};
}

function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
  <Text style={styles.title}>{i18n.t('settings')}</Text>
    </SafeAreaView>
  );
}

function DetailsScreen() {
  return (
    <SafeAreaView style={styles.container}>
  <Text style={styles.title}>{i18n.t('details')}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  form: {
    width: '80%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 18,
    resizeMode: 'contain',
  },
  loading: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 18,
    fontFamily: 'System',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'System',
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 40,
    fontFamily: 'System',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: BUTTON_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  registerButton: {
    backgroundColor: RED_COLOR,
    borderRadius: BUTTON_RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginLeft: 8,
    shadowColor: RED_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  registerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'System',
  },
  linkButton: {
    marginTop: 16,
    padding: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
