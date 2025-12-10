
import '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import BackgroundFetch from 'react-native-background-fetch';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import { Platform } from 'react-native';
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Background Message Handler - للإشعارات والتطبيق مغلق
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('========================================');
  console.log('[BACKGROUND] 🔔 FCM message received!');
  console.log('[BACKGROUND] 📨 Title:', remoteMessage?.notification?.title);
  console.log('[BACKGROUND] 📝 Body:', remoteMessage?.notification?.body);
  console.log('[BACKGROUND] 📦 Data:', JSON.stringify(remoteMessage?.data));
  console.log('========================================');
  
  // Display notification using Notifee in background
  if (remoteMessage?.notification) {
    try {
      console.log('[BACKGROUND] 🎨 Creating notification channel...');
      
      // Create notification channel for Android
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      console.log('[BACKGROUND] 📢 Displaying notification via Notifee...');
      
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
      
      console.log('[BACKGROUND] ✅ Notification displayed successfully via Notifee');
    } catch (error) {
      console.error('[BACKGROUND] ❌ Error displaying notification:', error);
    }
  }
  
  return Promise.resolve();
});

// Handle background notification events
notifee.onBackgroundEvent(async ({ type, detail }) => {
  console.log('[BACKGROUND] Notifee event:', type);
  
  if (type === EventType.PRESS && detail.notification) {
    console.log('[BACKGROUND] Notification tapped:', detail.notification);
    // Handle navigation when app opens from background
  }
});

// 🔧 تسجيل Background Fetch headless task (للعمل حتى عند إغلاق التطبيق تماماً)
if (Platform.OS === 'ios') {
  BackgroundFetch.registerHeadlessTask(async (event) => {
    console.log('[HEADLESS TASK] 🔄 Background task executing:', event.taskId);
    
    try {
      // التحقق من FCM token
      const token = await messaging().getToken();
      console.log('[HEADLESS TASK] 📱 FCM Token:', token ? 'exists' : 'missing');
      
      // يمكن إضافة منطق إضافي هنا مثل التحقق من الإشعارات الجديدة
    } catch (error) {
      console.error('[HEADLESS TASK] ❌ Error:', error);
    }
    
    BackgroundFetch.finish(event.taskId);
  });
}

AppRegistry.registerComponent(appName, () => App);
