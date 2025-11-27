import React, { useContext, useState } from 'react';
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

const AddEventScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [form, setForm] = useState({
    titleEn: '',
    titleAr: '',
    descriptionEn: '',
    descriptionAr: '',
    date: '',
    endDate: '',
    time: '',
    endTime: '',
    location: '',
    marshalTypes: [],
    maxMarshals: '',
  });
  const [showDate, setShowDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleType = (type) => {
    setForm(f => ({
      ...f,
      marshalTypes: f.marshalTypes.includes(type)
        ? f.marshalTypes.filter(t => t !== type)
        : [...f.marshalTypes, type]
    }));
  };

  const handleAddEvent = async () => {
    if (!form.titleEn || !form.titleAr || !form.date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('https://www.kmtsys.com/api/admin/events', {
        method: 'POST',
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
      if (!response.ok) throw new Error(data.message || 'Failed to add event');
      Alert.alert('Success', 'Event added successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'flex-start', justifyContent: I18n.locale === 'ar' ? 'flex-start' : 'flex-end', paddingTop: 56, paddingHorizontal: 16, marginBottom: 8 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 12 }}>
        <Text style={[styles.title, { textAlign: 'center' }]}>{I18n.t('add_event')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
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
        <TouchableOpacity onPress={() => setShowTime(true)} style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: '#fff' }]}> 
          <Text style={{ color: form.time ? '#fff' : '#fff', fontSize: 16 }}>
            {form.time ? form.time : (I18n.locale === 'ar' ? 'الوقت' : 'Time')}
          </Text>
        </TouchableOpacity>
        {showTime && (
          <DateTimePicker
            value={form.time ? new Date(`1970-01-01T${form.time}`) : new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            textColor="#fff"
            onChange={(e, selectedDate) => {
              setShowTime(false);
              if (selectedDate) {
                const h = selectedDate.getHours().toString().padStart(2, '0');
                const m = selectedDate.getMinutes().toString().padStart(2, '0');
                setForm(f => ({ ...f, time: `${h}:${m}` }));
              }
            }}
          />
        )}
        <TouchableOpacity onPress={() => setShowEndTime(true)} style={[styles.input, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: '#fff' }]}> 
          <Text style={{ color: form.endTime ? '#fff' : '#fff', fontSize: 16 }}>
            {form.endTime ? form.endTime : (I18n.locale === 'ar' ? 'وقت الانتهاء (اختياري)' : 'End Time (optional)')}
          </Text>
        </TouchableOpacity>
        {showEndTime && (
          <DateTimePicker
            value={form.endTime ? new Date(`1970-01-01T${form.endTime}`) : new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            textColor="#fff"
            onChange={(e, selectedDate) => {
              setShowEndTime(false);
              if (selectedDate) {
                const h = selectedDate.getHours().toString().padStart(2, '0');
                const m = selectedDate.getMinutes().toString().padStart(2, '0');
                setForm(f => ({ ...f, endTime: `${h}:${m}` }));
              }
            }}
          />
        )}
  <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الموقع' : 'Location'} value={form.location} onChangeText={v => setForm(f => ({ ...f, location: v }))} placeholderTextColor="#fff" />
        <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8, alignSelf: 'flex-start' }}>{I18n.locale === 'ar' ? 'أنواع المارشال' : 'Marshal Types'}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
          {marshalTypesList.map(type => (
            <TouchableOpacity
              key={type.key}
              style={{
                backgroundColor: form.marshalTypes.includes(type.key) ? '#b71c1c' : '#fff',
                borderRadius: 16,
                paddingHorizontal: 14,
                paddingVertical: 8,
                margin: 4,
                borderWidth: 1,
                borderColor: '#b71c1c',
              }}
              onPress={() => handleToggleType(type.key)}
            >
              <Text style={{ color: form.marshalTypes.includes(type.key) ? '#fff' : '#b71c1c', fontWeight: 'bold' }}>
                {I18n.locale === 'ar' ? type.labelAr : type.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  <TextInput style={[styles.input, styles.inputUnified]} placeholder={I18n.locale === 'ar' ? 'الحد الأعلى للمارشال' : 'Max Marshals'} value={form.maxMarshals} onChangeText={v => setForm(f => ({ ...f, maxMarshals: v.replace(/[^0-9]/g, '') }))} placeholderTextColor="#fff" keyboardType="numeric" />
        <TouchableOpacity style={styles.button} onPress={handleAddEvent} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{I18n.t('add')}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', maxWidth: 400, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16, textAlign: 'right' },
  inputUnified: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: '#fff',
    color: '#fff',
  },
  button: { backgroundColor: '#b71c1c', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 40, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default AddEventScreen;
