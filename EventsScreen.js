import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, RefreshControl, Alert } from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';
import { getEventsEndpoint, createAuthHeaders } from './apiConfig';
const appLogo = require('./assets/splash/kmt-logo.png');
const profilePlaceholder = require('./assets/appicon/icon.png');

const TAG_COLORS = {
  'upcoming': '#FFA726',
  'ongoing': '#43A047',
  'finished': '#757575',
};

const TAG_LABELS = {
  'upcoming': 'Upcoming',
  'ongoing': 'Ongoing',
  'finished': 'Finished',
};


const EventsScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const avatarSource = user?.avatar ? { uri: user.avatar } : profilePlaceholder;
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // دالة حذف الحدث
  const handleDeleteEvent = async (eventId) => {
    try {
      if (!user?.token) {
        Alert.alert(I18n.t('error'), I18n.t('notAuthenticated'));
        return;
      }

      // في React Native لا يوجد window.confirm، استخدم Alert بدلاً منها
      Alert.alert(
        I18n.t('confirm_delete'),
        I18n.t('confirm_delete_message'),
        [
          { text: I18n.t('cancel'), style: 'cancel' },
          {
            text: I18n.t('delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await fetch(`https://www.kmtsys.com/api/events/${eventId}`, {
                  method: 'DELETE',
                  headers: createAuthHeaders(user.token),
                });
                
                if (response.ok) {
                  fetchEvents();
                  Alert.alert(I18n.t('success'), I18n.t('event_deleted'));
                } else {
                  Alert.alert(I18n.t('error'), I18n.t('delete_failed'));
                }
              } catch (err) {
                Alert.alert(I18n.t('error'), I18n.t('delete_error'));
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert(I18n.t('error'), I18n.t('delete_error'));
    }
  };
  
  // حساب عدد الأحداث اليوم
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  // يشمل الأحداث التي تبدأ أو تنتهي اليوم أو تغطي اليوم
  const todayEventsCount = events.filter(ev => {
    if (!ev.date || !ev.endDate) return false;
    const start = new Date(ev.date.slice(0,10));
    const end = new Date(ev.endDate.slice(0,10));
    // اليوم يقع بين البداية والنهاية (شامل)
    return start <= today && today <= end;
  }).length;

  // جلب الأحداث من API
  const fetchEvents = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // التحقق من وجود توكن ودور المستخدم
      console.log('[EVENTS] 🔄 Fetching events...');
      console.log('[EVENTS] 👤 User:', user ? {email: user.email, role: user.role, hasToken: !!user.token} : 'null');
      
      if (!user?.token) {
        console.log('[EVENTS] ❌ No token found, cannot fetch events');
        console.log('[EVENTS] 💡 User needs to login first');
        setRefreshing(false);
        setEvents([]); // مسح الأحداث القديمة
        return;
      }

      // الحصول على المسار الصحيح حسب دور المستخدم
      const apiUrl = getEventsEndpoint(user.role);
      console.log('[EVENTS] 🌐 API URL:', apiUrl);
      console.log('[EVENTS] 👔 User role:', user.role);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      console.log('[EVENTS] 📊 Response status:', response.status);

      let data = null;
      try {
        data = await response.json();
        console.log('[EVENTS] 📦 Response data:', Array.isArray(data) ? `Array(${data.length})` : typeof data);
      } catch (err) {
        console.log('[EVENTS] ❌ JSON parse error:', err);
      }

      // إذا لم يوجد رد من الـ API أو حدث خطأ، استخدم بيانات فارغة
      if (!data || data.error || !response.ok) {
        console.log('[EVENTS] ❌ API error or no data:', data?.error || 'Unknown error');
        setEvents([]);
        setRefreshing(false);
        return;
      }

      // معالجة البيانات
      const eventsData = Array.isArray(data) ? data : (data.events || []);
      
      // ترتيب الأحداث: 1️⃣ الحالي (Ongoing) → 2️⃣ القادم (Upcoming) → 3️⃣ المنتهي (Finished)
      const sorted = eventsData.slice().sort((a, b) => {
        if (!a.date || !b.date) return 0;
        
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        const aStart = new Date(a.date.slice(0, 10));
        const aEnd = a.endDate ? new Date(a.endDate.slice(0, 10)) : aStart;
        const bStart = new Date(b.date.slice(0, 10));
        const bEnd = b.endDate ? new Date(b.endDate.slice(0, 10)) : bStart;
        
        // تحديد حالة كل حدث
        const aIsOngoing = aStart <= now && now <= aEnd; // جاري (الحالي)
        const bIsOngoing = bStart <= now && now <= bEnd;
        const aIsUpcoming = aStart > now; // قادم
        const bIsUpcoming = bStart > now;
        const aIsFinished = aEnd < now; // منتهي
        const bIsFinished = bEnd < now;
        
        // 1️⃣ الأحداث الجارية (Ongoing) أولاً
        if (aIsOngoing && !bIsOngoing) return -1;
        if (!aIsOngoing && bIsOngoing) return 1;
        
        // 2️⃣ ثم الأحداث القادمة (Upcoming)
        if (aIsUpcoming && !bIsUpcoming && !bIsOngoing) return -1;
        if (!aIsUpcoming && bIsUpcoming && !aIsOngoing) return 1;
        
        // 3️⃣ أخيراً الأحداث المنتهية (Finished)
        if (aIsFinished && !bIsFinished) return 1;
        if (!aIsFinished && bIsFinished) return -1;
        
        // ترتيب داخل نفس الفئة حسب التاريخ
        if (aIsOngoing && bIsOngoing) return aStart - bStart; // الأقرب للبداية
        if (aIsUpcoming && bIsUpcoming) return aStart - bStart; // الأقرب للبداية
        if (aIsFinished && bIsFinished) return bStart - aStart; // الأحدث من المنتهية أولاً
        
        return 0;
      });
      
      setEvents(sorted);
    } catch (error) {
      setEvents([]);
      console.error('Error fetching events:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  React.useEffect(() => {
    // اربط لغة التطبيق مع لغة البروفايل إذا توفرت
    if (user && user.language && I18n.locale !== user.language) {
      I18n.locale = user.language;
    }
    fetchEvents();
  }, [fetchEvents, user]);

  // حساب الوقت المتبقي أو المنقضي
  const getCountdown = (start, end, status) => {
    const now = new Date();
    const target = status === 'upcoming' ? new Date(start) : new Date(end);
    let diff = Math.max(0, target - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    const mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);
    const secs = Math.floor(diff / 1000);
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  };

  // تحديد لون البطاقة حسب الحالة
  const getCardColor = (status) => {
    // خلفية الكرت سوداء مع تدرج خفيف حسب الحالة
    switch (status) {
      case 'upcoming': return ['#111', '#222'];
      case 'ongoing': return ['#111', '#222'];
      case 'finished': return ['#111', '#222'];
      default: return ['#111', '#222'];
    }
  };

  // أيقونات أنواع السباقات
  const typeIcon = (type) => {
    switch (type) {
      case 'karting': return '🏁';
      case 'drag-race': return '🏁';
      case 'circuit': return '🏁';
      case 'drift': return '🏁';
      case 'motocross': return '🏁';
      case 'rescue': return '🚑';
      default: return '🏁';
    }
  };



  // مكون بطاقة الحدث مع عد تنازلي حي
  const EventCard = ({ item }) => {
    // هل هذا الحدث يغطي اليوم الحالي؟
    const today = new Date();
    const coversToday = item.date && item.endDate && (new Date(item.date.slice(0,10)) <= today && today <= new Date(item.endDate.slice(0,10)));
    const isArabic = I18n.locale === 'ar';
    const title = isArabic ? item.titleAr : item.titleEn;
    const desc = isArabic ? item.descriptionAr : item.descriptionEn;
    let status = 'upcoming';
    if (item.status === 'active') status = 'ongoing';
    else if (item.status === 'finished') status = 'finished';
    const cardColors = status === 'ongoing' ? ['#14532d', '#1e293b'] : status === 'upcoming' ? ['#b71c1c', '#222'] : ['#333', '#757575'];
    const types = item.marshalTypes ? item.marshalTypes.split(',') : [];
    const maxMarshals = item.maxMarshals || 0;
    const attendances = (item._count && item._count.attendances) || 0;
    const startDate = item.date ? new Date(item.date) : null;
    const endDate = item.endDate ? new Date(item.endDate) : null;
    const startTime = item.time || '';
    const endTime = item.endTime || '';
    const [countdown, setCountdown] = React.useState('');
    const [barColor, setBarColor] = React.useState('#43A047');
    React.useEffect(() => {
      if (!startDate || !endDate) return;
      const updateCountdown = () => {
        const now = new Date();
        let cd = '';
        let color = '#43A047';
        if (now < startDate) {
          // قبل الحدث
          const diff = startDate - now;
          color = '#43A047';
          if (diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            cd = (isArabic ? 'يبدأ بعد: ' : 'Starts in: ') +
              (d > 0 ? d + (isArabic ? ' يوم ' : 'd ') : '') +
              (h > 0 ? h + (isArabic ? ' ساعة ' : 'h ') : '') +
              (m > 0 ? m + (isArabic ? ' دقيقة ' : 'm ') : '') +
              s + (isArabic ? ' ثانية' : 's');
          } else {
            cd = isArabic ? 'يبدأ الآن' : 'Starting now';
          }
        } else if (now >= startDate && now <= endDate) {
          // أثناء الحدث
          color = '#FFA726';
          const diff = endDate - now;
          if (diff > 0) {
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);
            cd = (isArabic ? 'ينتهي بعد: ' : 'Ends in: ') +
              (d > 0 ? d + (isArabic ? ' يوم ' : 'd ') : '') +
              (h > 0 ? h + (isArabic ? ' ساعة ' : 'h ') : '') +
              (m > 0 ? m + (isArabic ? ' دقيقة ' : 'm ') : '') +
              s + (isArabic ? ' ثانية' : 's');
          } else {
            cd = isArabic ? 'انتهى الآن' : 'Finished now';
          }
        } else {
          // بعد الحدث
          color = '#e53935';
          cd = isArabic ? 'انتهى الحدث' : 'Event finished';
        }
        setCountdown(cd);
        setBarColor(color);
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [item.date, item.endDate, isArabic]);
    return (
      <View style={styles.eventCard}>
        <LinearGradient colors={[barColor, barColor]} style={styles.eventCardBar}>
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between', paddingHorizontal: 8, position:'relative'}}>
            <Text style={[styles.eventTitle, {textAlign: isArabic ? 'right' : 'left', color:'#fff', fontSize:22, fontWeight:'bold'}]} numberOfLines={1}>{title}</Text>
            <View style={{
              ...styles.statusTag,
              backgroundColor: barColor,
              alignSelf: 'flex-start',
              marginLeft: isArabic ? 0 : 8,
              marginRight: isArabic ? 8 : 0,
              borderWidth: 2.5,
              borderColor: '#111',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.18,
              shadowRadius: 4,
              elevation: 4,
            }}>
              <Text style={styles.statusTagText}>{isArabic ? (barColor==='#43A047'?'قادم':barColor==='#FFA726'?'نشط':'منتهي') : barColor==='#43A047'?'Upcoming':barColor==='#FFA726'?'Ongoing':'Finished'}</Text>
            </View>
          </View>
        </LinearGradient>
        {/* العداد التنازلي */}
        <View style={{alignItems:'center', marginTop: 8, marginBottom: 2}}>
          <Text style={{color: barColor, fontWeight:'bold', fontSize: 18, letterSpacing:1}}>{countdown}</Text>
        </View>
        {/* وقت وتاريخ البداية والنهاية */}
        <View style={{marginHorizontal: 12, marginBottom: 8, marginTop: 6}}>
          {/* تاريخ ووقت البداية */}
          <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8, backgroundColor: 'rgba(67, 160, 71, 0.1)', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#43A047'}}>
            <Ionicons name="calendar" size={20} color="#43A047" style={{marginRight: 8}} />
            <View style={{flex: 1}}>
              <Text style={{color:'#43A047', fontWeight:'bold', fontSize: 13, marginBottom: 2}}>
                {isArabic ? 'البداية' : 'Start'}
              </Text>
              <Text style={{color:'#fff', fontSize: 15, fontWeight: '600'}}>
                {item.date ? new Date(item.date).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : '-'}
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Ionicons name="time" size={18} color="#43A047" />
              <Text style={{color:'#43A047', fontSize: 16, fontWeight: 'bold', marginTop: 2}}>
                {startTime || '-'}
              </Text>
            </View>
          </View>
          
          {/* تاريخ ووقت النهاية */}
          <View style={{flexDirection:'row', alignItems:'center', backgroundColor: 'rgba(229, 57, 53, 0.1)', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#e53935'}}>
            <Ionicons name="calendar-outline" size={20} color="#e53935" style={{marginRight: 8}} />
            <View style={{flex: 1}}>
              <Text style={{color:'#e53935', fontWeight:'bold', fontSize: 13, marginBottom: 2}}>
                {isArabic ? 'النهاية' : 'End'}
              </Text>
              <Text style={{color:'#fff', fontSize: 15, fontWeight: '600'}}>
                {item.endDate ? new Date(item.endDate).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : '-'}
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Ionicons name="time-outline" size={18} color="#e53935" />
              <Text style={{color:'#e53935', fontSize: 16, fontWeight: 'bold', marginTop: 2}}>
                {endTime || '-'}
              </Text>
            </View>
          </View>
        </View>
        {/* الموقع */}
        <View style={{flexDirection:'row', alignItems:'center', marginHorizontal: 12, marginBottom: 6}}>
          <Ionicons name="pin" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.eventDetailText, {fontWeight:'bold', color:'#fff', fontSize:15}]}>{item.location}</Text>
        </View>
        {/* المارشالات */}
        <View style={{flexDirection:'row', alignItems:'center', marginHorizontal: 12, marginBottom: 6}}>
          <Ionicons name="people" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={[styles.eventDetailText, {color:'#43A047', fontWeight:'bold', fontSize:15}]}>{attendances}</Text>
          <Text style={[styles.eventDetailText, {color:'#fff', fontSize:15}]}>/</Text>
          <Text style={[styles.eventDetailText, {color:'#e53935', fontWeight:'bold', fontSize:15}]}>{maxMarshals}</Text>
          <Text style={[styles.eventDetailText, {color:'#fff', fontSize:15, marginLeft:4}]}>{isArabic ? 'مارشال' : 'Marshals'}</Text>
        </View>
        {/* الأنواع */}
        <View style={[styles.tagsRow, {marginTop: 8, flexWrap: 'wrap', justifyContent: isArabic ? 'flex-end' : 'flex-start', marginHorizontal: 12, marginBottom: 6}]}> 
          {types && types.length > 0 ? types.map((type, idx) => (
            <View key={idx} style={styles.marshallTypeTag}>
              <Ionicons name="checkmark-circle" size={16} color="#43A047" style={{marginRight: 4}} />
              <Text style={styles.marshallTypeText}>{type}</Text>
            </View>
          )) : (
            <Text style={[styles.marshallTypeText, {color:'#e53935'}]}>{isArabic ? 'لا يوجد تخصصات' : 'No specialties'}</Text>
          )}
        </View>
      </View>
    );
  };

  // استخدم EventCard في renderItem
  const renderEvent = ({ item }) => <EventCard item={item} />;

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerBox}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.bellIcon}>
              <Ionicons name="notifications" size={28} color="#fff" />
            </TouchableOpacity>
            <Image source={appLogo} style={styles.logo} />
            <Image source={avatarSource} style={styles.avatar} />
          </View>
  </View>
  {/* ...existing code... */}
  <FlatList
          data={events}
          keyExtractor={(item, idx) => item.id?.toString() || idx.toString()}
          // عند السحب للأسفل يتم إعادة جلب الأحداث
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchEvents} />}
          renderItem={renderEvent}
          ListEmptyComponent={<Text style={styles.noEvents}>{I18n.t('no_events')}</Text>}
          contentContainerStyle={{ padding: 12, paddingBottom: 32 }}
        />
      </SafeAreaView>
    </LinearGradient>
  );

};

const styles = StyleSheet.create({
  headerBox: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ...existing code...
  eventCard: {
    borderRadius: 36,
    marginVertical: 28,
    minHeight: 300,
    shadowColor: '#000',
    shadowOpacity: 0.20,
    shadowRadius: 18,
    elevation: 10,
    marginHorizontal: 0,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.15)',
    backgroundColor: 'rgba(0,0,0,0.92)',
    overflow: 'hidden',
  },

  eventCardBar: {
    width: '100%',
    height: 54,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  statusTag: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginLeft: 8,
    marginTop: -8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  statusTagText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  countdown: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
    letterSpacing: 1,
  },

  detailsContainer: {
    marginTop: 2,
    marginBottom: 2,
    paddingHorizontal: 2,
    gap: 6,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 2,
  },
  eventDetailText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    marginLeft: 2,
    marginRight: 2,
    flexShrink: 1,
  },
  // ...existing code...
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  marshallTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#43A047',
    minWidth: 60,
  },
  marshallTypeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  noEvents: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EventsScreen;

