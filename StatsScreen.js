import React, { useContext, useState, useCallback, useEffect } from 'react';
import { RefreshControl } from 'react-native';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';
import { getStatsEndpoint, createAuthHeaders } from './apiConfig';

const appLogo = require('./assets/splash/kmt-logo.png');

const StatsScreen = () => {
  const { user } = useContext(UserContext);
  const isAdmin = user?.role === 'admin';
  const [lang, setLang] = useState(I18n.locale);
  const avatarSource = user?.avatar ? { uri: user.avatar } : require('./assets/appicon/icon.png');

  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMarshals: 0,
    marshalsBySpecialty: {},
    upcomingEvents: 0,
    todayEvents: 0,
    pastEvents: 0,
    pendingAttendance: 0,
    loading: true,
    error: null,
    unauthorized: false,
  });

  // دالة جلب الإحصائيات
  const fetchStats = async () => {
    setStats(s => ({ ...s, loading: true, error: null }));
    
    if (!isAdmin) {
      setStats(s => ({ ...s, unauthorized: true, loading: false, error: null }));
      return;
    }

    if (!user?.token) {
      setStats(s => ({ ...s, error: 'No authentication token', loading: false }));
      return;
    }

    try {
      const url = getStatsEndpoint(user.role);
      console.log('Fetching stats from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      const data = await response.json();
      console.log('Stats API response:', data);
      
      if (!response.ok) {
        if (data.error === 'Unauthorized') {
          setStats(s => ({ ...s, unauthorized: true, loading: false, error: null }));
          return;
        }
        throw new Error(data.error || 'Failed to fetch stats');
      }

      setStats(s => ({
        ...s,
        ...data,
        totalEvents: data.totalEvents ?? s.totalEvents,
        totalMarshals: data.totalMarshals ?? s.totalMarshals,
        marshalsBySpecialty: data.marshalsBySpecialty || s.marshalsBySpecialty,
        upcomingEvents: data.upcomingEvents ?? s.upcomingEvents,
        todayEvents: data.todayEvents ?? s.todayEvents,
        pastEvents: data.pastEvents ?? s.pastEvents,
        pendingAttendance: data.pendingAttendance ?? s.pendingAttendance,
        loading: false,
        error: null,
        unauthorized: false,
      }));
    } catch (err) {
      console.error('Stats fetch error:', err);
      setStats(s => ({ ...s, loading: false, error: err.message }));
    }
  };

  useEffect(() => {
    if (user?.token) fetchStats();
  }, [user, lang]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  // بناء مصفوفة الإحصائيات ديناميكياً من القيم القادمة من الـ API
  const statsArr = [];
  if ('totalEvents' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'إجمالي الأحداث' : 'Total Events', value: stats.totalEvents, icon: 'calendar' });
  if ('totalMarshals' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'إجمالي عدد المارشال' : 'Total Marshals', value: stats.totalMarshals, icon: 'people' });
  if ('pendingAttendance' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'الحضور المعلق' : 'Pending Attendance', value: stats.pendingAttendance, icon: 'alert-circle' });
  if ('upcomingEvents' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events', value: stats.upcomingEvents, icon: 'flag' });
  if ('todayEvents' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'أحداث اليوم' : "Today's Events", value: stats.todayEvents, icon: 'calendar-today' });
  if ('pastEvents' in stats) statsArr.push({ label: I18n.locale === 'ar' ? 'الأحداث السابقة' : 'Past Events', value: stats.pastEvents, icon: 'calendar-clock' });

  if (stats.unauthorized) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle" size={64} color="#fff" style={{ marginBottom: 18 }} />
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
            {I18n.locale === 'ar'
              ? 'لا تملك صلاحية عرض الإحصائيات. يرجى مراجعة الإدارة.'
              : 'You do not have permission to view statistics. Please contact admin.'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerBox}>
          <View style={styles.headerTopRow}>
            {lang !== 'ar' && (
              <TouchableOpacity style={styles.bellIcon}>
                <Ionicons name="notifications" size={28} color="#fff" />
              </TouchableOpacity>
            )}
            <Image source={appLogo} style={styles.logo} />
            <Image source={avatarSource} style={styles.avatar} />
          </View>
          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>{I18n.t('stats')}</Text>
          </View>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#b71c1c"]} />
          }
        >
          <View>
            <View style={styles.statsGrid}>
              {statsArr.map((stat, idx) => (
                <View key={idx} style={styles.statCard}>
                  <Ionicons name={stat.icon} size={36} color="#fff" style={{ marginBottom: 10 }} />
                  <Text style={styles.statValue}>{`${stat.value}`}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
            {stats.marshalsBySpecialty && Object.keys(stats.marshalsBySpecialty).length > 0 && (
              <View style={{marginTop:24}}>
                <Text style={{color:'#fff',fontWeight:'bold',fontSize:18,marginBottom:8,textAlign:'center'}}>
                  {I18n.locale === 'ar' ? 'تصنيف المارشال حسب الاختصاص' : 'Marshals by Specialty'}
                </Text>
                {Object.entries(stats.marshalsBySpecialty).map(([spec, count]) => (
                  <Text key={spec} style={{color:'#fff',fontSize:16,textAlign:'center',marginBottom:4}}>
                    {I18n.locale === 'ar' ? spec : spec} : {count}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    width: '47%',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default StatsScreen;