import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
const eventDefaultImg = require('../assets/event-default.png');
import I18n from '../i18n';
const getEventStatus = (event) => {
  const now = new Date();
  const start = event.date ? new Date(event.date + 'T' + (event.time || '00:00')) : null;
  const end = event.endDate ? new Date(event.endDate + 'T' + (event.endTime || '23:59')) : null;
  if (end && end < now) return 'ended';
  if (start && start > now) return 'upcoming';
  if (start && (!end || (end && end >= now)) && start <= now) return 'current';
  return null;
};

const EventCard = ({ event, user, navigation }) => {
  // إصلاح التواريخ أولاً
  const extractDate = (dt) => {
    if (!dt) return '';
    return dt.split('T')[0];
  };
  const _start = event.date ? new Date(extractDate(event.date) + 'T' + (event.time || '00:00')) : null;
  const _end = event.endDate ? new Date(extractDate(event.endDate) + 'T' + (event.endTime || '23:59')) : null;
  const _now = new Date();
  let status = null;
  if (_end && _end < _now) status = 'ended';
  else if (_start && _start > _now) status = 'upcoming';
  else if (_start && (!_end || (_end && _end >= _now)) && _start <= _now) status = 'current';
  // باقي الكود يستخدم status فقط
  // Debug log
  let now = new Date();
  let start = null;
  let end = null;
  try {
    // إذا كانت date/endDate بصيغة ISO كاملة (بها وقت)، نأخذ فقط التاريخ (YYYY-MM-DD)
    const extractDate = (dt) => {
      if (!dt) return '';
      // إذا كان dt يحتوي على حرف T، نأخذ ما قبل T
      return dt.split('T')[0];
    };
    start = event.date ? new Date(extractDate(event.date) + 'T' + (event.time || '00:00')) : null;
    end = event.endDate ? new Date(extractDate(event.endDate) + 'T' + (event.endTime || '23:59')) : null;
  } catch (e) {
    // ignore
  }
  try {
    console.log('[EventCard]', {
      title: event.titleAr || event.title,
      date: event.date,
      time: event.time,
      endDate: event.endDate,
      endTime: event.endTime,
      status,
      now: now.toISOString(),
      start: (start && !isNaN(start)) ? start.toISOString() : String(start),
      end: (end && !isNaN(end)) ? end.toISOString() : String(end)
    });
  } catch (e) {
    console.log('[EventCard] Debug error:', e);
  }
  let barColor = 'transparent';
  if (status === 'ended') barColor = '#dc2626'; // أحمر
  else if (status === 'current') barColor = '#22c55e'; // أخضر
  else if (status === 'upcoming') barColor = '#f59e42'; // برتقالي

  // عداد تنازلي ديناميكي (بداية أو نهاية حسب الحالة)
  const [countdown, setCountdown] = useState('');
  const [countdownLabel, setCountdownLabel] = useState('');
  useEffect(() => {
    let target = null;
    if (status === 'upcoming') {
      target = event.date ? new Date(extractDate(event.date) + 'T' + (event.time || '00:00')) : null;
      setCountdownLabel(I18n.locale === 'ar' ? 'يبدأ بعد: ' : 'Starts in: ');
    } else if (status === 'current') {
      target = event.endDate ? new Date(extractDate(event.endDate) + 'T' + (event.endTime || '23:59')) : null;
      setCountdownLabel(I18n.locale === 'ar' ? 'ينتهي بعد: ' : 'Ends in: ');
    } else {
      setCountdown('');
      setCountdownLabel('');
      return;
    }
    if (!target || isNaN(target)) {
      setCountdown('');
      return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setCountdown('');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      let str = '';
      if (days > 0) str += days + (I18n.locale==='ar'?' يوم ':'d ');
      if (hours > 0 || days > 0) str += hours + (I18n.locale==='ar'?' ساعة ':'h ');
      if (mins > 0 || hours > 0 || days > 0) str += mins + (I18n.locale==='ar'?' دقيقة ':'m ');
      str += secs + (I18n.locale==='ar'?' ثانية':'s');
      setCountdown(str);
    }, 1000);
    return () => clearInterval(interval);
  }, [event.date, event.time, event.endDate, event.endTime, status, I18n.locale]);

  const handleEdit = () => {
    // مثال: استدعاء دالة تمرر الحدث للأعلى أو تفتح شاشة تعديل
    if (typeof event.onEdit === 'function') {
      event.onEdit(event);
      return;
    }
    // أو يمكنك التنقل لشاشة تعديل الحدث إذا كان لديك navigation
    if (typeof navigation !== 'undefined' && navigation?.navigate) {
      navigation.navigate('EditEvent', { event });
      return;
    }
    Alert.alert(I18n.locale === 'ar' ? 'تعديل الحدث' : 'Edit Event', I18n.locale === 'ar' ? 'ميزة التعديل غير مفعلة هنا.' : 'Edit feature not implemented.');
  };

  const handleDelete = () => {
    Alert.alert(
      I18n.locale === 'ar' ? 'تأكيد الحذف' : 'Delete Confirmation',
      I18n.locale === 'ar' ? 'هل أنت متأكد من حذف الحدث؟' : 'Are you sure you want to delete this event?',
      [
        { text: I18n.locale === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: I18n.locale === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => {
          if (typeof event.onDelete === 'function') {
            event.onDelete(event);
          } else {
            Alert.alert(I18n.locale === 'ar' ? 'لم يتم تنفيذ الحذف' : 'Delete not implemented');
          }
        } },
      ]
    );
  };
  return (
    <View style={styles.card}>
      {/* شريط علوي بلون العداد */}
      <View style={[styles.statusBar, { backgroundColor: barColor }]} />
      {/* شارة حالة الحدث */}
      {status && (
        <View style={
          status === 'ended' ? styles.endedBadge :
          status === 'current' ? styles.currentBadge :
          status === 'upcoming' ? styles.upcomingBadge : null
        }>
          <Text style={styles.badgeText}>
            {status === 'ended' && (I18n.locale === 'ar' ? 'انتهى' : 'Ended')}
            {status === 'current' && (I18n.locale === 'ar' ? 'جاري الآن' : 'Ongoing')}
            {status === 'upcoming' && (I18n.locale === 'ar' ? 'قادم' : 'Upcoming')}
          </Text>
        </View>
      )}
      <View style={styles.content}>
        {/* اسم الحدث */}
        <Text style={styles.title}>{event.titleAr || event.title || ''}</Text>
        {/* العداد التنازلي للبداية أو النهاية */}
        {(status === 'upcoming' || status === 'current') && countdown && (
          <View style={styles.countdownRow}>
            <Text style={[styles.countdownText, { color: barColor, fontWeight: 'bold' }]}>{countdownLabel}{countdown}</Text>
          </View>
        )}
        {/* صف البداية */}
        <View style={[styles.infoRow, { marginTop: 8 }]}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>{String(event.date).slice(0,10)}</Text>
          {event.time && <Text style={styles.infoText}>| {event.time}</Text>}
        </View>
        {/* صف الموقع وعدد المارشال */}
        <View style={styles.infoRow}>
          {event.location && <Text style={styles.infoText}>📍 {event.location}</Text>}
          {(typeof event.maxMarshals === 'number') && (
            <Text style={styles.infoText}>
              | 👥 {((event._count && typeof event._count.attendances === 'number')
                ? event._count.attendances
                : (Array.isArray(event.attendances) ? event.attendances.length : 0))}
              /{event.maxMarshals} {I18n.locale === 'ar' ? 'مارشال' : 'Marshals'}
            </Text>
          )}
        </View>
        {/* خط فاصل بلون العداد */}
        <View style={[styles.divider, { backgroundColor: barColor }]} />
        {/* صف نهاية التاريخ والوقت */}
        {event.endDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏳</Text>
            <Text style={styles.infoText}>{String(event.endDate).slice(0,10)}</Text>
            {event.endTime && <Text style={styles.infoText}>| {event.endTime}</Text>}
          </View>
        )}
        {/* خط فاصل بلون العداد */}
        <View style={[styles.divider, { backgroundColor: barColor }]} />
        {/* صف وظائف المارشال */}
        {event.marshalTypes && Array.isArray(String(event.marshalTypes).split(',')) && (
          <View style={[styles.infoRow, { flexWrap: 'wrap', justifyContent: 'center', marginBottom: 8 }]}> 
            {String(event.marshalTypes)
              .split(',')
              .map(type => type.trim())
              .filter(Boolean)
              .map((type, idx) => (
                <View key={idx} style={styles.marshalBadge}>
                  <Text style={styles.marshalBadgeIcon}>🏁</Text>
                  <Text style={styles.marshalBadgeText}>{type}</Text>
                </View>
            ))}
          </View>
        )}
        {/* أزرار الأدمن */}
        {user?.role === 'admin' && (
          <View style={styles.adminActionsRow}>
            <TouchableOpacity style={styles.editBtn} onPress={handleEdit}>
              <Text style={styles.editBtnText}>{I18n.locale === 'ar' ? 'تعديل' : 'Edit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteBtnText}>{I18n.locale === 'ar' ? 'حذف' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  adminActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  editBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 6,
    marginHorizontal: 4,
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  endedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  currentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  upcomingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f59e42',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.92)',
    borderRadius: 20,
    marginBottom: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 7,
    maxWidth: 500,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  statusBar: {
    height: 7,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: 130,
    backgroundColor: '#222',
  },
  content: {
    padding: 18,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    opacity: 0.92,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
    // gap غير مدعومة في RN
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 4,
    marginBottom: 2,
  },
  detailIcon: {
    fontSize: 15,
    marginRight: 2,
    color: '#fff',
  },
  detailText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
  // أنماط معلومات الحدث المنسقة
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    fontSize: 17,
    marginRight: 4,
  },
  infoCount: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  infoCountActive: {
    fontSize: 15,
    color: '#22c55e',
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  infoLabel: {
    fontSize: 14,
    color: '#aaa',
    marginLeft: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  marshalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.13)', // أخضر فاتح شفاف
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  marshalBadgeIcon: {
    fontSize: 15,
    marginRight: 3,
    color: '#22c55e',
  },
  marshalBadgeText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: 'bold',
  },
});

export default EventCard;
