import './firebaseInit';
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { UserContext } from './UserContext';
import { API_ENDPOINTS } from './apiConfig';
import { useNavigation } from '@react-navigation/native';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    console.log('='.repeat(50));
    console.log('[NOTIFICATIONS] 🔄 Fetching notifications...');
    console.log('[NOTIFICATIONS] 👤 User:', user ? JSON.stringify({email: user.email, role: user.role}) : 'NULL');
    console.log('[NOTIFICATIONS] 🔑 Token:', user?.token ? `${user.token.substring(0, 30)}...` : 'MISSING');
    
    if (!user?.token) {
      console.log('[NOTIFICATIONS] ❌ No token, skipping fetch');
      setLoading(false);
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
      setLoading(false);
      setRefreshing(false);
      console.log('[NOTIFICATIONS] ✔️ Fetch completed');
      console.log('='.repeat(50));
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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
        return updated;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to event if eventId exists
    if (notification.eventId) {
      navigation.navigate('EventDetails', { eventId: notification.eventId });
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, !item.isRead && styles.unreadCard]} 
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titleAr || item.titleEn}</Text>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.cardBody}>{item.messageAr || item.messageEn}</Text>
      <Text style={styles.cardDate}>
        {new Date(item.createdAt).toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#dc2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الإشعارات</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
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
            <Text style={styles.empty}>لا توجد إشعارات بعد</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 16 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
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
});

export default NotificationsScreen;
