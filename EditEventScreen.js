import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform, SafeAreaView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { UserContext } from './UserContext';
import { createAuthHeaders } from './apiConfig';
import I18n from './i18n';

const marshalTypesList = [
  { key: 'drag-race', labelAr: 'سباق تسارع', labelEn: 'Drag Race' },
  { key: 'motocross', labelAr: 'موتوكروس', labelEn: 'Motocross' },
  { key: 'karting', labelAr: 'كارتينج', labelEn: 'Karting' },
  { key: 'drift', labelAr: 'درفت', labelEn: 'Drift' },
  { key: 'circuit', labelAr: 'حلبة', labelEn: 'Circuit' },
  { key: 'rescue', labelAr: 'إنقاذ', labelEn: 'Rescue' },
];

const API_URL = 'https://www.kmtsys.com/api/admin/events';

const EditEventScreen = ({ navigation, route }) => {
  const { user } = useContext(UserContext);
  const { eventId } = route.params || {};
  const [form, setForm] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log('[EDIT EVENT] eventId:', eventId);
    console.log('[EDIT EVENT] user.token:', user?.token ? 'exists' : 'missing');
    fetchEvent();
  }, [eventId]);

  const formatDateFromAPI = (dateString) => {
    if (!dateString) return '';
    // Remove time part if exists (e.g., "2024-12-25T00:00:00.000Z" -> "2024-12-25")
    return dateString.split('T')[0];
  };

  const formatTimeToDisplay = (timeString) => {
    if (!timeString) return '';
    // Handle both "HH:mm:ss" and "HH:mm" formats
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  };

  const createDateFromTime = (timeString) => {
    if (!timeString) return new Date();
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours) || 0);
    date.setMinutes(parseInt(minutes) || 0);
    date.setSeconds(0);
    return date;
  };

  const formatTimeFromPicker = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchEvent = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      if (!user?.token) {
        throw new Error(I18n.locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
      }
      
      console.log('[EDIT EVENT] Fetching:', `${API_URL}/${eventId}`);
      const res = await fetch(`${API_URL}/${eventId}`, {
        method: 'GET',
        headers: createAuthHeaders(user.token),
      });
      
      console.log('[EDIT EVENT] Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('[EDIT EVENT] Event loaded successfully');
      
      setForm({
        ...data,
        date: formatDateFromAPI(data.date),
        endDate: formatDateFromAPI(data.endDate),
        marshalTypes: data.marshalTypes ? data.marshalTypes.split(',') : [],
        maxMarshals: data.maxMarshals ? String(data.maxMarshals) : '',
      });
    } catch (err) {
      console.error('[EDIT EVENT] Fetch error:', err);
      setFetchError(err.message || 'حدث خطأ في جلب بيانات الحدث');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleType = (type) => {
    setForm(f => ({
      ...f,
      marshalTypes: f.marshalTypes.includes(type)
        ? f.marshalTypes.filter(t => t !== type)
        : [...f.marshalTypes, type]
    }));
  };

  const handleSave = async () => {
    if (!form.titleEn || !form.titleAr || !form.date) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields'
      );
      return;
    }
    
    if (!user?.token) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'يجب تسجيل الدخول أولاً' : 'Please login first'
      );
      return;
    }
    
    setSaving(true);
    try {
      console.log('[EDIT EVENT] Updating event...');
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: 'PATCH',
        headers: createAuthHeaders(user.token),
        body: JSON.stringify({
          ...form,
          marshalTypes: form.marshalTypes.join(','),
          maxMarshals: form.maxMarshals ? parseInt(form.maxMarshals) : 0,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || 'Failed to update event');
      }
      
      console.log('[EDIT EVENT] Event updated successfully');
      Alert.alert(
        I18n.locale === 'ar' ? 'نجح' : 'Success',
        I18n.locale === 'ar' ? 'تم تحديث الحدث بنجاح' : 'Event updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err) {
      console.error('[EDIT EVENT] Save error:', err);
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        err.message
      );
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', fontSize: 16, marginTop: 16 }}>
            {I18n.locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (fetchError) {
    return (
      <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}>
          <Ionicons name="alert-circle-outline" size={80} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 20, marginTop: 20, textAlign: 'center' }}>
            {fetchError}
          </Text>
          <TouchableOpacity 
            onPress={fetchEvent} 
            style={{ backgroundColor: '#fff', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, marginTop: 24 }}
          >
            <Text style={{ color: '#b71c1c', fontWeight: 'bold', fontSize: 16 }}>
              {I18n.locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ marginTop: 12, paddingVertical: 12, paddingHorizontal: 32 }}
          >
            <Text style={{ color: '#fff', fontSize: 16 }}>
              {I18n.locale === 'ar' ? 'رجوع' : 'Back'}
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!form) return null;

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'تعديل الحدث' : 'Edit Event'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {I18n.locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'العنوان (English)' : 'Title (English)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Event Title"
                value={form.titleEn}
                onChangeText={v => setForm(f => ({ ...f, titleEn: v }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'العنوان (العربية)' : 'Title (Arabic)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="عنوان الحدث"
                value={form.titleAr}
                onChangeText={v => setForm(f => ({ ...f, titleAr: v }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الوصف (English)' : 'Description (English)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event Description"
                value={form.descriptionEn}
                onChangeText={v => setForm(f => ({ ...f, descriptionEn: v }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الوصف (العربية)' : 'Description (Arabic)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="وصف الحدث"
                value={form.descriptionAr}
                onChangeText={v => setForm(f => ({ ...f, descriptionAr: v }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>

          {/* Date & Time Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {I18n.locale === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'تاريخ البداية' : 'Start Date'}
              </Text>
              <TouchableOpacity onPress={() => setShowDate(true)} style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text style={styles.dateText}>
                  {form.date || (I18n.locale === 'ar' ? 'اختر التاريخ' : 'Select Date')}
                </Text>
              </TouchableOpacity>
            </View>

            {showDate && (
              <DateTimePicker
                value={form.date ? new Date(form.date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#fff"
                onChange={(e, selectedDate) => {
                  setShowDate(false);
                  if (selectedDate) setForm(f => ({ ...f, date: selectedDate.toISOString().slice(0, 10) }));
                }}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'End Date (Optional)'}
              </Text>
              <TouchableOpacity onPress={() => setShowEndDate(true)} style={styles.dateButton}>
                <Ionicons name="calendar-outline" size={20} color="#fff" />
                <Text style={styles.dateText}>
                  {form.endDate || (I18n.locale === 'ar' ? 'اختر التاريخ' : 'Select Date')}
                </Text>
              </TouchableOpacity>
            </View>

            {showEndDate && (
              <DateTimePicker
                value={form.endDate ? new Date(form.endDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#fff"
                onChange={(e, selectedDate) => {
                  setShowEndDate(false);
                  if (selectedDate) setForm(f => ({ ...f, endDate: selectedDate.toISOString().slice(0, 10) }));
                }}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'وقت البداية' : 'Start Time'}
              </Text>
              <TouchableOpacity onPress={() => setShowTime(true)} style={styles.dateButton}>
                <Ionicons name="time-outline" size={20} color="#fff" />
                <Text style={styles.dateText}>
                  {form.time ? formatTimeToDisplay(form.time) : (I18n.locale === 'ar' ? 'اختر الوقت' : 'Select Time')}
                </Text>
              </TouchableOpacity>
            </View>

            {showTime && (
              <DateTimePicker
                value={createDateFromTime(form.time)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#fff"
                onChange={(e, selectedTime) => {
                  setShowTime(false);
                  if (selectedTime) setForm(f => ({ ...f, time: formatTimeFromPicker(selectedTime) }));
                }}
              />
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'وقت الانتهاء' : 'End Time'}
              </Text>
              <TouchableOpacity onPress={() => setShowEndTime(true)} style={styles.dateButton}>
                <Ionicons name="time-outline" size={20} color="#fff" />
                <Text style={styles.dateText}>
                  {form.endTime ? formatTimeToDisplay(form.endTime) : (I18n.locale === 'ar' ? 'اختر الوقت' : 'Select Time')}
                </Text>
              </TouchableOpacity>
            </View>

            {showEndTime && (
              <DateTimePicker
                value={createDateFromTime(form.endTime)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                textColor="#fff"
                onChange={(e, selectedTime) => {
                  setShowEndTime(false);
                  if (selectedTime) setForm(f => ({ ...f, endTime: formatTimeFromPicker(selectedTime) }));
                }}
              />
            )}
          </View>

          {/* Location & Capacity Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {I18n.locale === 'ar' ? 'الموقع والسعة' : 'Location & Capacity'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الموقع' : 'Location'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={I18n.locale === 'ar' ? 'أدخل الموقع' : 'Enter Location'}
                value={form.location}
                onChangeText={v => setForm(f => ({ ...f, location: v }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {I18n.locale === 'ar' ? 'الحد الأقصى للمارشال' : 'Max Marshals'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.maxMarshals}
                onChangeText={v => setForm(f => ({ ...f, maxMarshals: v.replace(/[^0-9]/g, '') }))}
                placeholderTextColor="rgba(255,255,255,0.5)"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Marshal Types Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {I18n.locale === 'ar' ? 'أنواع المارشال' : 'Marshal Types'}
            </Text>
            <View style={styles.typesContainer}>
              {marshalTypesList.map(type => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeChip,
                    form.marshalTypes.includes(type.key) && styles.typeChipActive
                  ]}
                  onPress={() => handleToggleType(type.key)}
                >
                  <Text style={[
                    styles.typeChipText,
                    form.marshalTypes.includes(type.key) && styles.typeChipTextActive
                  ]}>
                    {I18n.locale === 'ar' ? type.labelAr : type.labelEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#b71c1c" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#b71c1c" />
                <Text style={styles.saveButtonText}>
                  {I18n.locale === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  typeChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  typeChipActive: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  typeChipText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#b71c1c',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default EditEventScreen;
