
import React, { useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';
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


const EventsScreen = () => {
  const { user } = useContext(UserContext);
  const avatarSource = user?.avatar ? { uri: user.avatar } : profilePlaceholder;
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // جلب الأحداث من API
  const fetchEvents = useCallback(async () => {
    try {
      setRefreshing(true);
      // استبدل الرابط برابط API الفعلي
      // استخدم التوكن الذي أرسله المستخدم مباشرة
      const sessionToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..LMxbc2WjAlwaz9xv.tPkCWD5sMj1_oCJrETpcOhLG_4KTgzGZKq-OkN89HATrtIaVXrsldjC7PZt_xiUPTuYZMs-f7jeosbJP3dAw_oCCv7Aq7ryfXDvar2Un0JCy1fxSV3OSHhSaHO9QukcAvvQBw1CNy-jVfzOQCHv9LKABQH2Qh5tHQHOybvhUhADgpipiJJWU9nelMSqcgNo9cZthLo4ZMLf0jbEEwAhmlgfRFqXUN4zZqyrFDLyGMF4lAOazPoQxX6N3XnZZntOVQA45fG-M42pbC4k3jdRmvqVayn_U1vc.gIaf6EfiqVr6GrdFJfVB8w";
      const response = await fetch('https://www.kmtsys.com/api/events', {
        headers: {
          'Cookie': `__Secure-next-auth.session-token=${sessionToken}`,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      let data = null;
      let status = response.status;
      try {
        data = await response.json();
      } catch (err) {
        console.log('Events API JSON error:', err);
      }
      console.log('Events API status:', status);
      console.log('Events API typeof:', typeof data);
      console.log('Events API raw:', JSON.stringify(data));
      // إذا كان هناك خاصية events داخل الكائن
      let rawEvents = [];
      if (data && Array.isArray(data.events)) {
        rawEvents = data.events;
      } else if (Array.isArray(data)) {
        rawEvents = data;
      }
      // ترتيب الأحداث: الجاري أولاً، ثم القادمة، ثم المنتهية
      const now = new Date();
      const sorted = rawEvents.slice().sort((a, b) => {
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
    } finally {
      setRefreshing(false);
    }
  }, []);

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
          <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between', paddingHorizontal: 8}}>
            <Text style={[styles.eventTitle, {textAlign: isArabic ? 'right' : 'left', color:'#fff', fontSize:22, fontWeight:'bold'}]} numberOfLines={1}>{title}</Text>
            <View style={[
              styles.statusTag,
              {
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
              }
            ]}>
              <Text style={styles.statusTagText}>{isArabic ? (barColor==='#43A047'?'قادم':barColor==='#FFA726'?'نشط':'منتهي') : barColor==='#43A047'?'Upcoming':barColor==='#FFA726'?'Ongoing':'Finished'}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={{paddingHorizontal: 4, paddingTop: 12}}>
          <Text style={[
            styles.countdown,
            {
              color: barColor,
              marginBottom: 14,
              fontSize: 32,
              fontWeight: 'bold',
              textAlign: 'center',
              letterSpacing: 1,
            },
          ]}>
            {countdown}
          </Text>
          <View style={styles.detailsContainer}>
            <View style={styles.eventDetailsRow}>
              <Ionicons name="calendar" size={20} color="#43A047" style={{ marginRight: 6 }} />
              <Text style={[styles.eventDetailText, {color:'#43A047', fontWeight:'bold'}]}>{item.date ? item.date.slice(0,10) : ''}</Text>
              <Text style={[styles.eventDetailText, {color:'#43A047'}]}>{isArabic ? '| يبدأ' : '| Start'}</Text>
              <Text style={[styles.eventDetailText, {color:'#43A047'}]}>{startTime}</Text>
            </View>
            <View style={styles.eventDetailsRow}>
              <Ionicons name="hourglass" size={20} color="#e53935" style={{ marginRight: 6 }} />
              <Text style={[styles.eventDetailText, {color:'#e53935', fontWeight:'bold'}]}>{item.endDate ? item.endDate.slice(0,10) : ''}</Text>
              <Text style={[styles.eventDetailText, {color:'#e53935'}]}>{isArabic ? '| ينتهي' : '| End'}</Text>
              <Text style={[styles.eventDetailText, {color:'#e53935'}]}>{endTime}</Text>
            </View>
            <View style={styles.eventDetailsRow}>
              <Ionicons name="pin" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.eventDetailText}>{item.location}</Text>
            </View>
            <View style={styles.eventDetailsRow}>
              <Ionicons name="people" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={[styles.eventDetailText, {color:'#43A047', fontWeight:'bold'}]}>{attendances}</Text>
              <Text style={[styles.eventDetailText, {color:'#fff'}]}>/</Text>
              <Text style={[styles.eventDetailText, {color:'#e53935', fontWeight:'bold'}]}>{maxMarshals}</Text>
              <Text style={[styles.eventDetailText, {color:'#fff'}]}>{isArabic ? 'مارشال' : 'Marshals'}</Text>
            </View>
            <View style={[styles.tagsRow, {marginTop: 12, flexWrap: 'wrap', justifyContent: isArabic ? 'flex-end' : 'flex-start'}]}> 
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

