import './firebaseInit';
import React, { useContext, useEffect, useState, useRef } from 'react';
// import messaging from '@react-native-firebase/messaging';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Dimensions, Image, TouchableOpacity, ScrollView, RefreshControl, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { UserContext } from './UserContext';
import I18n from './i18n';
import { getEventsEndpoint, createAuthHeaders, API_ENDPOINTS } from './apiConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { 
  COLORS, 
  FONT_SIZES, 
  SPACING, 
  ICON_SIZES, 
  BORDER_RADIUS, 
  SHADOWS,
  scaleWidth 
} from './appConfig';

const { width } = Dimensions.get('window');

const appLogo = require('./assets/splash/kmt-logo.png'); // شعار موجود فعلياً

// دالة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // إذا كان التاريخ غير صالح
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

const Card = ({ icon, iconColor, title, number, bgColor, iconType, onPress }) => (
  <TouchableOpacity 
    style={[styles.infoCard, { backgroundColor: bgColor }]} 
    onPress={onPress}
    disabled={!onPress}
  > 
    <View style={styles.iconCircle}>
      {iconType === 'Ionicons' ? (
        <Ionicons name={icon} size={28} color={iconColor} />
      ) : (
        <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      )}
    </View>
    <Text style={styles.infoLabel}>{title}</Text>
    <Text style={styles.infoNumber}>{number}</Text>
  </TouchableOpacity>
);

const HomeScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState(I18n.locale);
  // Listen for language change and force re-render
  useEffect(() => {
    const interval = setInterval(() => {
      if (I18n.locale !== lang) setLang(I18n.locale);
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  // تحديث عدد الإشعارات عند العودة للصفحة الرئيسية
  useFocusEffect(
    React.useCallback(() => {
      fetchUnreadNotifications();
    }, [user?.token])
  );

  useEffect(() => {
    // جلب الفعاليات من API
    const fetchEvents = async () => {
      try {
        console.log('[HOME] Starting fetch events...');
        console.log('[HOME] User:', user ? { email: user.email, role: user.role, hasToken: !!user.token } : 'null');
        
        if (!user?.token || !user?.role) {
          console.log('[HOME] ❌ No token or role found - skipping events fetch');
          setEvents([]); // مسح الأحداث
          return;
        }

        // الحصول على المسار الصحيح حسب دور المستخدم
        const apiUrl = getEventsEndpoint(user.role);
        console.log('[HOME] 🌐 Fetching events from:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: createAuthHeaders(user.token),
        });

        console.log('[HOME] 📊 Response status:', response.status);
        
        if (!response.ok) {
          console.log('[HOME] ❌ Events API error:', response.status);
          setEvents([]);
          return;
        }
        
        const data = await response.json();
        console.log('[HOME] 📦 Response data:', data);
        // معالجة البيانات
        const eventsData = Array.isArray(data) ? data : (data.events || []);
        
        if (eventsData.length > 0) {
          console.log('[HOME] ✅ Fetched events:', eventsData.length);
          setEvents(eventsData);
        } else {
          console.log('[HOME] ⚠️ No events found');
        }
      } catch (err) {
        console.log('[HOME] 💥 Error fetching events:', err.message);
        console.error('[HOME] Error stack:', err);
      }
    };

    // جلب الطلبات المعلقة (للأدمن فقط)
    const fetchPendingRequests = async () => {
      if (user?.role !== 'admin' || !user?.token) {
        setPendingRequestsCount(0);
        return;
      }

      try {
        console.log('[HOME] 🔄 Fetching pending requests...');
        const response = await fetch(API_ENDPOINTS.ADMIN.ATTENDANCE, {
          method: 'GET',
          headers: createAuthHeaders(user.token),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('[HOME] 📦 Attendance data:', data);
          
          // حساب الطلبات المعلقة
          const attendanceList = Array.isArray(data) ? data : (data.attendance || []);
          const pending = attendanceList.filter(a => a.status === 'pending').length;
          
          console.log('[HOME] ✅ Pending requests count:', pending);
          setPendingRequestsCount(pending);
        } else {
          console.log('[HOME] ❌ Failed to fetch attendance');
          setPendingRequestsCount(0);
        }
      } catch (err) {
        console.log('[HOME] 💥 Error fetching pending requests:', err.message);
        setPendingRequestsCount(0);
      }
    };
    
    fetchEvents();
    fetchPendingRequests();
    fetchUnreadNotifications();
  }, [user]);

  // دالة لجلب عدد الإشعارات غير المقروءة
  const fetchUnreadNotifications = async () => {
    if (!user?.token) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      console.log('[HOME] 🔔 Fetching unread notifications count...');
      const response = await fetch('https://www.kmtsys.com/api/notifications', {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      if (response.ok) {
        const data = await response.json();
        const notifications = Array.isArray(data) ? data : (data.notifications || []);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        
        console.log('[HOME] 🔔 Unread notifications:', unreadCount);
        setUnreadNotificationsCount(unreadCount);
        
        // تحديث Badge على أيقونة التطبيق (iOS فقط)
        if (Platform.OS === 'ios') {
          PushNotificationIOS.setApplicationIconBadgeNumber(unreadCount);
          console.log('[HOME] 📱 App icon badge updated (iOS):', unreadCount);
        }
      } else {
        console.log('[HOME] ❌ Failed to fetch notifications');
        setUnreadNotificationsCount(0);
        if (Platform.OS === 'ios') {
          PushNotificationIOS.setApplicationIconBadgeNumber(0);
        }
      }
    } catch (err) {
      console.log('[HOME] 💥 Error fetching notifications:', err.message);
      setUnreadNotificationsCount(0);
      if (Platform.OS === 'ios') {
        PushNotificationIOS.setApplicationIconBadgeNumber(0);
      }
    }
  };

  // دالة تحديث البيانات عند السحب للأسفل
  const onRefresh = async () => {
    setRefreshing(true);
    
    // جلب الأحداث
    const fetchEvents = async () => {
      try {
        if (!user?.token || !user?.role) {
          setEvents([]);
          return;
        }

        const apiUrl = getEventsEndpoint(user.role);
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: createAuthHeaders(user.token),
        });

        if (!response.ok) {
          setEvents([]);
          return;
        }
        
        const data = await response.json();
        const eventsData = Array.isArray(data) ? data : (data.events || []);
        
        if (eventsData.length > 0) {
          setEvents(eventsData);
        }
      } catch (err) {
        console.log('[HOME] Error refreshing events:', err.message);
      }
    };

    // جلب الطلبات المعلقة
    const fetchPendingRequests = async () => {
      if (user?.role !== 'admin' || !user?.token) {
        setPendingRequestsCount(0);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.ADMIN.ATTENDANCE, {
          method: 'GET',
          headers: createAuthHeaders(user.token),
        });

        if (response.ok) {
          const data = await response.json();
          const attendanceList = Array.isArray(data) ? data : (data.attendance || []);
          const pending = attendanceList.filter(a => a.status === 'pending').length;
          setPendingRequestsCount(pending);
        }
      } catch (err) {
        console.log('[HOME] Error refreshing pending requests:', err.message);
      }
    };

    await Promise.all([fetchEvents(), fetchPendingRequests(), fetchUnreadNotifications()]);
    setRefreshing(false);
  };


    // تم تعطيل كود الإشعارات مؤقتاً

  const displayName = user?.name || I18n.t('username');
  const displayId = user?.employeeId || '123456';
  const avatarSource = user?.avatar ? { uri: user.avatar } : require('./assets/appicon/icon.png');

  // حساب عدد الحضور اليوم من الأحداث (مثال: عدد الأحداث التي status=approved وdate=اليوم)
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  // الأحداث التي تغطي اليوم (تبدأ أو قبل اليوم وتنتهي أو بعد اليوم)
  const todayEvents = events.filter(e => {
    if (!e.date) return false;
    const start = new Date(e.date.slice(0,10));
    const end = e.endDate ? new Date(e.endDate.slice(0,10)) : start;
    return start <= today && today <= end;
  });
  const todayEventsCount = todayEvents.length;
  // الحضور اليوم (status === 'approved' وتاريخ اليوم)
  const attendanceCount = todayEvents.filter(e => e.status === 'approved').length;

  // ترتيب الأحداث: اليوم → القادمة → المنتهية
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.date || !b.date) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const aStart = new Date(a.date.slice(0, 10));
    const aEnd = a.endDate ? new Date(a.endDate.slice(0, 10)) : aStart;
    const bStart = new Date(b.date.slice(0, 10));
    const bEnd = b.endDate ? new Date(b.endDate.slice(0, 10)) : bStart;
    
    // تحديد حالة كل حدث
    const aIsToday = aStart <= today && today <= aEnd;
    const bIsToday = bStart <= today && today <= bEnd;
    const aIsFuture = aStart > today;
    const bIsFuture = bStart > today;
    const aIsPast = aEnd < today;
    const bIsPast = bEnd < today;
    
    // الأحداث الجارية اليوم أولاً
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;
    
    // ثم الأحداث القادمة
    if (aIsFuture && !bIsFuture && !bIsToday) return -1;
    if (!aIsFuture && bIsFuture && !aIsToday) return 1;
    
    // أخيراً الأحداث المنتهية
    if (aIsPast && !bIsPast) return 1;
    if (!aIsPast && bIsPast) return -1;
    
    // ترتيب داخل نفس الفئة حسب التاريخ
    if (aIsToday && bIsToday) return aStart - bStart;
    if (aIsFuture && bIsFuture) return aStart - bStart;
    if (aIsPast && bIsPast) return bStart - aStart; // الأحدث من المنتهية أولاً
    
    return 0;
  });

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerBox}>
          <View style={styles.headerTopRow}>
            <Image source={appLogo} style={styles.logo} />
            {user?.role === 'marshal' ? (
              <TouchableOpacity onPress={() => navigation.navigate('MyAttendance')}>
                <Image source={avatarSource} style={styles.avatar} />
              </TouchableOpacity>
            ) : (
              <Image source={avatarSource} style={styles.avatar} />
            )}
          </View>
          
          {/* Welcome Section - Left Aligned */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeLabel}>
              {I18n.locale === 'ar' ? '👋 مرحباً' : '👋 Welcome'}
            </Text>
            <Text style={styles.welcomeName}>{displayName}</Text>
            <View style={styles.employeeIdBadge}>
              <Ionicons name="id-card-outline" size={16} color="#fbbf24" />
              <Text style={styles.employeeIdText}>{displayId}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{I18n.locale === 'ar' ? 'الفعاليات' : 'Events'}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{sortedEvents.length}</Text></View>
          </View>
          <FlatList
            data={sortedEvents}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => {
              // تحديد حالة الحدث
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const start = new Date(item.date?.slice(0, 10));
              const end = item.endDate ? new Date(item.endDate.slice(0, 10)) : start;
              const isToday = start <= today && today <= end;
              const isFuture = start > today;
              const isPast = end < today;
              
              // اختيار اللون والحالة
              let statusColor = '#6b7280';
              let statusText = '';
              if (isToday) {
                statusColor = '#22c55e';
                statusText = I18n.locale === 'ar' ? '🟢 جاري الآن' : '🟢 Ongoing';
              } else if (isFuture) {
                statusColor = '#3b82f6';
                statusText = I18n.locale === 'ar' ? '🔵 قادم' : '🔵 Upcoming';
              } else if (isPast) {
                statusColor = '#6b7280';
                statusText = I18n.locale === 'ar' ? '⚫ منتهي' : '⚫ Ended';
              }
              
              return (
                <View style={styles.eventCard}>
                  <MaterialCommunityIcons 
                    name="calendar-star" 
                    size={ICON_SIZES.regular} 
                    color={COLORS.white} 
                    style={{marginBottom: SPACING.tiny}} 
                  />
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.eventLocation}>{item.location}</Text>
                  <Text style={[styles.eventStatus, { color: statusColor }]}>{statusText}</Text>
                </View>
              );
            }}
          />
        </View>

        <ScrollView 
          style={{flexGrow:0}} 
          contentContainerStyle={styles.cardsColumn} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#dc2626']}
              tintColor="#dc2626"
            />
          }
        >
          {/* Marshal Quick Actions */}
          {user?.role === 'marshal' && (
            <View style={styles.marshalActionsRow}>
              <TouchableOpacity 
                style={styles.marshalActionCard}
                onPress={() => navigation.navigate('Attendance')}
              >
                <Ionicons name="add-circle" size={32} color="#22c55e" />
                <Text style={styles.marshalActionText}>
                  {I18n.locale === 'ar' ? 'تسجيل حضور' : 'Register'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.marshalActionCard}
                onPress={() => navigation.navigate('MyAttendance')}
              >
                <Ionicons name="list-circle" size={32} color="#f59e0b" />
                <Text style={styles.marshalActionText}>
                  {I18n.locale === 'ar' ? 'طلباتي' : 'My Requests'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <Card
            iconType="Ionicons"
            icon="checkmark-done-circle"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'الحضور اليوم' : "Today's Attendance"}
            number={attendanceCount}
            bgColor="#14532d"
            onPress={() => user?.role === 'marshal' && navigation.navigate('MyAttendance')}
          />
          <Card
            iconType="MaterialCommunityIcons"
            icon="clock-alert"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'الطلبات المعلقة' : 'Pending Requests'}
            number={pendingRequestsCount}
            bgColor="#6d071a"
            onPress={() => {
              if (user?.role === 'admin') {
                navigation.navigate('PendingRequests');
              } else if (user?.role === 'marshal') {
                navigation.navigate('MyAttendance');
              }
            }}
          />
          <Card
            iconType="MaterialCommunityIcons"
            icon="calendar-today"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'أحداث اليوم' : "Today's Events"}
            number={todayEventsCount}
            bgColor="#1e293b"
            onPress={() => navigation.navigate('Events')}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  notifItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifDeleteBtn: {
    marginStart: 6,
    padding: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingEnd: 16,
  },
  notifCardPopup: {
    width: 320,
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    alignSelf: 'flex-end',
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  notifTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  notifEmpty: {
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#191919',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  notifItemTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  notifItemBody: {
    color: '#ccc',
    fontSize: 13,
  },
  bg: {
    flex: 1,
  },
  headerBox: {
    paddingVertical: SPACING.large,
    paddingHorizontal: SPACING.large,
    marginBottom: SPACING.tiny,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.small,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeContainer: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  welcomeLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  welcomeName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  employeeIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  employeeIdText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  logo: {
    width: 54,
    height: 54,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 0,
    marginTop: 0,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#222',
    marginLeft: 0,
    marginRight: 0,
  },
  welcome: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  subInfo: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
  },
  section: {
    marginHorizontal: 0,
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
    marginLeft: 8,
  },
  badge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#b71c1c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  eventCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.medium,
    marginRight: SPACING.small,
    minWidth: width * 0.38,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  eventTitle: {
    fontSize: FONT_SIZES.regular,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.tiny,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: FONT_SIZES.small,
    color: COLORS.white,
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.offWhite,
    textAlign: 'center',
    marginTop: 2,
  },
  eventStatus: {
    fontSize: FONT_SIZES.tiny,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: 'bold',
  },
  cardsColumn: {
    flexDirection: 'column',
    gap: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  marshalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  marshalActionCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  marshalActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  infoCard: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: 16,
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.13,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 30,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 6,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoNumber: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HomeScreen;
