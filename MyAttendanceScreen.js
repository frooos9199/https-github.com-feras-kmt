// MyAttendanceScreen.js - شاشة عرض حضوري
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserContext } from './UserContext';
import { API_ENDPOINTS, createAuthHeaders } from './apiConfig';
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

const MyAttendanceScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        console.log('[MY ATTENDANCE] ❌ No token available');
        return;
      }

      console.log('[MY ATTENDANCE] 🌐 Fetching from:', API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE);
      console.log('[MY ATTENDANCE] 🔑 Token preview:', user.token.substring(0, 30) + '...');

      const response = await fetch(API_ENDPOINTS.ATTENDANCE.MY_ATTENDANCE, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      console.log('[MY ATTENDANCE] 📊 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[MY ATTENDANCE] 📦 Data received:', data.length, 'records');
        console.log('[MY ATTENDANCE] 📋 Sample:', data[0] || 'No data');
        setAttendance(Array.isArray(data) ? data : data.attendance || []);
      } else {
        const errorData = await response.json();
        console.error('[MY ATTENDANCE] ❌ Error response:', errorData);
      }
    } catch (error) {
      console.error('[MY ATTENDANCE] 💥 Exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyAttendance();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    if (I18n.locale === 'ar') {
      switch (status) {
        case 'approved':
          return 'مقبول';
        case 'pending':
          return 'قيد المراجعة';
        case 'rejected':
          return 'مرفوض';
        default:
          return status;
      }
    } else {
      return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderAttendanceCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const event = item.event || {};

    return (
      <View style={styles.eventCard}>
        {/* Event Icon/Image */}
        <View style={styles.eventImageContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(183,28,28,0.4)']}
            style={styles.eventImageOverlay}
          />
          <Text style={styles.eventEmoji}>{getEventIcon(event.type)}</Text>
        </View>

        {/* Event Content */}
        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>
            {I18n.locale === 'ar' ? event.titleAr : event.titleEn}
          </Text>
          
          <Text style={styles.eventDescription}>
            {I18n.locale === 'ar' ? event.descriptionAr : event.descriptionEn}
          </Text>

          {/* Start Date/Time */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.dateTextGreen}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateIcon}>🕐</Text>
              <Text style={styles.dateTextGreen}>{event.time}</Text>
            </View>
          </View>

          {/* End Date/Time */}
          {event.endDate && event.endTime && (
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>🏁</Text>
                <Text style={styles.dateTextRed}>{formatDate(event.endDate)}</Text>
              </View>
              <View style={styles.dateRow}>
                <Text style={styles.dateIcon}>⏰</Text>
                <Text style={styles.dateTextRed}>{event.endTime}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.detailRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{event.location}</Text>
          </View>

          {/* Registered Date */}
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.registeredDate}>
              {I18n.locale === 'ar' ? 'سُجل في: ' : 'Registered: '}
              {formatDate(item.createdAt || item.registeredAt)}
            </Text>
          </View>

          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            item.status === 'approved' && styles.statusApproved,
            item.status === 'pending' && styles.statusPending,
            item.status === 'rejected' && styles.statusRejected,
          ]}>
            <Ionicons 
              name={
                item.status === 'approved' ? 'checkmark-circle' :
                item.status === 'pending' ? 'time' :
                'close-circle'
              }
              size={20}
              color="#fff"
            />
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
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
            📋 {I18n.locale === 'ar' ? 'طلبات الحضور' : 'My Attendance Requests'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {I18n.locale === 'ar' ? 'شاهد حالة طلبات الحضور الخاصة بك' : 'View your attendance requests status'}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{attendance.length}</Text>
            <Text style={styles.statLabel}>
              {I18n.locale === 'ar' ? 'إجمالي' : 'Total'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10b981' }]}>
              {attendance.filter((a) => a.status === 'approved').length}
            </Text>
            <Text style={styles.statLabel}>
              {I18n.locale === 'ar' ? 'مقبول' : 'Approved'}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f59e0b' }]}>
              {attendance.filter((a) => a.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>
              {I18n.locale === 'ar' ? 'معلق' : 'Pending'}
            </Text>
          </View>
        </View>

        <FlatList
          data={attendance}
          keyExtractor={(item) => item.id}
          renderItem={renderAttendanceCard}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
          }
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={80} color="#666" />
              <Text style={styles.emptyText}>
                {I18n.locale === 'ar' ? 'لا توجد سجلات حضور' : 'No attendance records'}
              </Text>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => navigation.navigate('Attendance')}
              >
                <Text style={styles.registerButtonText}>
                  {I18n.locale === 'ar' ? 'تسجيل حضور جديد' : 'Register New Attendance'}
                </Text>
              </TouchableOpacity>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
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
  registeredDate: {
    fontSize: 14,
    color: '#22c55e',
    marginLeft: 8,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 16,
    alignSelf: 'flex-start',
    gap: 8,
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
    fontSize: 15,
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
    marginBottom: 24,
  },
  registerButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MyAttendanceScreen;
