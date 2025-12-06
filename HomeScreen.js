import './firebaseInit';
import React, { useContext, useEffect, useState, useRef } from 'react';
// import messaging from '@react-native-firebase/messaging';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Dimensions, Image, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from './UserContext';
import I18n from './i18n';
import { getEventsEndpoint, createAuthHeaders } from './apiConfig';
import { useNavigation } from '@react-navigation/native';
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
  const [notifModal, setNotifModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [lang, setLang] = useState(I18n.locale);
  // Listen for language change and force re-render
  useEffect(() => {
    const interval = setInterval(() => {
      if (I18n.locale !== lang) setLang(I18n.locale);
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  useEffect(() => {
    // جلب الفعاليات من API
    const fetchEvents = async () => {
      try {
        console.log('[HOME] Starting fetch events...');
        console.log('[HOME] User:', user ? { email: user.email, role: user.role, hasToken: !!user.token } : 'null');
        
        if (!user?.token || !user?.role) {
          console.log('[HOME] ❌ No token or role found');
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
        const data = await response.json();
        console.log('[HOME] 📦 Response data:', data);
        
        if (!response.ok) {
          console.log('[HOME] ❌ Events API error:', data.error || 'Unknown error');
          return;
        }

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
    
    fetchEvents();
  }, [user]);



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
  // الطلبات المعلقة اليوم (status === 'pending' وتاريخ اليوم)
  const pendingRequests = todayEvents.filter(e => e.status === 'pending').length;
  // الحضور اليوم (status === 'approved' وتاريخ اليوم)
  const attendanceCount = todayEvents.filter(e => e.status === 'approved').length;

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* كرت الإشعارات المنبثق */}
        <Modal
          visible={notifModal}
          animationType="fade"
          transparent
          onRequestClose={() => setNotifModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setNotifModal(false)}>
            <View style={styles.notifCardPopup}>
              <View style={styles.notifHeaderRow}>
                <Text style={styles.notifTitle}>الإشعارات</Text>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  {notifications.length > 0 && (
                    <TouchableOpacity onPress={() => setNotifications([])} style={{marginEnd:12}}>
                      <Ionicons name="trash" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setNotifModal(false)}>
                    <Ionicons name="close" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={{ maxHeight: 260 }}>
                {notifications.length === 0 ? (
                  <Text style={styles.notifEmpty}>لا توجد إشعارات بعد</Text>
                ) : (
                  notifications.map(item => (
                    <View key={item.id} style={styles.notifItemRow}>
                      <View style={[styles.notifItem,{flex:1}]}> 
                        <Ionicons name="notifications" size={20} color="#dc2626" style={{marginEnd:8}} />
                        <View style={{flex:1}}>
                          <Text style={styles.notifItemTitle}>{item.title}</Text>
                          <Text style={styles.notifItemBody}>{item.body}</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={() => setNotifications(prev => prev.filter(n => n.id !== item.id))} style={styles.notifDeleteBtn}>
                        <Ionicons name="close-circle" size={20} color="#991b1b" />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
        <View style={styles.headerBox}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.bellIcon} onPress={() => setNotifModal(true)}>
              <Ionicons name="notifications" size={28} color="#fff" />
            </TouchableOpacity>
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
            <Text style={styles.sectionTitle}>{I18n.locale === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}</Text>
            <View style={styles.badge}><Text style={styles.badgeText}>{events.length}</Text></View>
          </View>
          <FlatList
            data={events}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            renderItem={({ item }) => (
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
                <Text style={styles.eventStatus}>{item.status === 'approved' ? (I18n.locale === 'ar' ? 'مقبول' : 'Approved') : item.status}</Text>
              </View>
            )}
          />
        </View>

        <ScrollView style={{flexGrow:0}} contentContainerStyle={styles.cardsColumn} showsVerticalScrollIndicator={false}>
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
            title={I18n.locale === 'ar' ? 'الطلبات المعلقة اليوم' : 'Pending Requests Today'}
            number={pendingRequests}
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
  bellIcon: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.circle,
    width: scaleWidth(40),
    height: scaleWidth(40),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
});

export default HomeScreen;
