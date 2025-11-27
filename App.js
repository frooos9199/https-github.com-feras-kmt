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
  React.useEffect(() => {
    let unsubscribeForeground;
    (async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) {
        Alert.alert('تنبيه', 'لم يتم منح صلاحية الإشعارات.');
        return;
      }
      const token = await messaging().getToken();
      Alert.alert('FCM Token', token);
      unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        if (remoteMessage?.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'إشعار جديد',
            remoteMessage.notification.body || ''
          );
        }
      });
      messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage?.notification) {
          Alert.alert(
            remoteMessage.notification.title || 'إشعار (فتح من الخلفية)',
            remoteMessage.notification.body || ''
          );
        }
      });
      const initialMessage = await messaging().getInitialNotification();
      if (initialMessage?.notification) {
        Alert.alert(
          initialMessage.notification.title || 'إشعار (تشغيل من إشعار)',
          initialMessage.notification.body || ''
        );
      }
      messaging().onTokenRefresh(newToken => {
        Alert.alert('FCM Token تم تحديثه', newToken);
      });
    })();
    return () => {
      if (unsubscribeForeground) unsubscribeForeground();
    };
  }, []);

  return (
    <UserProvider>
      <LanguageProvider>
        <NavigationContainer>
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
