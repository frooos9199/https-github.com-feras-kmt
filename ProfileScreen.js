import React, { useContext, useState, useCallback, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Linking, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import { UserContext } from './UserContext';
import I18n from './i18n';
import { createAuthHeaders } from './apiConfig';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const appLogo = require('./assets/splash/kmt-logo.png');

const ProfileScreen = () => {
  const { user, setUser, logout } = useContext(UserContext);
  const navigation = useNavigation();
  const [lang, setLang] = useState(I18n.locale);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const switchLang = useCallback(() => {
    const newLang = lang === 'ar' ? 'en' : 'ar';
    I18n.locale = newLang;
    setLang(newLang);
  }, [lang]);

  const handleSignOut = async () => {
    Alert.alert(
      lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out',
      lang === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to sign out?',
      [
        {
          text: lang === 'ar' ? 'إلغاء' : 'Cancel',
          style: 'cancel',
        },
        {
          text: lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[LOGOUT] 🚪 Starting complete logout...');
              
              // 1️⃣ استخدام دالة logout من UserContext (تمسح user_<IP>)
              await logout();
              console.log('[LOGOUT] ✅ UserContext logout completed');
              
              // 2️⃣ مسح **كل** مفاتيح AsyncStorage (تأكد ما في شي باقي)
              const allKeys = await AsyncStorage.getAllKeys();
              console.log('[LOGOUT] 🔍 All storage keys:', allKeys);
              await AsyncStorage.clear();
              console.log('[LOGOUT] 🗑️ Cleared all AsyncStorage');
              
              // 3️⃣ حذف بيانات Keychain (Face ID / Touch ID)
              try {
                await Keychain.resetGenericPassword();
                console.log('[LOGOUT] 🔐 Cleared Keychain');
              } catch (e) {
                console.log('[LOGOUT] ⚠️ Keychain already empty');
              }
              
              // 4️⃣ الانتقال إلى Login (إعادة تعيين كامل للـ navigation)
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              
              console.log('[LOGOUT] ✅ Logout process completed');
            } catch (error) {
              console.error('[LOGOUT] ❌ Error:', error);
              Alert.alert(
                lang === 'ar' ? 'خطأ' : 'Error',
                lang === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'An error occurred during sign out'
              );
            }
          },
        },
      ]
    );
  };

  // جلب بيانات البروفايل من API
  const fetchProfile = useCallback(async () => {
    try {
      if (!user?.token) {
        setLoading(false);
        setProfileData(null);
        return;
      }

      console.log('[PROFILE] 🔄 Fetching profile data...');
      console.log('[PROFILE] 🔑 Token exists:', !!user.token);
      console.log('[PROFILE] 👤 User email:', user.email);
      
      const response = await fetch('https://www.kmtsys.com/api/profile', {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[PROFILE] ✅ Profile data loaded:', {
          name: data.name,
          email: data.email,
          role: data.role,
          phone: data.phone, // 📱 رقم الهاتف
          bloodType: data.bloodType // 🩸 عرض فصيلة الدم
        });
        // تحويل dateOfBirth إلى birthdate للتوافق
        if (data.dateOfBirth) {
          data.birthdate = data.dateOfBirth;
        }
        setProfileData(data);
      } else {
        console.error('[PROFILE] ❌ Failed to fetch profile:', response.status);
        console.error('[PROFILE] 🔍 Response text:', await response.text());
        
        // لو التوكن منتهي، نسجل خروج
        if (response.status === 401) {
          console.log('[PROFILE] 🚪 Token expired, logging out...');
          Alert.alert(
            lang === 'ar' ? 'انتهت الجلسة' : 'Session Expired',
            lang === 'ar' ? 'يرجى تسجيل الدخول مرة أخرى' : 'Please login again',
            [
              {
                text: 'OK',
                onPress: () => handleSignOut()
              }
            ]
          );
        }
        setProfileData(null);
      }
    } catch (error) {
      console.error('[PROFILE] 💥 Error fetching profile:', error);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.token]);

  // جلب البيانات عند تغيير المستخدم أو التوكن
  useEffect(() => {
    setProfileData(null); // مسح البيانات القديمة
    setLoading(true);
    fetchProfile();
  }, [user?.email, user?.token]); // نستخدم email و token عشان يتحدث عند تغيير المستخدم

  // دمج بيانات user مع profileData
  const displayData = profileData || user || {};

  if (loading) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>
            {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.bg}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                // فتح صفحة تعديل البروفايل في المتصفح
                Linking.openURL('https://www.kmtsys.com/dashboard/profile');
              }}
            >
              <Ionicons name="create-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.langSwitch} onPress={switchLang}>
              <Ionicons name="language" size={20} color="#fff" style={{ marginRight: 6 }} />
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>
                {lang === 'ar' ? 'EN' : 'ع'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar with Glow */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow}>
                <Image
                  source={displayData?.image ? { uri: displayData.image } : (displayData?.avatar ? { uri: displayData.avatar } : appLogo)}
                  style={styles.avatar}
                />
              </View>
              {/* Status Badge */}
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
              </View>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>{displayData?.name || (lang === 'ar' ? 'اسم المستخدم' : 'User Name')}</Text>
            <Text style={styles.userEmail}>{displayData?.email || 'user@email.com'}</Text>
            
            {/* Role Badge */}
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons 
                name={displayData?.role === 'admin' ? 'shield-crown' : 'shield-account'} 
                size={18} 
                color="#fbbf24" 
              />
              <Text style={styles.roleText}>
                {displayData?.role === 'admin' ? (lang === 'ar' ? 'مدير النظام' : 'Admin') : (lang === 'ar' ? 'مارشال' : 'Marshal')}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>
              {lang === 'ar' ? '📋 المعلومات الشخصية' : '📋 Personal Information'}
            </Text>

            {/* Detail Cards */}
            <View style={styles.detailCard}>
              <View style={styles.detailIconBox}>
                <Ionicons name="id-card" size={22} color="#dc2626" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{lang === 'ar' ? 'الرقم الوظيفي' : 'Employee ID'}</Text>
                <Text style={styles.detailValue}>{displayData?.employeeId || '---'}</Text>
              </View>
            </View>
            <View style={styles.detailCard}>
              <View style={styles.detailIconBox}>
                <Ionicons name="call" size={22} color="#dc2626" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{lang === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Text>
                <Text style={styles.detailValue}>{displayData?.phone || '---'}</Text>
              </View>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailIconBox}>
                <Ionicons name="water" size={22} color="#dc2626" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{lang === 'ar' ? 'فصيلة الدم' : 'Blood Type'}</Text>
                <Text style={styles.detailValue}>
                  {displayData?.bloodType || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                </Text>
              </View>
            </View>

            {/* Marshal Types Section - Hidden */}
            {/* {displayData?.role === 'marshal' && displayData?.marshalTypes && (
              <View style={styles.detailCard}>
                <View style={styles.detailIconBox}>
                  <Ionicons name="shield-checkmark" size={22} color="#dc2626" />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>{lang === 'ar' ? 'تخصصات المارشال' : 'Marshal Types'}</Text>
                  <Text style={styles.detailValue}>
                    {displayData.marshalTypes.split(',').map(type => {
                      const typeMap = {
                        'karting': { ar: 'كارتنج 🏎️', en: 'Karting 🏎️' },
                        'motocross': { ar: 'موتوكروس 🏍️', en: 'Motocross 🏍️' },
                        'rescue': { ar: 'إنقاذ 🚑', en: 'Rescue 🚑' },
                        'circuit': { ar: 'حلبة 🏁', en: 'Circuit 🏁' },
                        'drift': { ar: 'دريفت 💨', en: 'Drift 💨' },
                        'drag-race': { ar: 'سباق الدراج 🚦', en: 'Drag Race 🚦' },
                        'pit': { ar: 'منطقة الصيانة 🛠️', en: 'Pit 🛠️' }
                      };
                      const trimmedType = type.trim();
                      return typeMap[trimmedType] ? typeMap[trimmedType][lang] : trimmedType;
                    }).join(', ')}
                  </Text>
                </View>
              </View>
            )} */}

          </View>

          {/* Sign Out Button */}
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.signOutText}>
              {lang === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
            </Text>
          </TouchableOpacity>

          {/* Logo at Bottom */}
          <View style={styles.bottomLogoBox}>
            <Image source={appLogo} style={styles.bottomLogo} />
          </View>
        </ScrollView>
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
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  bellIcon: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langSwitch: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 20,
    marginTop: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatarGlow: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(220, 38, 38, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#1a1a1a',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  roleText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Details Section
  detailsContainer: {
    paddingHorizontal: 20,
    marginTop: 12,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  detailIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Image Cards
  imageCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },

  // Sign Out Button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  signOutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Bottom Logo
  bottomLogoBox: {
    alignItems: 'center',
    paddingVertical: 24,
    opacity: 0.3,
  },
  bottomLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});

export default ProfileScreen;
