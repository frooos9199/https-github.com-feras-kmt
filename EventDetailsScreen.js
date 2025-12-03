import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, ScrollView, SafeAreaView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import I18n from './i18n';
import { useNavigation, useRoute } from '@react-navigation/native';
import { UserContext } from './UserContext';
import { createAuthHeaders } from './apiConfig';

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useContext(UserContext);
  const { eventId } = route.params || {};
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[EVENT DETAILS] eventId:', eventId);
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user?.token) {
        throw new Error(I18n.locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      }
      
      console.log('[EVENT DETAILS] Fetching event:', eventId);
      console.log('[EVENT DETAILS] Token preview:', user.token.substring(0, 30) + '...');
      
      const url = `https://www.kmtsys.com/api/admin/events/${eventId}`;
      console.log('[EVENT DETAILS] URL:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });
      
      console.log('[EVENT DETAILS] Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'حدث خطأ في جلب بيانات الحدث');
      }
      
      const data = await res.json();
      console.log('[EVENT DETAILS] Event loaded successfully');
      setEvent(data);
    } catch (err) {
      console.error('[EVENT DETAILS] Fetch error:', err);
      setError(err.message || 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditEvent', { eventId });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEventIcon = (marshalTypes) => {
    if (!marshalTypes) return '📅';
    const types = marshalTypes.toLowerCase();
    if (types.includes('drag')) return '🏁';
    if (types.includes('drift')) return '🚗';
    if (types.includes('circuit') || types.includes('track')) return '🏎️';
    return '📅';
  };

  const getStatusColor = (status) => {
    if (status === 'cancelled') return '#dc2626';
    if (status === 'completed') return '#9ca3af';
    return '#16a34a';
  };

  const getStatusText = (status) => {
    if (status === 'cancelled') return I18n.locale === 'ar' ? 'ملغي' : 'Cancelled';
    if (status === 'completed') return I18n.locale === 'ar' ? 'مكتمل' : 'Completed';
    return I18n.locale === 'ar' ? 'نشط' : 'Active';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
            {I18n.locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="alert-circle" size={60} color="#dc2626" />
          <Text style={{ color: '#fff', fontSize: 18, marginTop: 16, textAlign: 'center', marginBottom: 24 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={fetchEvent} style={styles.retryBtn}>
            <Text style={styles.retryText}>
              {I18n.locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnError}>
            <Text style={styles.backBtnText}>
              {I18n.locale === 'ar' ? 'رجوع' : 'Back'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!event) return null;

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'تفاصيل الحدث' : 'Event Details'}
          </Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editBtn}>
            <Ionicons name="create" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Event Icon & Title */}
          <View style={styles.eventHeader}>
            <Text style={styles.eventIcon}>{getEventIcon(event.marshalTypes)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {I18n.locale === 'ar' ? event.titleAr : event.titleEn}
              </Text>
              {event.status && (
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(event.status)}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Event Details Cards */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={20} color="#dc2626" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>
                  {I18n.locale === 'ar' ? 'تاريخ البداية' : 'Start Date'}
                </Text>
                <Text style={styles.detailValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            {event.endDate && (
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={20} color="#dc2626" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.detailLabel}>
                    {I18n.locale === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                  </Text>
                  <Text style={styles.detailValue}>{formatDate(event.endDate)}</Text>
                </View>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="time" size={20} color="#dc2626" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>
                  {I18n.locale === 'ar' ? 'الوقت' : 'Time'}
                </Text>
                <Text style={styles.detailValue}>
                  {event.time}
                  {event.endTime && ` - ${event.endTime}`}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location" size={20} color="#dc2626" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>
                  {I18n.locale === 'ar' ? 'الموقع' : 'Location'}
                </Text>
                <Text style={styles.detailValue}>{event.location}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="people" size={20} color="#dc2626" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>
                  {I18n.locale === 'ar' ? 'الحد الأقصى للمارشالات' : 'Max Marshals'}
                </Text>
                <Text style={styles.detailValue}>{event.maxMarshals}</Text>
              </View>
            </View>

            {event.marshalTypes && (
              <View style={styles.detailRow}>
                <Ionicons name="flag" size={20} color="#dc2626" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.detailLabel}>
                    {I18n.locale === 'ar' ? 'أنواع المارشالات' : 'Marshal Types'}
                  </Text>
                  <View style={styles.typesContainer}>
                    {event.marshalTypes.split(',').map((type, index) => (
                      <View key={index} style={styles.typeTag}>
                        <Text style={styles.typeTagText}>{type.trim()}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Description */}
          {event.descriptionEn && (
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>
                {I18n.locale === 'ar' ? 'الوصف' : 'Description'}
              </Text>
              <Text style={styles.descriptionText}>
                {I18n.locale === 'ar' ? event.descriptionAr : event.descriptionEn}
              </Text>
            </View>
          )}

          {/* Stats */}
          {event._count && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>
                {I18n.locale === 'ar' ? 'الإحصائيات' : 'Statistics'}
              </Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={24} color="#16a34a" />
                  <Text style={styles.statNumber}>{event._count.attendances || 0}</Text>
                  <Text style={styles.statLabel}>
                    {I18n.locale === 'ar' ? 'طلبات الحضور' : 'Attendance Requests'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Edit Button */}
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.editButtonText}>
              {I18n.locale === 'ar' ? 'تعديل الحدث' : 'Edit Event'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  eventIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeTag: {
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
  },
  typeTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtnError: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailsScreen;
