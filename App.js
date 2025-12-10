import 'react-native-gesture-handler';
import './firebaseInit';
import * as React from 'react';
import { Alert, Platform, LogBox, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeWebView from './HomeWebView';
import SplashScreen from './SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import AddEventScreen from './AddEventScreen';
import RecentActivityScreen from './RecentActivityScreen';
import messaging from '@react-native-firebase/messaging';
import { UserProvider, UserContext } from './UserContext';
import LanguageProvider from './LanguageProvider';
import EventDetailsScreen from './EventDetailsScreen';
import EditEventScreen from './EditEventScreen';
import ErrorBoundary from './ErrorBoundary';
import { sendFcmTokenToServer } from './fcmApi';
import AttendanceScreen from './AttendanceScreen';
import MyAttendanceScreen from './MyAttendanceScreen';
import PendingRequestsScreen from './PendingRequestsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

// إخفاء جميع التحذيرات والـ LogBox
LogBox.ignoreAllLogs(true);

// 🔧 مسح AsyncStorage عند بدء التطبيق (مرة واحدة فقط)
const clearStorageOnce = async () => {
  try {
    const hasCleared = await AsyncStorage.getItem('storage_cleared_v2'); // ✅ غيرنا v1 إلى v2
    if (!hasCleared) {
      console.log('[APP] 🗑️ Clearing old AsyncStorage...');
      await AsyncStorage.clear();
      await AsyncStorage.setItem('storage_cleared_v2', 'true');
      console.log('[APP] ✅ AsyncStorage cleared!');
    }
  } catch (error) {
    console.error('[APP] ❌ Error clearing storage:', error);
  }
};

clearStorageOnce();

const Stack = createStackNavigator();


// مكون داخلي للوصول لـ UserContext
const AppContent = () => {
  const navigationRef = React.useRef(null);
  const { user } = React.useContext(UserContext);

  React.useEffect(() => {
    let unsubscribeForeground;
    let unsubscribeTokenRefresh;
    
    // 🔧 تفعيل Notifee event listeners
    const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification) {
        console.log('� [Notifee] Notification tapped:', detail.notification);
        // Navigate if eventId exists
        const eventId = detail.notification.data?.eventId;
        if (eventId && navigationRef.current) {
          navigationRef.current.navigate('EventDetails', { eventId });
        }
      }
    });
    
    console.log('[APP] ✅ Notifee listeners configured');
    
    (async () => {
      try {
        // Request permission
        console.log('[APP] 🔔 Requesting notification permission...');
        
        // Request Notifee permissions (works on both iOS & Android)
        await notifee.requestPermission();
        
        // Also request Firebase permissions
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        if (!enabled) {
          console.log('[APP] ⚠️ Push notification permission not granted');
          return;
        }

        console.log('[APP] ✅ Permission granted');

        // تسجيل الجهاز للرسائل البعيدة (مطلوب لـ iOS)
        if (Platform.OS === 'ios') {
          console.log('[APP] 📱 Registering device for remote messages (iOS)...');
          await messaging().registerDeviceForRemoteMessages();
          console.log('[APP] ✅ Device registered');
        }

        // Get FCM token
        console.log('[APP] 🔑 Getting FCM token...');
        const token = await messaging().getToken();
        console.log('[APP] ✅ FCM Token obtained:', token ? 'YES' : 'NO');
        if (token) {
          console.log('[APP] 📝 Token (first 30 chars):', token.substring(0, 30));
        }
        
        // إرسال التوكن للسيرفر إذا كان المستخدم مسجل دخول
        if (user?.token && token) {
          console.log('[APP] 📤 Sending FCM token to server...');
          console.log('[APP] 👤 User token exists:', user.token ? 'YES' : 'NO');
          const saveResult = await sendFcmTokenToServer(token, user.token);
          console.log('[APP] 💾 FCM Token save result:', saveResult ? 'SUCCESS ✅' : 'FAILED ❌');
        } else {
          console.log('[APP] ⚠️ Cannot save FCM token - user not logged in or token missing');
        }

        // 🔧 تفعيل Background Fetch
        if (Platform.OS === 'ios') {
          console.log('[APP] 🔄 Configuring Background Fetch...');
          
          BackgroundFetch.configure({
            minimumFetchInterval: 15, // الحد الأدنى 15 دقيقة
            stopOnTerminate: false,   // الاستمرار حتى بعد إغلاق التطبيق
            startOnBoot: true,        // البدء عند إعادة تشغيل الجهاز
            enableHeadless: true,     // السماح بالعمل في الخلفية الكاملة
          }, async (taskId) => {
            console.log('[BACKGROUND FETCH] ✅ Task executing:', taskId);
            
            // التحقق من الإشعارات في الخلفية
            try {
              const fcmToken = await messaging().getToken();
              console.log('[BACKGROUND FETCH] 📱 FCM Token:', fcmToken ? 'exists' : 'missing');
            } catch (error) {
              console.error('[BACKGROUND FETCH] ❌ Error:', error);
            }
            
            // إنهاء المهمة
            BackgroundFetch.finish(taskId);
          }, (taskId) => {
            // Timeout callback
            console.log('[BACKGROUND FETCH] ⏱️ Task timeout:', taskId);
            BackgroundFetch.finish(taskId);
          });

          // Start background fetch
          BackgroundFetch.start();
          console.log('[APP] ✅ Background Fetch started');
        }
      } catch (error) {
        console.error('[APP] ❌ Error in FCM setup:', error);
      }

      // Handle foreground notifications using Notifee
      unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('🔔 [FOREGROUND] FCM message received:', remoteMessage);
        
        if (remoteMessage?.notification) {
          // Display notification using Notifee
          try {
            // Create notification channel for Android
            const channelId = await notifee.createChannel({
              id: 'default',
              name: 'Default Channel',
              importance: AndroidImportance.HIGH,
              sound: 'default',
            });

            // Display the notification
            await notifee.displayNotification({
              title: remoteMessage.notification.title || 'إشعار جديد',
              body: remoteMessage.notification.body || '',
              data: remoteMessage.data || {},
              ios: {
                sound: 'default',
                badgeCount: 1,
                foregroundPresentationOptions: {
                  alert: true,
                  badge: true,
                  sound: true,
                  banner: true,
                  list: true,
                },
              },
              android: {
                channelId,
                sound: 'default',
                importance: AndroidImportance.HIGH,
                pressAction: {
                  id: 'default',
                },
              },
            });
            
            console.log('✅ [FOREGROUND] Notification displayed via Notifee');
          } catch (error) {
            console.error('❌ [FOREGROUND] Error displaying notification:', error);
          }
        }
      });

      // Handle notification when app opened from background
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('🔔 Notification opened app from background:', remoteMessage);
        
        if (remoteMessage?.data?.eventId && navigationRef.current) {
          setTimeout(() => {
            navigationRef.current.navigate('EventDetails', {
              eventId: remoteMessage.data.eventId
            });
          }, 1000);
        }
      });

      // Handle notification when app opened from quit state
      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage) {
        console.log('🔔 Notification opened app from quit state:', initialMessage);
        
        if (initialMessage?.data?.eventId && navigationRef.current) {
          setTimeout(() => {
            navigationRef.current.navigate('EventDetails', {
              eventId: initialMessage.data.eventId
            });
          }, 2000);
        }
      }

      // Handle token refresh
      unsubscribeTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
        console.log('🔄 FCM Token refreshed:', newToken);
        
        // إرسال التوكن الجديد للسيرفر
        if (user?.token) {
          await sendFcmTokenToServer(newToken, user.token);
        }
      });
    })();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
      if (unsubscribeTokenRefresh) unsubscribeTokenRefresh();
      if (unsubscribeNotifee) unsubscribeNotifee();
    };
  }, [user?.token]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen name="AddEvent" component={AddEventScreen} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} />
        <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} />
        <Stack.Screen name="HomeWebView" component={HomeWebView} />
        <Stack.Screen name="RecentActivityModal" component={RecentActivityScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="PlaceholderCardModal" component={require('./PlaceholderCardScreen').default} options={{ presentation: 'modal' }} />
        <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
        <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
        <Stack.Screen name="EditEvent" component={EditEventScreen} />
        <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
        <Stack.Screen name="Notifications" component={require('./NotificationsScreen').default} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <UserProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </UserProvider>
    </ErrorBoundary>
  );
};

export default App;
