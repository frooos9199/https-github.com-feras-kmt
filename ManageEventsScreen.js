import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const ManageEventsScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  const fetchEvents = async () => {
    if (!user?.token) return;
    
    try {
      setError(null);
      console.log('[MANAGE EVENTS] Fetching events...');
      
      const response = await fetch('https://www.kmtsys.com/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('[MANAGE EVENTS] Response status:', response.status);
      const data = await response.json();
      console.log('[MANAGE EVENTS] Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }
      
      // API يرجع array مباشرة وليس object
      const eventsArray = Array.isArray(data) ? data : (data.events || []);
      console.log('[MANAGE EVENTS] Events loaded:', eventsArray.length);
      setEvents(eventsArray);
    } catch (err) {
      console.error('[MANAGE EVENTS] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const getFilteredEvents = () => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.date) >= now);
      case 'past':
        return events.filter(event => new Date(event.date) < now);
      case 'cancelled':
        return events.filter(event => event.status === 'cancelled');
      default:
        return events;
    }
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
    return '#16a34a';
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={[styles.filterBtn, filter === 'all' && styles.filterBtnActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
          {I18n.locale === 'ar' ? 'الكل' : 'All'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterBtn, filter === 'upcoming' && styles.filterBtnActive]}
        onPress={() => setFilter('upcoming')}
      >
        <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
          {I18n.locale === 'ar' ? 'القادمة' : 'Upcoming'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterBtn, filter === 'past' && styles.filterBtnActive]}
        onPress={() => setFilter('past')}
      >
        <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
          {I18n.locale === 'ar' ? 'السابقة' : 'Past'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.filterBtn, filter === 'cancelled' && styles.filterBtnActive]}
        onPress={() => setFilter('cancelled')}
      >
        <Text style={[styles.filterText, filter === 'cancelled' && styles.filterTextActive]}>
          {I18n.locale === 'ar' ? 'الملغية' : 'Cancelled'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredEvents = getFilteredEvents();

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {I18n.locale === 'ar' ? 'للمسؤولين فقط' : 'Admins only'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'إدارة الأحداث' : 'Manage Events'}
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('AddEvent')} 
            style={styles.addBtn}
          >
            <Ionicons name="add-circle" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Buttons */}
        {renderFilterButtons()}

        {/* Content */}
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={60} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchEvents}>
              <Text style={styles.retryText}>
                {I18n.locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>
              {I18n.locale === 'ar' ? 'لا توجد أحداث' : 'No events found'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.eventsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
          >
            {filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.eventCard}
                onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              >
                <View style={styles.eventHeader}>
                  <Text style={styles.eventIcon}>{getEventIcon(event.marshalTypes)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>
                      {I18n.locale === 'ar' ? event.titleAr : event.titleEn}
                    </Text>
                    <Text style={styles.eventType}>
                      {event.marshalTypes || (I18n.locale === 'ar' ? 'حدث عام' : 'General Event')}
                    </Text>
                  </View>
                  {event.status === 'cancelled' && (
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                      <Text style={styles.statusText}>
                        {I18n.locale === 'ar' ? 'ملغي' : 'Cancelled'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.eventDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailText}>{formatDate(event.date)}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.detailText}>{event.location}</Text>
                  </View>

                  {event._count && (
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <Ionicons name="people" size={16} color="#16a34a" />
                        <Text style={styles.statText}>
                          {event._count.attendances || 0} {I18n.locale === 'ar' ? 'طلب' : 'requests'}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#dc2626',
  },
  filterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  eventsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  eventDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 16,
  },
});

export default ManageEventsScreen;
