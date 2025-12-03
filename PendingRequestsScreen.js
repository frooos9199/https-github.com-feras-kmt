// PendingRequestsScreen.js - شاشة طلبات الحضور
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import { API_ENDPOINTS, createAuthHeaders } from './apiConfig';
import I18n from './i18n';

const PendingRequestsScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      if (!user?.token) {
        console.log('[PENDING REQUESTS] No token available');
        return;
      }

      console.log('[PENDING REQUESTS] Token (first 50 chars):', user.token.substring(0, 50));
      console.log('[PENDING REQUESTS] User role:', user.role);

      const url = `${API_ENDPOINTS.ADMIN.ATTENDANCE}?status=${filter}`;
      console.log('[PENDING REQUESTS] Fetching:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      console.log('[PENDING REQUESTS] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[PENDING REQUESTS] Data received:', data.length, 'requests');
        setRequests(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json();
        console.error('[PENDING REQUESTS] Error:', errorData);
      }
    } catch (error) {
      console.error('[PENDING REQUESTS] Fetch error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleApprove = (attendanceId, requestInfo) => {
    Alert.alert(
      I18n.t('confirmApproval'),
      `${I18n.t('marshalName')}: ${requestInfo.userName}\n${I18n.t('event')}: ${I18n.locale === 'ar' ? requestInfo.eventTitleAr : requestInfo.eventTitleEn}`,
      [
        { text: I18n.t('cancel'), style: 'cancel' },
        { text: I18n.t('approve'), onPress: () => performStatusUpdate(attendanceId, 'approved') }
      ]
    );
  };

  const handleReject = (attendanceId, requestInfo) => {
    Alert.alert(
      I18n.t('confirmRejection'),
      `${I18n.t('marshalName')}: ${requestInfo.userName}\n${I18n.t('event')}: ${I18n.locale === 'ar' ? requestInfo.eventTitleAr : requestInfo.eventTitleEn}`,
      [
        { text: I18n.t('cancel'), style: 'cancel' },
        { text: I18n.t('reject'), style: 'destructive', onPress: () => performStatusUpdate(attendanceId, 'rejected') }
      ]
    );
  };

  const performStatusUpdate = async (attendanceId, newStatus) => {
    setProcessingId(attendanceId);
    try {
      if (!user?.token) {
        Alert.alert(I18n.t('error'), I18n.t('notAuthenticated'));
        return;
      }

      console.log('[PENDING REQUESTS] Updating status:', { attendanceId, newStatus });

      const response = await fetch(API_ENDPOINTS.ADMIN.ATTENDANCE, {
        method: 'PUT',
        headers: {
          ...createAuthHeaders(user.token),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceId,
          status: newStatus,
        }),
      });

      console.log('[PENDING REQUESTS] Update response:', response.status);

      if (response.ok) {
        Alert.alert(
          I18n.t('success'),
          newStatus === 'approved' ? I18n.t('requestApproved') : I18n.t('requestRejected')
        );
        fetchRequests();
      } else {
        const errorData = await response.json();
        console.error('[PENDING REQUESTS] Update error:', errorData);
        Alert.alert(I18n.t('error'), errorData.error || I18n.t('updateFailed'));
      }
    } catch (error) {
      console.error('[PENDING REQUESTS] Update exception:', error);
      Alert.alert(I18n.t('error'), I18n.t('networkError'));
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#FFA500', approved: '#22c55e', rejected: '#dc2626' };
    return colors[status] || '#999';
  };

  const getStatusText = (status) => {
    const labels = {
      pending: I18n.t('pending'),
      approved: I18n.t('approved'),
      rejected: I18n.t('rejected')
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{I18n.t('attendance_requests')}</Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>{I18n.t('loading')}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{I18n.t('attendance_requests')}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {['all', 'pending', 'approved', 'rejected'].map((filterOption) => (
            <TouchableOpacity
              key={filterOption}
              style={[styles.filterTab, filter === filterOption && styles.filterTabActive]}
              onPress={() => setFilter(filterOption)}
            >
              <Text style={[styles.filterTabText, filter === filterOption && styles.filterTabTextActive]}>
                {I18n.t(filterOption)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={80} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyTitle}>{I18n.t('noRequests')}</Text>
              <Text style={styles.emptyDesc}>{I18n.t('noRequestsForFilter')}</Text>
            </View>
          ) : (
            filteredRequests.map((item) => (
              <View key={item.id} style={styles.requestCard}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.userInfo}>
                    {item.user?.image ? (
                      <Image 
                        source={{ uri: item.user.image }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color="#fff" />
                      </View>
                    )}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{item.user?.name || 'User'}</Text>
                      <Text style={styles.userEmail}>{item.user?.email || ''}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                  </View>
                </View>

                {/* Event Info */}
                <View style={styles.eventInfoSection}>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.infoText}>
                      {I18n.locale === 'ar' ? item.event?.titleAr : item.event?.titleEn}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="time" size={18} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.infoText}>{formatDate(item.event?.date)}</Text>
                  </View>
                  {item.event?.location && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location" size={18} color="rgba(255,255,255,0.7)" />
                      <Text style={styles.infoText}>{item.event.location}</Text>
                    </View>
                  )}
                </View>

                {/* Request Date */}
                <View style={styles.requestDateRow}>
                  <Ionicons name="paper-plane-outline" size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.requestDateText}>
                    {I18n.t('registeredAt')}: {formatDate(item.createdAt)}
                  </Text>
                </View>

                {/* Action Buttons */}
                {item.status === 'pending' && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleReject(item.id, {
                        userName: item.user?.name,
                        eventTitleEn: item.event?.titleEn,
                        eventTitleAr: item.event?.titleAr
                      })}
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>{I18n.t('reject')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApprove(item.id, {
                        userName: item.user?.name,
                        eventTitleEn: item.event?.titleEn,
                        eventTitleAr: item.event?.titleAr
                      })}
                      disabled={processingId === item.id}
                    >
                      {processingId === item.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color="#fff" />
                          <Text style={styles.actionButtonText}>{I18n.t('approve')}</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 4,
  },
  refreshButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#fff',
  },
  filterTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: '#b71c1c',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptyDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventInfoSection: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  requestDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  requestDateText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PendingRequestsScreen;
