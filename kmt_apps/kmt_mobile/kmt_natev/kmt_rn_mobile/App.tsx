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
i18n.fallbacks = true;
i18n.locale = RNLocalize.getLocales()[0]?.languageCode === 'ar' ? 'ar' : 'en';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, View, StyleSheet, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
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
      const response = await fetch('https://https-github-com-feras-kmt.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.id) {
        // تسجيل دخول ناجح
        if (data.role === 'admin') {
          navigation.navigate('Settings'); // يمكنك تغيير اسم الشاشة لاحقاً لصفحة الأدمن
        } else if (data.role === 'user') {
          navigation.navigate('Details'); // يمكنك تغيير اسم الشاشة لاحقاً لصفحة المستخدم
        } else {
          Alert.alert('Login Successful', `Welcome ${data.name}`);
        }
      } else if (data.error) {
        Alert.alert('Login Failed', data.error);
      } else {
        Alert.alert('Login Failed', 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
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
            <Text style={styles.loginText}>{loading ? '...' : i18n.t('login')}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('Details')}>
          <Text style={styles.registerText}>{i18n.t('signup')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
// ...existing code...
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
