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
    let fcmToken = await messaging().getToken();
    return fcmToken;
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
