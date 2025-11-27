import './firebaseInit';
import React, { useContext, useEffect, useState, useRef } from 'react';
// import messaging from '@react-native-firebase/messaging';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Dimensions, Image, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const { width } = Dimensions.get('window');

const appLogo = require('./assets/splash/kmt-logo.png'); // شعار موجود فعلياً

const Card = ({ icon, iconColor, title, number, bgColor, iconType }) => (
  <View style={[styles.infoCard, { backgroundColor: bgColor }]}> 
    <View style={styles.iconCircle}>
      {iconType === 'Ionicons' ? (
        <Ionicons name={icon} size={28} color={iconColor} />
      ) : (
        <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
      )}
    </View>
    <Text style={styles.infoLabel}>{title}</Text>
    <Text style={styles.infoNumber}>{number}</Text>
  </View>
);

const HomeScreen = () => {
  const { user } = useContext(UserContext);
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
        const response = await fetch('https://www.kmtsys.com/api/user/events');
        const data = await response.json();
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      } catch (err) {}
    };
    fetchEvents();
  }, []);



    // تم تعطيل كود الإشعارات مؤقتاً

  const displayName = user?.name || I18n.t('username');
  const displayId = user?.employeeId || '123456';
  const avatarSource = user?.avatar ? { uri: user.avatar } : require('./assets/appicon/icon.png');

  // حساب عدد الحضور اليوم من الأحداث (مثال: عدد الأحداث التي status=approved وdate=اليوم)
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  // الأحداث التي تاريخها اليوم
  const todayEvents = events.filter(e => (e.date && e.date.startsWith(todayStr)));
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
            <Image source={avatarSource} style={styles.avatar} />
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.welcome}>{I18n.t('welcome')}, {displayName}</Text>
          </View>
          <View style={styles.headerRow}>
            <Text style={styles.subInfo}>{I18n.t('employee_id')}: {displayId}</Text>
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
                <MaterialCommunityIcons name="calendar-star" size={28} color="#fff" style={{marginBottom: 6}} />
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventDate}>{item.date}</Text>
                <Text style={styles.eventLocation}>{item.location}</Text>
                <Text style={styles.eventStatus}>{item.status === 'approved' ? (I18n.locale === 'ar' ? 'مقبول' : 'Approved') : item.status}</Text>
              </View>
            )}
          />
        </View>

        <ScrollView style={{flexGrow:0}} contentContainerStyle={styles.cardsColumn} showsVerticalScrollIndicator={false}>
          <Card
            iconType="Ionicons"
            icon="checkmark-done-circle"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'الحضور اليوم' : "Today's Attendance"}
            number={attendanceCount}
            bgColor="#14532d"
          />
          <Card
            iconType="MaterialCommunityIcons"
            icon="clock-alert"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'الطلبات المعلقة اليوم' : 'Pending Requests Today'}
            number={pendingRequests}
            bgColor="#6d071a"
          />
          <Card
            iconType="MaterialCommunityIcons"
            icon="calendar-today"
            iconColor="#fff"
            title={I18n.locale === 'ar' ? 'أحداث اليوم' : "Today's Events"}
            number={todayEventsCount}
            bgColor="#1e293b"
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
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 12,
    // alignItems: 'flex-end',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 18,
    padding: 18,
    marginRight: 12,
    minWidth: width * 0.45,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  eventDate: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  eventLocation: {
    fontSize: 13,
    color: '#fff',
    textAlign: 'center',
    marginTop: 2,
  },
  eventStatus: {
    fontSize: 13,
    color: '#b71c1c',
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
    backgroundColor: '#b71c1c',
    borderRadius: 20,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default HomeScreen;
