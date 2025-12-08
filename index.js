
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background Message Handler - للإشعارات والتطبيق مغلق
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('[BACKGROUND] Message received:', remoteMessage);
  // يمكنك إضافة معالجة إضافية هنا
});

AppRegistry.registerComponent(appName, () => App);
