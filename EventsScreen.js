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
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
        return;
      }

      // في React Native لا يوجد window.confirm، استخدم Alert بدلاً منها
      Alert.alert(
        'تأكيد الحذف',
        'هل أنت متأكد أنك تريد حذف هذا الحدث؟ لا يمكن التراجع!',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: async () => {
              try {
                const response = await fetch(`https://www.kmtsys.com/api/events/${eventId}`, {
                  method: 'DELETE',
                  headers: createAuthHeaders(user.token),
                });
                
                if (response.ok) {
                  fetchEvents();
                  Alert.alert('نجح', 'تم حذف الحدث بنجاح');
                } else {
                  Alert.alert('خطأ', 'فشل حذف الحدث!');
                }
              } catch (err) {
                Alert.alert('خطأ', 'حدث خطأ أثناء الحذف!');
              }
            }
          }
        ]
      );
    } catch (err) {
      Alert.alert('خطأ', 'حدث خطأ أثناء الحذف!');
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
        setRefreshing(false);
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
      
      // ترتيب الأحداث: الجاري أولاً، ثم القادمة، ثم المنتهية
      const now = new Date();
      const sorted = eventsData.slice().sort((a, b) => {
        const aStart = a.date ? new Date(a.date) : new Date(0);
        const aEnd = a.endDate ? new Date(a.endDate) : new Date(0);
        const bStart = b.date ? new Date(b.date) : new Date(0);
        const bEnd = b.endDate ? new Date(b.endDate) : new Date(0);
        
        // حالة a
        let aStatus = 'finished';
        if (now < aStart) aStatus = 'upcoming';
        else if (now >= aStart && now <= aEnd) aStatus = 'ongoing';
        
        // حالة b
        let bStatus = 'finished';
        if (now < bStart) bStatus = 'upcoming';
        else if (now >= bStart && now <= bEnd) bStatus = 'ongoing';
        
        // الجاري أولاً
        if (aStatus === 'ongoing' && bStatus !== 'ongoing') return -1;
        if (bStatus === 'ongoing' && aStatus !== 'ongoing') return 1;
        
        // القادمة ثانياً حسب التاريخ
        if (aStatus === 'upcoming' && bStatus === 'upcoming') return aStart - bStart;
        if (aStatus === 'upcoming') return -1;
        if (bStatus === 'upcoming') return 1;
        
        // المنتهية حسب الأحدث
        return bEnd - aEnd;
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
        <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginHorizontal: 12, marginBottom: 8, marginTop: 2}}>
          <View style={{alignItems:'flex-start'}}>
            <Text style={{color:'#fff', fontWeight:'bold', fontSize:15, marginBottom:2}}>
              {isArabic ? 'تاريخ البداية:' : 'Start Date:'} <Text style={{color:'#43A047'}}>{item.date ? item.date.slice(0,10) : '-'}</Text>
            </Text>
            <Text style={{color:'#fff', fontWeight:'bold', fontSize:15}}>
              {isArabic ? 'وقت البداية:' : 'Start Time:'} <Text style={{color:'#43A047'}}>{startTime || '-'}</Text>
            </Text>
          </View>
          <View style={{alignItems:'flex-end'}}>
            <Text style={{color:'#fff', fontWeight:'bold', fontSize:15, marginBottom:2}}>
              {isArabic ? 'تاريخ النهاية:' : 'End Date:'} <Text style={{color:'#e53935'}}>{item.endDate ? item.endDate.slice(0,10) : '-'}</Text>
            </Text>
            <Text style={{color:'#fff', fontWeight:'bold', fontSize:15}}>
              {isArabic ? 'وقت النهاية:' : 'End Time:'} <Text style={{color:'#e53935'}}>{endTime || '-'}</Text>
            </Text>
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

