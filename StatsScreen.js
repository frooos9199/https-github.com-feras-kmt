
import React, { useContext, useState, useCallback, useEffect } from 'react';
import { RefreshControl } from 'react-native';
import { View, Text, StyleSheet, SafeAreaView, Image, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const appLogo = require('./assets/splash/kmt-logo.png');

const StatsScreen = () => {
  const { user } = useContext(UserContext);
  const [lang, setLang] = useState(I18n.locale);
  const switchLang = useCallback(() => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    I18n.locale = newLang;
    setLang(newLang);
  }, [lang]);
  const avatarSource = user?.avatar ? { uri: user.avatar } : require('./assets/appicon/icon.png');


  const [stats, setStats] = useState({
    totalEvents: 0,
    totalMarshals: 0,
    marshalsBySpecialty: {}, // تصنيف المارشال حسب الاختصاص
    upcomingEvents: 0,
    todayEvents: 0,
    pastEvents: 0,
    loading: true,
    error: null,
  });

  // دالة جلب الإحصائيات
  const fetchStats = async () => {
    setStats(s => ({ ...s, loading: true, error: null }));
    try {
      let url = 'https://www.kmtsys.com/api/admin/stats';
      let options = {};
      if (user?.token) {
        options.headers = { 'Authorization': `Bearer ${user.token}` };
      }
      const response = await fetch(url, options);
      const data = await response.json();
      console.log('API_STATS_DATA', data);
      if (!response.ok) throw new Error(data.error || 'API Error');
      setStats({
        totalEvents: data.totalEvents,
        totalMarshals: data.totalMarshals,
        marshalsBySpecialty: data.marshalsBySpecialty || {},
        upcomingEvents: data.upcomingEvents,
        todayEvents: data.todayEvents,
        pastEvents: data.pastEvents,
        loading: false,
        error: null,
      });
    } catch (err) {
      setStats(s => ({ ...s, loading: false, error: err.message }));
    }
  };
  useEffect(() => {
    if (user?.role === 'admin') fetchStats();
  }, [user, lang]);

  // حالة التحديث
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const statsArr = [
    { label: I18n.locale === 'ar' ? 'إجمالي الأحداث' : 'Total Events', value: stats.totalEvents, icon: 'calendar' },
    { label: I18n.locale === 'ar' ? 'إجمالي عدد المارشال' : 'Total Marshals', value: stats.totalMarshals, icon: 'people' },
    { label: I18n.locale === 'ar' ? 'الأحداث القادمة' : 'Upcoming Events', value: stats.upcomingEvents, icon: 'flag' },
    { label: I18n.locale === 'ar' ? 'أحداث اليوم' : "Today's Events", value: stats.todayEvents, icon: 'calendar-today' },
    { label: I18n.locale === 'ar' ? 'الأحداث السابقة' : 'Past Events', value: stats.pastEvents, icon: 'calendar-clock' },
  ];

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* نص تجريبي خارج كل الشروط */}
        {/* نقل الكرت التجريبي داخل ScrollView وداخل statsGrid */}
        <View style={styles.headerBox}>
          <View style={styles.headerTopRow}>
            {lang !== 'ar' && (
              <TouchableOpacity style={styles.bellIcon}>
                <Ionicons name="notifications" size={28} color="#fff" />
              </TouchableOpacity>
            )}
            <Image source={appLogo} style={styles.logo} />
            <Image source={avatarSource} style={styles.avatar} />
            {/* زر تبديل اللغة أزيل بناءً على طلب المستخدم */}
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
                  <Text style={styles.statValue}>{stat.value}</Text>
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
  langSwitch: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
