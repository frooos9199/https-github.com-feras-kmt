import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const RecentActivityScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = 'https://www.kmtsys.com/api/admin/stats';
        let options = {};
        if (user?.token) {
          options.headers = { 'Authorization': `Bearer ${user.token}` };
        }
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'API Error');
        setActivities(Array.isArray(data.recentActivity) ? data.recentActivity : []);
      } catch (err) {
        setError(err.message);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>{I18n.t('admins_only') || 'Admins only'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          {/* زر تبديل اللغة أزيل بناءً على طلب المستخدم */}
        </View>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{I18n.t('recent_activity') || (I18n.locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity')}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>{error || I18n.t('error_loading_activity')}</Text>
        ) : activities.length === 0 ? (
          <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>{I18n.t('no_activity_yet') || (I18n.locale === 'ar' ? 'لا يوجد نشاط بعد' : 'No activity yet')}</Text>
        ) : (
          <ScrollView contentContainerStyle={styles.activityList}>
            {activities.map((act, idx) => (
              <View key={idx} style={styles.activityCard}>
                <Ionicons name={getStatusIcon(act.status)} size={28} color={getStatusColor(act.status)} style={{ marginBottom: 6 }} />
                <Text style={styles.activityTitle}>{act.user?.name || ''}</Text>
                <Text style={styles.activityStatus}>{renderStatus(act.status, I18n.locale)}</Text>
                <Text style={styles.activityDate}>{act.event ? (I18n.locale === 'ar' ? act.event.titleAr : act.event.titleEn) : ''}</Text>
                <Text style={styles.activityDate}>{act.registeredAt ? new Date(act.registeredAt).toLocaleString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US') : ''}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

function getStatusIcon(status) {
  if (status === 'accepted' || status === 'مقبول') return 'checkmark-circle';
  if (status === 'pending' || status === 'معلق') return 'time';
  if (status === 'rejected' || status === 'مرفوض') return 'close-circle';
  return 'information-circle';
}
function getStatusColor(status) {
  if (status === 'accepted' || status === 'مقبول') return '#16a34a';
  if (status === 'pending' || status === 'معلق') return '#f59e42';
  if (status === 'rejected' || status === 'مرفوض') return '#dc2626';
  return '#fff';
}
function renderStatus(status, lang) {
  if (status === 'accepted' || status === 'مقبول') return lang === 'ar' ? 'مقبول' : 'Accepted';
  if (status === 'pending' || status === 'معلق') return lang === 'ar' ? 'معلق' : 'Pending';
  if (status === 'rejected' || status === 'مرفوض') return lang === 'ar' ? 'مرفوض' : 'Rejected';
  return status;
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  activityList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  activityCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  activityStatus: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
  },
  activityDate: {
    fontSize: 13,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default RecentActivityScreen;
