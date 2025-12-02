import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_ENDPOINTS } from './apiConfig';
import I18n from './i18n';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    phone: '',
    civilId: '',
    nationality: '',
    birthdate: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
  });
  const [loading, setLoading] = useState(false);
  const [showNationalityPicker, setShowNationalityPicker] = useState(false);

  // قائمة الجنسيات
  const nationalities = [
    { value: 'Kuwaiti', labelAr: 'كويتي', labelEn: 'Kuwaiti' },
    { value: 'Saudi', labelAr: 'سعودي', labelEn: 'Saudi' },
    { value: 'Emirati', labelAr: 'إماراتي', labelEn: 'Emirati' },
    { value: 'Bahraini', labelAr: 'بحريني', labelEn: 'Bahraini' },
    { value: 'Omani', labelAr: 'عماني', labelEn: 'Omani' },
    { value: 'Qatari', labelAr: 'قطري', labelEn: 'Qatari' },
    { value: 'Egyptian', labelAr: 'مصري', labelEn: 'Egyptian' },
    { value: 'Lebanese', labelAr: 'لبناني', labelEn: 'Lebanese' },
    { value: 'Jordanian', labelAr: 'أردني', labelEn: 'Jordanian' },
    { value: 'Syrian', labelAr: 'سوري', labelEn: 'Syrian' },
    { value: 'Palestinian', labelAr: 'فلسطيني', labelEn: 'Palestinian' },
    { value: 'Iraqi', labelAr: 'عراقي', labelEn: 'Iraqi' },
    { value: 'Yemeni', labelAr: 'يمني', labelEn: 'Yemeni' },
    { value: 'Turkish', labelAr: 'تركي', labelEn: 'Turkish' },
    { value: 'Iranian', labelAr: 'إيراني', labelEn: 'Iranian' },
    { value: 'Armenian', labelAr: 'أرميني', labelEn: 'Armenian' },
    { value: 'Afghan', labelAr: 'أفغاني', labelEn: 'Afghan' },
    { value: 'Indian', labelAr: 'هندي', labelEn: 'Indian' },
    { value: 'Pakistani', labelAr: 'باكستاني', labelEn: 'Pakistani' },
    { value: 'Bangladeshi', labelAr: 'بنغلاديشي', labelEn: 'Bangladeshi' },
    { value: 'Filipino', labelAr: 'فلبيني', labelEn: 'Filipino' },
    { value: 'Other', labelAr: 'أخرى', labelEn: 'Other' },
  ];

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    // التحقق من الحقول الإلزامية
    if (!formData.name.trim()) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name'
      );
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email'
      );
      return false;
    }

    if (!formData.employeeId.trim()) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'الرجاء إدخال رقم الموظف' : 'Please enter employee ID'
      );
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
      );
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match'
      );
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      console.log('[SIGNUP] Attempting to create account...');
      
      const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employee_number: formData.employeeId,
          phone: formData.phone || null,
          civilId: formData.civilId || null,
          nationality: formData.nationality || null,
          birthdate: formData.birthdate || null,
          role: 'marshal', // الدور الافتراضي
        }),
      });

      const data = await response.json();
      console.log('[SIGNUP] Response:', response.status, data);

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      Alert.alert(
        I18n.locale === 'ar' ? 'نجح!' : 'Success!',
        I18n.locale === 'ar' 
          ? 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول'
          : 'Account created successfully. You can now login',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      console.error('[SIGNUP] Error:', error);
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        error.message || (I18n.locale === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#dc2626', '#991b1b']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {I18n.locale === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('./kmt-logo-white.png')}
              style={styles.logo}
            />
            <Text style={styles.subtitle}>
              {I18n.locale === 'ar' ? 'نادي الكويت للسيارات والدراجات' : 'Kuwait Motor Town'}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* الاسم الكامل */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
              />
            </View>

            {/* البريد الإلكتروني */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'example@kmt.com' : 'example@kmt.com'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* رقم الموظف */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'رقم الموظف' : 'Employee ID'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'KMT001' : 'KMT001'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.employeeId}
                onChangeText={(text) => updateField('employeeId', text)}
              />
            </View>

            {/* رقم الهاتف */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? '+965 1234 5678' : '+965 1234 5678'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                keyboardType="phone-pad"
              />
            </View>

            {/* الرقم المدني */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الرقم المدني' : 'Civil ID'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'أدخل الرقم المدني' : 'Enter Civil ID'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.civilId}
                onChangeText={(text) => updateField('civilId', text)}
                keyboardType="numeric"
              />
            </View>

            {/* الجنسية */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الجنسية' : 'Nationality'}
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowNationalityPicker(!showNationalityPicker)}
              >
                <Text style={[styles.pickerButtonText, !formData.nationality && styles.placeholderText]}>
                  {formData.nationality 
                    ? (I18n.locale === 'ar' 
                        ? nationalities.find(n => n.value === formData.nationality)?.labelAr || formData.nationality
                        : nationalities.find(n => n.value === formData.nationality)?.labelEn || formData.nationality
                      )
                    : (I18n.locale === 'ar' ? 'اختر الجنسية' : 'Select Nationality')
                  }
                </Text>
                <Ionicons 
                  name={showNationalityPicker ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="rgba(255,255,255,0.7)" 
                />
              </TouchableOpacity>

              {/* قائمة الجنسيات */}
              {showNationalityPicker && (
                <ScrollView style={styles.pickerList} nestedScrollEnabled>
                  {nationalities.map((nat) => (
                    <TouchableOpacity
                      key={nat.value}
                      style={[
                        styles.pickerItem,
                        formData.nationality === nat.value && styles.pickerItemSelected
                      ]}
                      onPress={() => {
                        updateField('nationality', nat.value);
                        setShowNationalityPicker(false);
                      }}
                    >
                      <Text style={styles.pickerItemText}>
                        {I18n.locale === 'ar' ? nat.labelAr : nat.labelEn}
                      </Text>
                      {formData.nationality === nat.value && (
                        <Ionicons name="checkmark" size={20} color="#22c55e" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* تاريخ الميلاد */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
              </Text>
              <View style={styles.dateInputContainer}>
                <TextInput
                  style={[styles.dateInput, styles.dayInput]}
                  placeholder={I18n.locale === 'ar' ? 'يوم' : 'DD'}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.birthDay}
                  onChangeText={(text) => {
                    // السماح بالأرقام فقط وحد أقصى 2 رقم
                    const day = text.replace(/[^0-9]/g, '').slice(0, 2);
                    updateField('birthDay', day);
                    // تحديث التاريخ الكامل
                    if (day && formData.birthMonth && formData.birthYear) {
                      updateField('birthdate', `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${day.padStart(2, '0')}`);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.dateInput, styles.monthInput]}
                  placeholder={I18n.locale === 'ar' ? 'شهر' : 'MM'}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.birthMonth}
                  onChangeText={(text) => {
                    // السماح بالأرقام فقط وحد أقصى 2 رقم
                    const month = text.replace(/[^0-9]/g, '').slice(0, 2);
                    updateField('birthMonth', month);
                    // تحديث التاريخ الكامل
                    if (formData.birthDay && month && formData.birthYear) {
                      updateField('birthdate', `${formData.birthYear}-${month.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.dateSeparator}>/</Text>
                <TextInput
                  style={[styles.dateInput, styles.yearInput]}
                  placeholder={I18n.locale === 'ar' ? 'سنة' : 'YYYY'}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.birthYear}
                  onChangeText={(text) => {
                    // السماح بالأرقام فقط وحد أقصى 4 أرقام
                    const year = text.replace(/[^0-9]/g, '').slice(0, 4);
                    updateField('birthYear', year);
                    // تحديث التاريخ الكامل
                    if (formData.birthDay && formData.birthMonth && year) {
                      updateField('birthdate', `${year}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
              <Text style={styles.dateHint}>
                {I18n.locale === 'ar' ? 'مثال: 15 / 06 / 2000' : 'Example: 15 / 06 / 2000'}
              </Text>
            </View>

            {/* كلمة المرور */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'كلمة المرور' : 'Password'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? '6 أحرف على الأقل' : 'At least 6 characters'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
              />
            </View>

            {/* تأكيد كلمة المرور */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry
              />
            </View>

            {/* زر التسجيل */}
            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading 
                  ? (I18n.locale === 'ar' ? 'جاري التسجيل...' : 'Creating Account...') 
                  : (I18n.locale === 'ar' ? 'إنشاء حساب' : 'Create Account')
                }
              </Text>
            </TouchableOpacity>

            {/* رابط تسجيل الدخول */}
            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginLinkText}>
                {I18n.locale === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
                <Text style={styles.loginLinkBold}>
                  {I18n.locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  dayInput: {
    flex: 1,
  },
  monthInput: {
    flex: 1,
  },
  yearInput: {
    flex: 1.5,
  },
  dateSeparator: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  dateHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 6,
    fontStyle: 'italic',
  },
  signupButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
  },
  loginLinkBold: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    flex: 1,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
  },
  pickerList: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pickerItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  pickerItemText: {
    color: '#ffffff',
    fontSize: 15,
  },
});

export default SignupScreen;
