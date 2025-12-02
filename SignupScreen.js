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
  });
  const [loading, setLoading] = useState(false);

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
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'كويتي' : 'Kuwaiti'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.nationality}
                onChangeText={(text) => updateField('nationality', text)}
              />
            </View>

            {/* تاريخ الميلاد */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'تاريخ الميلاد' : 'Birth Date'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? '2000-01-01' : 'YYYY-MM-DD'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={formData.birthdate}
                onChangeText={(text) => updateField('birthdate', text)}
              />
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
});

export default SignupScreen;
