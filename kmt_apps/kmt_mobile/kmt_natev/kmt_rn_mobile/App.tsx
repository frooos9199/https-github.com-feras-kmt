// شاشة رئيسية بعد تسجيل الدخول
function DashboardScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Attendance')}>
        <Text style={styles.linkText}>Attendance</Text>
      </TouchableOpacity>
      {/* أزرار باقي الشاشات يمكن إضافتها هنا */}
    </SafeAreaView>
  );
}
// شاشة الحضور
function AttendanceScreen() {
  const [attendance, setAttendance] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/attendance/my-attendance', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setAttendance(data.records || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setAttendance(data.records || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الحضور');
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الحضور</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {attendance.length === 0 ? (
            <Text>لا توجد بيانات حضور</Text>
          ) : (
            attendance.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>الاسم: {item.name}</Text>
                <Text>التاريخ: {item.date}</Text>
                <Text>الحالة: {item.status}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
// Type declaration for react-native-linear-gradient
import type { LinearGradientProps } from 'react-native-linear-gradient';

const Stack = createNativeStackNavigator();
const RED_COLOR = '#d0021b';
const DARK_COLOR = '#1a0000';
const BUTTON_RADIUS = 10;

function HomeScreen({ navigation }: any) {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
  const response = await fetch('https://www.kmtsys.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const rawText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        Alert.alert('Login Error', 'Server did not return valid JSON.\nRaw response:\n' + rawText);
        setLoading(false);
        return;
      }
      if (!data.success) {
        Alert.alert('Login Failed', data?.message || 'Invalid credentials');
        setLoading(false);
        return;
      }
      if (data.success && data.token && data.user) {
        Alert.alert('Login Successful', 'Welcome ' + data.user.name);
        setToken(data.token);
        await AsyncStorage.setItem('jwtToken', data.token);
        navigation.navigate('Dashboard');
      } else {
        Alert.alert('Login Failed', 'Unexpected response: ' + JSON.stringify(data));
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error message: ' + (error?.message || 'Network error') + '\nDetails: ' + JSON.stringify(error));
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
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
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
        {/* أزرار إضافية محذوفة من شاشة الدخول */}
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
// شاشة التقارير
// شاشة الإشعارات
// شاشة الملف الشخصي
// شاشة الإدارة
// شاشة النسخ الاحتياطي
// شاشة الأحداث
function EventsScreen() {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setEvents(data.events || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الأحداث');
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الأحداث</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {events.length === 0 ? (
            <Text>لا توجد أحداث</Text>
          ) : (
            events.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>العنوان: {item.title}</Text>
                <Text>التاريخ: {item.date}</Text>
                <Text>رقم الحدث: {item.id}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
      {/* زر التنقل محذوف لأنه يسبب خطأ */}
function BackupScreen() {
  const [backups, setBackups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchBackup = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/backup', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setBackups(data.backups || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setBackups(data.backups || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات النسخ الاحتياطي');
      }
      setLoading(false);
    };
    fetchBackup();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>النسخ الاحتياطي</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {backups.length === 0 ? (
            <Text>لا توجد نسخ احتياطية</Text>
          ) : (
            backups.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>التاريخ: {item.date}</Text>
                <Text>الحالة: {item.status}</Text>
                <Text>رقم النسخة: {item.id}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
      {/* زر التنقل محذوف لأنه يسبب خطأ */}
function AdminScreen() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setUsers(data.users || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setUsers(data.users || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الإدارة');
      }
      setLoading(false);
    };
    fetchAdmin();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الإدارة</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {users.length === 0 ? (
            <Text>لا يوجد مستخدمون</Text>
          ) : (
            users.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>الاسم: {item.name}</Text>
                <Text>الدور: {item.role}</Text>
                <Text>رقم المستخدم: {item.id}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
      {/* زر التنقل محذوف لأنه يسبب خطأ */}
function ProfileScreen() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setUser(data.user || null);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setUser(data.user || null);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الملف الشخصي');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الملف الشخصي</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && user && (
        <View style={{width:'90%'}}>
          <Text>الاسم: {user.name}</Text>
          <Text>البريد الإلكتروني: {user.email}</Text>
          <Text>رقم المستخدم: {user.id}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
      {/* زر التنقل محذوف لأنه يسبب خطأ */}
function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setNotifications(data.notifications || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        setError('خطأ في جلب الإشعارات');
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الإشعارات</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {notifications.length === 0 ? (
            <Text>لا توجد إشعارات</Text>
          ) : (
            notifications.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>الرسالة: {item.message}</Text>
                <Text>الحالة: {item.read ? 'مقروء' : 'غير مقروء'}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
      {/* زر التنقل محذوف لأنه يسبب خطأ */}
function ReportsScreen() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/admin/reports', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setReports(data.reports || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setReports(data.reports || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات التقارير');
      }
      setLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>التقارير</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {!loading && !error && (
        <View style={{width:'90%'}}>
          {reports.length === 0 ? (
            <Text>لا توجد تقارير</Text>
          ) : (
            reports.map((item:any, idx:number) => (
              <View key={idx} style={{padding:10, borderBottomWidth:1, borderColor:'#eee'}}>
                <Text>العنوان: {item.title}</Text>
                <Text>تاريخ الإنشاء: {item.createdAt}</Text>
              </View>
            ))
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
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

import { useState, useEffect } from 'react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [flagRotation, setFlagRotation] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) return;
    const interval = setInterval(() => {
      setFlagRotation(r => (r + 10) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [showSplash]);

  if (showSplash) {
    return <SplashScreen flagRotation={flagRotation} />;
  }

// تعريف جميع دوال الشاشات المطلوبة قبل دالة App
function ReportsScreen() {
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/admin/reports', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setReports(data.reports || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setReports(data.reports || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات التقارير');
      }
      setLoading(false);
    };
    fetchReports();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>التقارير</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى التقارير */}
    </SafeAreaView>
  );
}

function NotificationsScreen() {
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setNotifications(data.notifications || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        setError('خطأ في جلب الإشعارات');
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الإشعارات</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى الإشعارات */}
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setUser(data.user || null);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setUser(data.user || null);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الملف الشخصي');
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الملف الشخصي</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى الملف الشخصي */}
    </SafeAreaView>
  );
}

function AdminScreen() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/admin', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setUsers(data.users || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setUsers(data.users || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الإدارة');
      }
      setLoading(false);
    };
    fetchAdmin();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الإدارة</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى الإدارة */}
    </SafeAreaView>
  );
}

function BackupScreen() {
  const [backups, setBackups] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchBackup = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/backup', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setBackups(data.backups || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setBackups(data.backups || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات النسخ الاحتياطي');
      }
      setLoading(false);
    };
    fetchBackup();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>النسخ الاحتياطي</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى النسخ الاحتياطي */}
    </SafeAreaView>
  );
}

function EventsScreen() {
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = await AsyncStorage.getItem('jwtToken');
        if (!token) {
          setError('لم يتم العثور على التوكن، يرجى تسجيل الدخول مرة أخرى');
          setLoading(false);
          return;
        }
        const response = await fetch('https://kmtsys.com/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const text = await response.text();
        let data: any = {};
        try {
          data = JSON.parse(text);
        } catch (e) {
          setError('خطأ في البيانات المسترجعة من الخادم');
          setLoading(false);
          return;
        }
        setEvents(data.events || []);
        if (data.success === false) {
          setError(data.error || 'حدث خطأ غير معروف');
        } else {
          setEvents(data.events || []);
        }
      } catch (err) {
        setError('خطأ في جلب بيانات الأحداث');
      }
      setLoading(false);
    };
    fetchEvents();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>الأحداث</Text>
      {loading ? <Text>جاري التحميل...</Text> : null}
      {error ? <Text style={{color:'red'}}>{error}</Text> : null}
      {/* محتوى الأحداث */}
    </SafeAreaView>
  );
}

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="Backup" component={BackupScreen} />
        <Stack.Screen name="Events" component={EventsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const splashStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  splashLogo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 24,
  },
  splashText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d0021b',
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  splashSubText: {
    fontSize: 20,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 1,
  },
  flag: {
    width: 40,
    height: 40,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d0021b',
    backgroundColor: '#fff',
    shadowColor: '#d0021b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});

// مكون شاشة البداية الاحترافية
import { Animated } from 'react-native';
function SplashScreen({ flagRotation }: { flagRotation: number }) {
  return (
    <View style={splashStyles.splashContainer}>
      <Image source={require('./assests/logo.png')} style={splashStyles.splashLogo} />
      <Text style={splashStyles.splashText}>Welcome to KMT App</Text>
      <Text style={splashStyles.splashSubText}>Loading...</Text>
      <View style={{flexDirection:'row', marginTop:30}}>
        <AnimatedFlag rotation={flagRotation} />
        <AnimatedFlag rotation={-flagRotation} />
        <AnimatedFlag rotation={flagRotation} />
      </View>
    </View>
  );
}

function AnimatedFlag({ rotation }: { rotation: number }) {
  return (
    <Animated.View style={{
      ...splashStyles.flag,
      transform: [{ rotate: `${rotation}deg` }],
      backgroundColor: '#fff',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <View style={{width:24, height:24, backgroundColor:'#d0021b', borderRadius:4}} />
    </Animated.View>
  );
}
