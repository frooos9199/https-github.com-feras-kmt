import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, ScrollView } from 'react-native';
import I18n from './i18n';
import { useNavigation, useRoute } from '@react-navigation/native';

const API_URL = 'https://www.kmtsys.com/api/admin/events';

const EventDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params || {};
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${eventId}`);
      if (!res.ok) throw new Error('حدث خطأ في جلب بيانات الحدث');
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      setError(err.message || 'خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!res.ok) throw new Error('فشل حفظ التعديلات');
      Alert.alert(I18n.t('success') || 'تم الحفظ', I18n.t('event_updated') || 'تم تحديث الحدث بنجاح', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.message || 'خطأ غير متوقع');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (error) return <Text style={{ color: 'red', margin: 20 }}>{error}</Text>;
  if (!event) return null;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 16 }}>{I18n.locale === 'ar' ? 'تعديل الحدث' : 'Edit Event'}</Text>
      <Text>{I18n.locale === 'ar' ? 'اسم الحدث' : 'Event Name'}</Text>
      <TextInput
        value={event.titleAr || ''}
        onChangeText={v => setEvent({ ...event, titleAr: v })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, padding: 8 }}
      />
      <Text>{I18n.locale === 'ar' ? 'الوصف' : 'Description'}</Text>
      <TextInput
        value={event.descriptionAr || ''}
        onChangeText={v => setEvent({ ...event, descriptionAr: v })}
        style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12, padding: 8 }}
        multiline
      />
      {/* أضف المزيد من الحقول حسب الحاجة */}
      <Button title={saving ? (I18n.t('saving') || 'جاري الحفظ...') : (I18n.t('save') || 'حفظ')} onPress={handleSave} disabled={saving} />
    </ScrollView>
  );
};

export default EventDetailsScreen;
