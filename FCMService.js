// FCMService.js
// خدمة استقبال التوكن والإشعارات من FCM في React Native

import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

class FCMService {
  // طلب صلاحية الإشعارات (Android 13+ وiOS)
  async requestPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
  }

  // الحصول على FCM Token
  async getToken() {
    try {
      console.log('[FCM] Requesting permission...');
      const hasPermission = await this.requestPermission();
      
      if (!hasPermission) {
        console.log('[FCM] Permission denied');
        return null;
      }
      
      console.log('[FCM] Permission granted, getting token...');
      let fcmToken = await messaging().getToken();
      console.log('[FCM] Token obtained:', fcmToken ? 'YES' : 'NO');
      return fcmToken;
    } catch (error) {
      console.error('[FCM] Error getting token:', error);
      return null;
    }
  }

  // الاستماع للإشعارات في المقدمة
  onMessage(listener) {
    return messaging().onMessage(async remoteMessage => {
      listener(remoteMessage);
    });
  }

  // الاستماع للإشعارات عند فتح التطبيق من الخلفية
  onNotificationOpenedApp(listener) {
    return messaging().onNotificationOpenedApp(remoteMessage => {
      listener(remoteMessage);
    });
  }

  // الاستماع للإشعارات عند فتح التطبيق من حالة مغلقة
  async checkInitialNotification(listener) {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
      listener(remoteMessage);
    }
  }
}

export default new FCMService();
