import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalMarshals: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://www.kmtsys.com/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          totalEvents: data.totalEvents || 0,
          upcomingEvents: data.upcomingEvents || 0,
          totalMarshals: data.totalMarshals || 0,
          pendingRequests: data.pendingAttendance || 0,
          approvedRequests: data.approvedAttendance || 0,
          rejectedRequests: data.rejectedAttendance || 0,
        });
      }
    } catch (error) {
      console.error('[REPORTS] Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ icon, title, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {I18n.t('admins_only') || 'Admins only'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'التقارير' : 'Reports'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#fff"
            />
          }
        >
          {loading && !refreshing ? (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Events Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar" size={24} color="#fff" />
                  <Text style={styles.sectionTitle}>
                    {I18n.locale === 'ar' ? 'إحصائيات الفعاليات' : 'Events Statistics'}
                  </Text>
                </View>
                
                <StatCard
                  icon="albums"
                  title={I18n.locale === 'ar' ? 'إجمالي الفعاليات' : 'Total Events'}
                  value={stats.totalEvents}
                  color="#3b82f6"
                />
                
                <StatCard
                  icon="calendar-outline"
                  title={I18n.locale === 'ar' ? 'الفعاليات القادمة' : 'Upcoming Events'}
                  value={stats.upcomingEvents}
                  color="#10b981"
                />
              </View>

              {/* Marshals Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="people" size={24} color="#fff" />
                  <Text style={styles.sectionTitle}>
                    {I18n.locale === 'ar' ? 'إحصائيات المارشالات' : 'Marshals Statistics'}
                  </Text>
                </View>
                
                <StatCard
                  icon="flag"
                  title={I18n.locale === 'ar' ? 'إجمالي المارشالات' : 'Total Marshals'}
                  value={stats.totalMarshals}
                  color="#8b5cf6"
                />
              </View>

              {/* Attendance Requests Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text" size={24} color="#fff" />
                  <Text style={styles.sectionTitle}>
                    {I18n.locale === 'ar' ? 'إحصائيات طلبات الحضور' : 'Attendance Requests'}
                  </Text>
                </View>
                
                <StatCard
                  icon="time"
                  title={I18n.locale === 'ar' ? 'طلبات معلقة' : 'Pending Requests'}
                  value={stats.pendingRequests}
                  color="#f59e0b"
                />
                
                <StatCard
                  icon="checkmark-circle"
                  title={I18n.locale === 'ar' ? 'طلبات مقبولة' : 'Approved Requests'}
                  value={stats.approvedRequests}
                  color="#10b981"
                />
                
                <StatCard
                  icon="close-circle"
                  title={I18n.locale === 'ar' ? 'طلبات مرفوضة' : 'Rejected Requests'}
                  value={stats.rejectedRequests}
                  color="#ef4444"
                />
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});

export default ReportsScreen;
