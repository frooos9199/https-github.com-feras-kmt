import './firebaseInit';
import * as React from 'react';
import { Alert, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeWebView from './HomeWebView';
import SplashScreen from './SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from './LoginScreen';
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

const Stack = createStackNavigator();


// مكون داخلي للوصول لـ UserContext
const AppContent = () => {
  const navigationRef = React.useRef(null);
  const { user } = React.useContext(UserContext);

  React.useEffect(() => {
    let unsubscribeForeground;
    let unsubscribeTokenRefresh;
    
    (async () => {
      try {
        // Request permission
        console.log('[APP] 🔔 Requesting notification permission...');
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
        
        // إرسال التوكن للسيرفر إذا كان المستخدم مسجل دخول
        if (user?.token && token) {
          console.log('[APP] 📤 Sending FCM token to server...');
          await sendFcmTokenToServer(token, user.token);
        }
      } catch (error) {
        console.error('[APP] ❌ Error in FCM setup:', error);
      }

      // Handle foreground notifications
      unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('🔔 Foreground notification:', remoteMessage);
        
        if (remoteMessage?.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'إشعار جديد',
            remoteMessage.notification.body || '',
            [
              { text: 'إغلاق', style: 'cancel' },
              {
                text: 'عرض',
                onPress: () => {
                  // Navigate to event if eventId exists
                  if (remoteMessage.data?.eventId && navigationRef.current) {
                    navigationRef.current.navigate('EventDetails', {
                      eventId: remoteMessage.data.eventId
                    });
                  }
                }
              }
            ]
          );
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
    };
  }, [user?.token]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
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
