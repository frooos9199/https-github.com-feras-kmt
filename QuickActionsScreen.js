import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const actions = [
  { key: 'manage_events', icon: 'calendar', color: '#3b82f6' },
  { key: 'attendance_requests', icon: 'document-text', color: '#f59e0b' },
  { key: 'manage_marshals', icon: 'flag', color: '#10b981' },
  { key: 'broadcast_messages', icon: 'megaphone', color: '#ec4899' },
  { key: 'backup', icon: 'cloud-upload', color: '#06b6d4' },
  { key: 'reports', icon: 'bar-chart', color: '#8b5cf6' },
  { key: 'recent_activity', icon: 'time', color: '#6b7280' },
];

const QuickActionsScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [lang, setLang] = useState(I18n.locale);
  const [refreshKey, setRefreshKey] = useState(0);

  // مراقبة تغيير اللغة
  useEffect(() => {
    const interval = setInterval(() => {
      if (I18n.locale !== lang) {
        setLang(I18n.locale);
        setRefreshKey(prev => prev + 1);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  const handleActionPress = (key) => {
    if (key === 'recent_activity') {
      navigation.navigate('RecentActivity');
    } else if (key === 'attendance_requests') {
      navigation.navigate('PendingRequests');
    } else if (key === 'manage_events') {
      navigation.navigate('ManageEvents');
    } else if (key === 'manage_marshals') {
      navigation.navigate('ManageMarshals');
    } else if (key === 'reports') {
      navigation.navigate('Reports');
    } else if (key === 'broadcast_messages') {
      navigation.navigate('BroadcastMessages');
    } else if (key === 'backup') {
      navigation.navigate('Backup');
    } else {
      navigation.navigate('PlaceholderCard', { actionKey: key });
    }
  };

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
        <View style={styles.headerRow}></View>
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>{I18n.t('quick_actions')}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.actionsGrid}>
          {actions.map(action => (
            <TouchableOpacity key={action.key} style={styles.actionCard} onPress={() => handleActionPress(action.key)}>
              <Ionicons name={action.icon} size={36} color={action.color || '#fff'} style={{ marginBottom: 10 }} />
              <Text style={styles.actionLabel}>{I18n.t(action.key)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 16,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 16,
  },
  actionCard: {
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
  actionLabel: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default QuickActionsScreen;
