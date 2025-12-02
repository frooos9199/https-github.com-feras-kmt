// AttendanceScreen.js - شاشة تسجيل الحضور للأحداث
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from './UserContext';
import { API_ENDPOINTS, createAuthHeaders, getEventsEndpoint } from './apiConfig';
import I18n from './i18n';

// دالة لتنسيق التاريخ
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// دالة للحصول على أيقونة نوع الحدث
const getEventIcon = (type) => {
  switch (type) {
    case 'race': return '🏁';
    case 'drift': return '🚗';
    case 'track-day': return '🏎️';
    default: return '🏁';
  }
};

const AttendanceScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingEventId, setProcessingEventId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAvailableEvents(), fetchMyAttendance()]);
    setLoading(false);
  };

  // جلب الأحداث المتاحة للتسجيل
  const fetchAvailableEvents = async () => {
    try {
      if (!user?.token || !user?.role) {
        console.log('[ATTENDANCE EVENTS] ⚠️ No token or role available');
        return;
      }

      const apiUrl = getEventsEndpoint(user.role);
      console.log('[ATTENDANCE EVENTS] 🌐 Fetching from:', apiUrl);
      console.log('[ATTENDANCE EVENTS] 🔑 Token preview:', user.token.substring(0, 30) + '...');

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      console.log('[ATTENDANCE EVENTS] 📊 Response status:', response.status);
      console.log('[ATTENDANCE EVENTS] 📊 Response OK?', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[ATTENDANCE EVENTS] 📦 Raw data received:', JSON.stringify(data, null, 2));
        console.log('[ATTENDANCE EVENTS] 📦 Data type:', typeof data);
        console.log('[ATTENDANCE EVENTS] 📦 Is Array?', Array.isArray(data));
        
        const finalData = Array.isArray(data) ? data : data.events || [];
        console.log('[ATTENDANCE EVENTS] 📋 Events count:', finalData.length);
        if (finalData.length > 0) {
          console.log('[ATTENDANCE EVENTS] 📋 Sample event:', JSON.stringify(finalData[0], null, 2));
        }
        
        // ترتيب الأحداث حسب تاريخ البداية من الأقرب للأبعد
        const sortedData = finalData.sort((a, b) => {
          const aDate = a.date ? new Date(a.date) : new Date(0);
          const bDate = b.date ? new Date(b.date) : new Date(0);
          return aDate - bDate;
        });
        
        setEvents(sortedData);
      } else {
        const errorText = await response.text();
        console.error('[ATTENDANCE EVENTS] ❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('[ATTENDANCE EVENTS] ❌ Error fetching events:', error);
      console.error('[ATTENDANCE EVENTS] ❌ Error details:', error.message);
    }
  };

  // جلب حضوري الحالي
  const fetchMyAttendance = async () => {
    try {
      if (!user?.token) {
        console.log('[ATTENDANCE] ⚠️ No token available');
        return;
      }

      console.log('[ATTENDANCE] 🌐 Fetching my attendance from:', API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE);
      console.log('[ATTENDANCE] 🔑 Token preview:', user.token.substring(0, 30) + '...');

      const response = await fetch(API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      console.log('[ATTENDANCE] 📊 Response status:', response.status);
      console.log('[ATTENDANCE] 📊 Response OK?', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('[ATTENDANCE] 📦 Raw data received:', JSON.stringify(data, null, 2));
        console.log('[ATTENDANCE] 📦 Data type:', typeof data);
        console.log('[ATTENDANCE] 📦 Is Array?', Array.isArray(data));
        
        const finalData = Array.isArray(data) ? data : data.attendance || [];
        console.log('[ATTENDANCE] 📋 Final attendance count:', finalData.length);
        if (finalData.length > 0) {
          console.log('[ATTENDANCE] 📋 Sample record:', JSON.stringify(finalData[0], null, 2));
        }
        
        setMyAttendance(finalData);
      } else {
        const errorText = await response.text();
        console.error('[ATTENDANCE] ❌ Error response:', errorText);
      }
    } catch (error) {
      console.error('[ATTENDANCE] ❌ Error fetching my attendance:', error);
      console.error('[ATTENDANCE] ❌ Error details:', error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // تسجيل الحضور لحدث
  const registerAttendance = async (eventId) => {
    if (!user?.token) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first'
      );
      return;
    }

    setProcessingEventId(eventId);

    try {
      const response = await fetch(API_ENDPOINTS.ATTENDANCE.REGISTER, {
        method: 'POST',
        headers: createAuthHeaders(user.token),
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          I18n.locale === 'ar' ? 'نجح' : 'Success',
          I18n.locale === 'ar' ? 'تم تسجيل حضورك بنجاح!' : 'Attendance registered successfully!'
        );
        await fetchData(); // تحديث القوائم
      } else {
        // استخدام الرسالة العربية إذا كانت موجودة
        let errorMessage = '';
        
        if (I18n.locale === 'ar' && data.errorAr) {
          errorMessage = data.errorAr;
        } else if (data.error) {
          // ترجمة الرسائل الشائعة
          if (data.error.includes('full') || data.error.includes('Cannot register more')) {
            errorMessage = I18n.locale === 'ar' 
              ? 'عذراً، الفعالية مكتملة. تم الوصول للعدد الأقصى من المارشالات المسجلين' 
              : 'Sorry, event is full. Maximum number of marshals reached';
          } else if (data.error.includes('Already registered')) {
            errorMessage = I18n.locale === 'ar' 
              ? 'أنت مسجل بالفعل في هذه الفعالية' 
              : 'You are already registered for this event';
          } else if (data.error.includes('ended') || data.error.includes('expired')) {
            errorMessage = I18n.locale === 'ar' 
              ? 'عذراً، انتهى وقت التسجيل لهذه الفعالية' 
              : 'Sorry, registration time has ended for this event';
          } else {
            errorMessage = data.error;
          }
        } else {
          errorMessage = I18n.locale === 'ar' ? 'فشل تسجيل الحضور' : 'Failed to register attendance';
        }

        Alert.alert(
          I18n.locale === 'ar' ? 'تعذر التسجيل' : 'Registration Failed',
          errorMessage
        );
      }
    } catch (error) {
      console.error('[ATTENDANCE] Error registering:', error);
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        error.message || (I18n.locale === 'ar' ? 'حدث خطأ في الاتصال' : 'A connection error occurred')
      );
    } finally {
      setProcessingEventId(null);
    }
  };

  // إلغاء الحضور
  const cancelAttendance = async (eventId) => {
    Alert.alert(
      I18n.locale === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancellation',
      I18n.locale === 'ar' ? 'هل تريد إلغاء حضورك لهذا الحدث؟' : 'Do you want to cancel your attendance for this event?',
      [
        { text: I18n.locale === 'ar' ? 'لا' : 'No', style: 'cancel' },
        {
          text: I18n.locale === 'ar' ? 'نعم' : 'Yes',
          style: 'destructive',
          onPress: async () => {
            setProcessingEventId(eventId);
            try {
              const response = await fetch(API_ENDPOINTS.ATTENDANCE.CANCEL, {
                method: 'DELETE',
                headers: createAuthHeaders(user.token),
                body: JSON.stringify({ eventId }),
              });

              if (response.ok) {
                Alert.alert(
                  I18n.locale === 'ar' ? 'نجح' : 'Success',
                  I18n.locale === 'ar' ? 'تم إلغاء حضورك' : 'Attendance cancelled'
                );
                await fetchData();
              } else {
                const data = await response.json();
                Alert.alert(
                  I18n.locale === 'ar' ? 'خطأ' : 'Error',
                  data.error || (I18n.locale === 'ar' ? 'فشل الإلغاء' : 'Failed to cancel')
                );
              }
            } catch (error) {
              console.error('[ATTENDANCE] Error cancelling:', error);
              Alert.alert(
                I18n.locale === 'ar' ? 'خطأ' : 'Error',
                error.message
              );
            } finally {
              setProcessingEventId(null);
            }
          },
        },
      ]
    );
  };

  // التحقق من التسجيل السابق
  const isRegistered = (eventId) => {
    return myAttendance.some(att => att.eventId === eventId);
  };

  const getRegistrationStatus = (eventId) => {
    const attendance = myAttendance.find(att => att.eventId === eventId);
    return attendance ? attendance.status : null;
  };

  const renderEventCard = ({ item }) => {
    const registered = isRegistered(item.id);
    const registrationStatus = getRegistrationStatus(item.id);
    const isProcessing = processingEventId === item.id;
    const attendanceCount = item._count?.attendances || 0;
    const isFull = attendanceCount >= item.maxMarshals;
    
    // Check if event date has passed
    const eventDate = new Date(item.date);
    const now = new Date();
    const isPastEvent = eventDate < now;
    
    // Check if event is cancelled or completed
    const isCancelled = item.status === 'cancelled';
    const isCompleted = item.status === 'completed';
    
    // Determine if registration is disabled
    const isRegistrationDisabled = isFull || isPastEvent || isCancelled || isCompleted;
    
    // Get the reason for disabled registration
    const getDisabledReason = () => {
      if (isCancelled) return I18n.locale === 'ar' ? 'الفعالية ملغاة' : 'Event Cancelled';
      if (isCompleted) return I18n.locale === 'ar' ? 'الفعالية منتهية' : 'Event Ended';
      if (isPastEvent) return I18n.locale === 'ar' ? 'انتهى وقت التسجيل' : 'Registration Closed';
      if (isFull) return I18n.locale === 'ar' ? 'الحدث مكتمل' : 'Event Full';
      return I18n.locale === 'ar' ? 'تسجيل الحضور' : 'Register Attendance';
    };

    return (
      <View style={styles.eventCard}>
        {/* Event Icon/Image */}
        <View style={styles.eventImageContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(183,28,28,0.4)']}
            style={styles.eventImageOverlay}
          />
          <Text style={styles.eventEmoji}>{getEventIcon(item.type)}</Text>
        </View>

        {/* Event Content */}
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>
            {I18n.locale === 'ar' ? item.titleAr : item.titleEn}
          </Text>
          
          <Text style={styles.eventDescription}>
            {I18n.locale === 'ar' ? item.descriptionAr : item.descriptionEn}
          </Text>

          {/* تاريخ ووقت البداية */}
          <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8, backgroundColor: 'rgba(67, 160, 71, 0.15)', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#43A047'}}>
            <Ionicons name="calendar" size={20} color="#43A047" style={{marginRight: 8}} />
            <View style={{flex: 1}}>
              <Text style={{color:'#43A047', fontWeight:'bold', fontSize: 12, marginBottom: 2}}>
                {I18n.locale === 'ar' ? 'البداية' : 'Start'}
              </Text>
              <Text style={{color:'#fff', fontSize: 14, fontWeight: '600'}}>
                {item.date ? new Date(item.date).toLocaleDateString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : '-'}
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Ionicons name="time" size={18} color="#43A047" />
              <Text style={{color:'#43A047', fontSize: 15, fontWeight: 'bold', marginTop: 2}}>
                {item.time || '-'}
              </Text>
            </View>
          </View>

          {/* تاريخ ووقت النهاية */}
          {item.endDate && item.endTime && (
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 8, backgroundColor: 'rgba(229, 57, 53, 0.15)', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: '#e53935'}}>
              <Ionicons name="calendar-outline" size={20} color="#e53935" style={{marginRight: 8}} />
              <View style={{flex: 1}}>
                <Text style={{color:'#e53935', fontWeight:'bold', fontSize: 12, marginBottom: 2}}>
                  {I18n.locale === 'ar' ? 'النهاية' : 'End'}
                </Text>
                <Text style={{color:'#fff', fontSize: 14, fontWeight: '600'}}>
                  {new Date(item.endDate).toLocaleDateString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              <View style={{alignItems: 'flex-end'}}>
                <Ionicons name="time-outline" size={18} color="#e53935" />
                <Text style={{color:'#e53935', fontSize: 15, fontWeight: 'bold', marginTop: 2}}>
                  {item.endTime}
                </Text>
              </View>
            </View>
          )}


          {/* Location */}
          <View style={styles.detailRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{item.location}</Text>
          </View>

          {/* Marshals Count */}
          <View style={styles.detailRow}>
            <Text style={styles.peopleIcon}>👥</Text>
            <Text style={[
              styles.marshalCount,
              isFull ? styles.marshalCountFull : styles.marshalCountNormal
            ]}>
              {attendanceCount} / {item.maxMarshals}
            </Text>
            {isFull && (
              <Text style={styles.fullBadge}>
                {I18n.locale === 'ar' ? 'مكتمل' : 'Full'}
              </Text>
            )}
            {isCancelled && (
              <Text style={[styles.fullBadge, { backgroundColor: '#666' }]}>
                {I18n.locale === 'ar' ? 'ملغى' : 'Cancelled'}
              </Text>
            )}
            {isCompleted && (
              <Text style={[styles.fullBadge, { backgroundColor: '#2e7d32' }]}>
                {I18n.locale === 'ar' ? 'منتهي' : 'Ended'}
              </Text>
            )}
            {isPastEvent && !isCancelled && !isCompleted && (
              <Text style={[styles.fullBadge, { backgroundColor: '#f57c00' }]}>
                {I18n.locale === 'ar' ? 'منتهي التسجيل' : 'Closed'}
              </Text>
            )}
          </View>

          {/* Registration Status or Button */}
          {registered ? (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                registrationStatus === 'approved' && styles.statusApproved,
                registrationStatus === 'pending' && styles.statusPending,
                registrationStatus === 'rejected' && styles.statusRejected,
              ]}>
                <Ionicons 
                  name={
                    registrationStatus === 'approved' ? 'checkmark-circle' :
                    registrationStatus === 'pending' ? 'time' :
                    'close-circle'
                  }
                  size={18}
                  color="#fff"
                />
                <Text style={styles.statusText}>
                  {registrationStatus === 'approved' && (I18n.locale === 'ar' ? 'مقبول' : 'Approved')}
                  {registrationStatus === 'pending' && (I18n.locale === 'ar' ? 'قيد المراجعة' : 'Pending')}
                  {registrationStatus === 'rejected' && (I18n.locale === 'ar' ? 'مرفوض' : 'Rejected')}
                </Text>
              </View>
              {registrationStatus === 'pending' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => cancelAttendance(item.id)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.cancelButtonText}>
                      {I18n.locale === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.registerButton, isRegistrationDisabled && styles.registerButtonDisabled]}
              onPress={() => registerAttendance(item.id)}
              disabled={isProcessing || isRegistrationDisabled}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons 
                    name={isRegistrationDisabled ? "close-circle-outline" : "add-circle-outline"} 
                    size={22} 
                    color="#fff" 
                  />
                  <Text style={styles.registerButtonText}>
                    {getDisabledReason()}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>
            {I18n.locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.container}>
      <SafeAreaView style={{flex: 1}}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            🏁 {I18n.locale === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {I18n.locale === 'ar' ? 'سجل حضورك في الفعاليات' : 'Register your attendance for events'}
          </Text>
        </View>

        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>
                {I18n.locale === 'ar' ? 'لا توجد فعاليات قادمة حالياً' : 'No upcoming events at the moment'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(113, 113, 122, 0.5)',
  },
  eventImageContainer: {
    height: 160,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  eventImageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  eventEmoji: {
    fontSize: 72,
    zIndex: 10,
  },
  eventContent: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    lineHeight: 22,
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateTextGreen: {
    fontSize: 15,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  dateTextRed: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
  },
  peopleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  marshalCount: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  marshalCountNormal: {
    color: '#22c55e',
  },
  marshalCountFull: {
    color: '#ef4444',
  },
  fullBadge: {
    marginLeft: 8,
    backgroundColor: '#991b1b',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusApproved: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
  },
  statusRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 16,
    gap: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#991b1b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#999',
    fontSize: 17,
    marginTop: 16,
  },
});

export default AttendanceScreen;
