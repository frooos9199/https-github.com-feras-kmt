import './firebaseInit';
import * as React from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeWebView from './HomeWebView';
import SplashScreen from './SplashScreen';
import MainTabNavigator from './MainTabNavigator';
import LoginScreen from './LoginScreen';
import AddEventScreen from './AddEventScreen';
import RecentActivityScreen from './RecentActivityScreen';
import messaging from '@react-native-firebase/messaging';
import { UserProvider } from './UserContext';
import LanguageProvider from './LanguageProvider';
import EventDetailsScreen from './EventDetailsScreen';
import EditEventScreen from './EditEventScreen';

const Stack = createStackNavigator();



const App = () => {
  const navigationRef = React.useRef(null);

  React.useEffect(() => {
    let unsubscribeForeground;
    
    (async () => {
      // Request permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (!enabled) {
        console.log('⚠️ Push notification permission not granted');
        return;
      }

      // Get FCM token
      const token = await messaging().getToken();
      console.log('📱 FCM Token:', token);

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
      messaging().onTokenRefresh(newToken => {
        console.log('🔄 FCM Token refreshed:', newToken);
        // TODO: Send new token to server
      });
    })();

    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
    };
  }, []);

  return (
    <UserProvider>
      <LanguageProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="AddEvent" component={AddEventScreen} />
            <Stack.Screen name="HomeWebView" component={HomeWebView} />
            <Stack.Screen name="RecentActivityModal" component={RecentActivityScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="PlaceholderCardModal" component={require('./PlaceholderCardScreen').default} options={{ presentation: 'modal' }} />
            <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="EditEvent" component={EditEventScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </LanguageProvider>
    </UserProvider>
  );
};

export default App;
