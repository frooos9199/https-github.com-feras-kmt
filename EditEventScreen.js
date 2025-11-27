import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { UserContext } from './UserContext';
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

  useEffect(() => {
    console.log('EditEventScreen - user.token:', user?.token);
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      console.log('Fetching event details:', `${API_URL}/${eventId}`);
      console.log('Using token:', user?.token);
      const res = await fetch(`${API_URL}/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      console.log('Response status:', res.status);
      const text = await res.text();
      console.log('Response body:', text);
      if (!res.ok) {
        setFetchError(`Status: ${res.status}\nBody: ${text}`);
        return;
      }
      const data = JSON.parse(text);
      setForm({
        ...data,
        marshalTypes: data.marshalTypes ? data.marshalTypes.split(',') : [],
        maxMarshals: data.maxMarshals ? String(data.maxMarshals) : '',
      });
    } catch (err) {
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
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...form,
          marshalTypes: form.marshalTypes.join(','),
          maxMarshals: form.maxMarshals ? parseInt(form.maxMarshals) : 0,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update event');
      Alert.alert('Success', 'Event updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

  if (fetchError) {
    return (
      <LinearGradient colors={["#1a1a1a", "#dc2626", "#991b1b"]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>{fetchError}</Text>
        <TouchableOpacity onPress={fetchEvent} style={{ backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 12 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{I18n.t('retry') || 'إعادة المحاولة'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: '#b71c1c', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32 }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{I18n.t('back') || 'رجوع'}</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  if (!form) return null;

  return (
    <LinearGradient colors={["#1a1a1a", "#dc2626", "#991b1b"]} style={{ flex: 1 }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: I18n.locale === 'ar' ? 'flex-start' : 'flex-end', paddingTop: 56, paddingHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.title, { textAlign: 'center' }]}>{I18n.t('edit_event') || 'تعديل الحدث'}</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1, paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'العنوان (English)' : 'Title (English)'} value={form.titleEn} onChangeText={v => setForm(f => ({ ...f, titleEn: v }))} placeholderTextColor="#fff" />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'العنوان (العربية)' : 'Title (Arabic)'} value={form.titleAr} onChangeText={v => setForm(f => ({ ...f, titleAr: v }))} placeholderTextColor="#fff" />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الوصف (English)' : 'Description (English)'} value={form.descriptionEn} onChangeText={v => setForm(f => ({ ...f, descriptionEn: v }))} placeholderTextColor="#fff" multiline />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الوصف (العربية)' : 'Description (Arabic)'} value={form.descriptionAr} onChangeText={v => setForm(f => ({ ...f, descriptionAr: v }))} placeholderTextColor="#fff" multiline />
        <TouchableOpacity onPress={() => setShowDate(true)} style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: '#fff' }]}> 
          <Text style={{ color: form.date ? '#fff' : '#fff', fontSize: 16 }}>
            {form.date ? form.date : (I18n.locale === 'ar' ? 'التاريخ (YYYY-MM-DD)' : 'Date (YYYY-MM-DD)')}
          </Text>
        </TouchableOpacity>
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
        <TouchableOpacity onPress={() => setShowEndDate(true)} style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: '#fff' }]}> 
          <Text style={{ color: form.endDate ? '#fff' : '#fff', fontSize: 16 }}>
            {form.endDate ? form.endDate : (I18n.locale === 'ar' ? 'تاريخ الانتهاء (اختياري)' : 'End Date (optional)')}
          </Text>
        </TouchableOpacity>
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
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الوقت (ساعة:دقيقة)' : 'Time (HH:mm)'} value={form.time} onChangeText={v => setForm(f => ({ ...f, time: v }))} placeholderTextColor="#fff" />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'وقت الانتهاء (ساعة:دقيقة)' : 'End Time (HH:mm)'} value={form.endTime} onChangeText={v => setForm(f => ({ ...f, endTime: v }))} placeholderTextColor="#fff" />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الموقع' : 'Location'} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} placeholderTextColor="#fff" />
        <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الحد الأقصى للمارشال' : 'Max Marshals'} value={form.maxMarshals} onChangeText={v => setForm(f => ({ ...f, maxMarshals: v.replace(/[^0-9]/g, '') }))} placeholderTextColor="#fff" keyboardType="numeric" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>
          {marshalTypesList.map(type => (
            <TouchableOpacity
              key={type.key}
              style={{
                backgroundColor: form.marshalTypes.includes(type.key) ? '#22c55e' : 'rgba(255,255,255,0.08)',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 6,
                margin: 4,
              }}
              onPress={() => handleToggleType(type.key)}
            >
              <Text style={{ color: form.marshalTypes.includes(type.key) ? '#fff' : '#aaa', fontWeight: 'bold' }}>
                {I18n.locale === 'ar' ? type.labelAr : type.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? (I18n.t('saving') || 'جاري الحفظ...') : (I18n.t('save') || 'حفظ')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  ...require('./AddEventScreen').default?.styles,
  saveBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 18,
    marginBottom: 24,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default EditEventScreen;
