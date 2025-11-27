import React, { useContext, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, I18nManager } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const appLogo = require('./assets/splash/kmt-logo.png');

const ProfileScreen = () => {
  const { user } = useContext(UserContext);
    const [lang, setLang] = useState(I18n.locale);
    const switchLang = useCallback(() => {
      const newLang = lang === 'ar' ? 'en' : 'ar';
      I18n.locale = newLang;
      setLang(newLang);
    }, [lang]);
  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.bellIcon}>
            <Ionicons name="notifications" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.langSwitch} onPress={switchLang}>
            <Text style={{ color: '#fff', fontSize: 16 }}>{I18n.t('switch_lang')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logoBox}>
          <Image source={appLogo} style={styles.logo} />
        </View>
        <View style={styles.container}>
          <View style={styles.avatarBox}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require('./assets/splash/kmt-logo.png')}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfoBox}>
            <Text style={styles.userName}>{user?.name || (lang === 'ar' ? 'اسم المستخدم' : 'User Name')}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@email.com'}</Text>
            <View style={styles.profileDetailsBox}>
              <Text style={styles.profileDetail}><Text style={styles.profileLabel}>{lang === 'ar' ? 'الرقم الوظيفي: ' : 'Employee ID: '}</Text>{user?.employeeId || '---'}</Text>
              <Text style={styles.profileDetail}><Text style={styles.profileLabel}>{lang === 'ar' ? 'الرقم المدني: ' : 'Civil ID: '}</Text>{user?.civilId || '---'}</Text>
              <Text style={styles.profileDetail}><Text style={styles.profileLabel}>{lang === 'ar' ? 'الجنسية: ' : 'Nationality: '}</Text>{user?.nationality || '---'}</Text>
              <Text style={styles.profileDetail}><Text style={styles.profileLabel}>{lang === 'ar' ? 'تاريخ الميلاد: ' : 'Birthdate: '}</Text>{user?.birthdate || '---'}</Text>
              <Text style={styles.profileDetail}><Text style={styles.profileLabel}>{lang === 'ar' ? 'رقم الهاتف: ' : 'Phone: '}</Text>{user?.phone || '---'}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  bellIcon: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  logoBox: { alignItems: 'center', marginTop: 12, marginBottom: 12 },
  logo: { width: 90, height: 90, resizeMode: 'contain' },
  container: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', marginTop: 24 },
  avatarBox: { marginBottom: 16, alignItems: 'center' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#eee',
  },
  userInfoBox: { alignItems: 'center' },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  userEmail: { fontSize: 16, color: '#fff', opacity: 0.85 },
  profileDetailsBox: { marginTop: 18, alignItems: 'flex-start' },
  profileDetail: { fontSize: 16, color: '#fff', marginBottom: 6, textAlign: 'right' },
  profileLabel: { fontWeight: 'bold', color: '#fff' },
});

export default ProfileScreen;
