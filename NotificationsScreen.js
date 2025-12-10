import './firebaseInit';
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator, Animated, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { UserContext } from './UserContext';
import { API_ENDPOINTS } from './apiConfig';
import { useNavigation } from '@react-navigation/native';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import I18n from './i18n';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lang, setLang] = useState(I18n.locale);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const fetchNotifications = async (showLoadingIndicator = true) => {
    console.log('='.repeat(50));
    console.log('[NOTIFICATIONS] 🔄 Fetching notifications...');
    console.log('[NOTIFICATIONS] 👤 User:', user ? JSON.stringify({email: user.email, role: user.role}) : 'NULL');
    console.log('[NOTIFICATIONS] 🔑 Token:', user?.token ? `${user.token.substring(0, 30)}...` : 'MISSING');
    
    if (!user?.token) {
      console.log('[NOTIFICATIONS] ❌ No token, skipping fetch');
      if (showLoadingIndicator) setLoading(false);
      return;
    }

    try {
      console.log('[NOTIFICATIONS] 🌐 API URL:', API_ENDPOINTS.NOTIFICATIONS);
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        }
      });

      console.log('[NOTIFICATIONS] 📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[NOTIFICATIONS] ✅ Received notifications:', data.length);
        console.log('[NOTIFICATIONS] 📋 First notification:', data[0] ? data[0].title : 'N/A');
        setNotifications(data);
        
        // حساب عدد الإشعارات غير المقروءة
        const unread = data.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        console.log('[NOTIFICATIONS] 📊 Unread count:', unread);
        
        // 🔔 Update app badge (iOS only)
        if (Platform.OS === 'ios') {
          PushNotificationIOS.setApplicationIconBadgeNumber(unread);
        }
      } else {
        const errorData = await response.json();
        console.error('[NOTIFICATIONS] ❌ Failed to fetch:', errorData);
        // عرض رسالة خطأ للمستخدم
        // يمكن إضافة state للخطأ وعرضه في الواجهة
      }
    } catch (error) {
      console.error('[NOTIFICATIONS] 💥 Error:', error.message);
      console.error('[NOTIFICATIONS] Stack:', error.stack);
      // يمكن إضافة Alert هنا إذا لزم الأمر
    } finally {
      if (showLoadingIndicator) setLoading(false);
      setRefreshing(false);
      console.log('[NOTIFICATIONS] ✔️ Fetch completed');
      console.log('='.repeat(50));
    }
  };

  useEffect(() => {
    fetchNotifications(true); // Show loading on first load
    
    // 🔔 Auto-refresh every 5 seconds for real-time notifications
    const interval = setInterval(() => {
      console.log('[NOTIFICATIONS] ⏰ Auto-refreshing...');
      fetchNotifications(false); // Don't show loading spinner on auto-refresh
    }, 5000);
    
    return () => {
      console.log('[NOTIFICATIONS] 🛑 Cleaning up auto-refresh');
      clearInterval(interval);
    };
  }, []);

  // تحديث اللغة عند التبديل من ProfileScreen
  useEffect(() => {
    const interval = setInterval(() => {
      if (I18n.locale !== lang) {
        setLang(I18n.locale);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ notificationId })
      });
      
      // Update local state
      setNotifications(prev => {
        const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
        // إعادة حساب عدد غير المقروءة
        const unread = updated.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        
        // تحديث Badge على أيقونة التطبيق (iOS فقط)
        if (Platform.OS === 'ios') {
          PushNotificationIOS.setApplicationIconBadgeNumber(unread);
          console.log('[NOTIFICATIONS] 📱 App icon badge updated (iOS):', unread);
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read only
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    // لا ننتقل لأي صفحة - فقط نحدد كمقروء
  };

  const deleteNotification = async (notificationId) => {
    try {
      console.log('[DELETE] 🗑️ Deleting notification:', notificationId);
      
      const response = await fetch(API_ENDPOINTS.NOTIFICATIONS, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ notificationId: notificationId })
      });

      console.log('[DELETE] Response status:', response.status);
      
      if (response.ok) {
        console.log('[DELETE] ✅ Deleted successfully from server');
        
        // Remove from local state
        setNotifications(prev => {
          const updated = prev.filter(n => n.id !== notificationId);
          // إعادة حساب عدد غير المقروءة
          const unread = updated.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          
          // تحديث Badge على أيقونة التطبيق (iOS فقط)
          if (Platform.OS === 'ios') {
            PushNotificationIOS.setApplicationIconBadgeNumber(unread);
            console.log('[DELETE] 📱 App icon badge updated (iOS):', unread);
          }
          console.log('[DELETE] Updated local state, remaining:', updated.length);
          
          return updated;
        });
      } else {
        const errorData = await response.json();
        console.error('[DELETE] ❌ Failed:', errorData);
      }
    } catch (error) {
      console.error('[DELETE] 💥 Error:', error);
    }
  };

  const renderRightActions = (progress, dragX, item) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
      overshootRight={false}
    >
      <TouchableOpacity 
        style={[styles.card, !item.isRead && styles.unreadCard]} 
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {lang === 'ar' ? (item.titleAr || item.titleEn) : (item.titleEn || item.titleAr)}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardBody}>
          {lang === 'ar' ? (item.messageAr || item.messageEn) : (item.messageEn || item.messageAr)}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header مع زر الرجوع */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.header}>
            <Text style={styles.title}>{I18n.t('notifications')}</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <View style={styles.backButton} />
        </View>
        
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderNotification}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#dc2626']} />
          }
          ListEmptyComponent={
            <View style={styles.centerContent}>
              <Text style={styles.empty}>{I18n.t('no_notifications')}</Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', paddingHorizontal: 16 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingTop: 50,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  badge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: { backgroundColor: '#222', borderRadius: 14, padding: 16, marginBottom: 12 },
  unreadCard: { backgroundColor: '#2a2a2a', borderLeftWidth: 4, borderLeftColor: '#dc2626' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { color: '#dc2626', fontSize: 16, fontWeight: 'bold', flex: 1 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#dc2626', marginLeft: 8 },
  cardBody: { color: '#fff', fontSize: 15, marginBottom: 8 },
  cardDate: { color: '#888', fontSize: 12 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  deleteButton: {
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 14,
    marginBottom: 12,
  },
});

export default NotificationsScreen;
