import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const BroadcastMessagesScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('all'); // all, marshals, admins

  const sendBroadcast = async () => {
    if (!titleEn.trim() || !titleAr.trim() || !bodyEn.trim() || !bodyAr.trim()) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        I18n.locale === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields'
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://www.kmtsys.com/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          titleEn,
          titleAr,
          bodyEn,
          bodyAr,
          target: selectedTarget,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          I18n.locale === 'ar' ? 'نجاح' : 'Success',
          I18n.locale === 'ar' 
            ? `تم إرسال الإشعار إلى ${data.sentCount || 0} مستخدم` 
            : `Notification sent to ${data.sentCount || 0} users`,
          [
            {
              text: 'OK',
              onPress: () => {
                setTitleEn('');
                setTitleAr('');
                setBodyEn('');
                setBodyAr('');
              },
            },
          ]
        );
      } else {
        throw new Error(data.error || 'Failed to send broadcast');
      }
    } catch (error) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        error.message || (I18n.locale === 'ar' ? 'فشل إرسال الإشعار' : 'Failed to send notification')
      );
    } finally {
      setLoading(false);
    }
  };

  const TargetButton = ({ value, label, icon }) => (
    <TouchableOpacity
      style={[
        styles.targetButton,
        selectedTarget === value && styles.targetButtonActive,
      ]}
      onPress={() => setSelectedTarget(value)}
    >
      <Ionicons
        name={icon}
        size={24}
        color={selectedTarget === value ? '#fff' : 'rgba(255,255,255,0.6)'}
      />
      <Text
        style={[
          styles.targetButtonText,
          selectedTarget === value && styles.targetButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {I18n.t('admins_only') || 'Admins only'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'إرسال إشعار جماعي' : 'Broadcast Message'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Target Selection */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people" size={20} color="#fff" />
              <Text style={styles.cardTitle}>
                {I18n.locale === 'ar' ? 'المستهدفون' : 'Target Audience'}
              </Text>
            </View>

            <View style={styles.targetContainer}>
              <TargetButton
                value="all"
                label={I18n.locale === 'ar' ? 'الجميع' : 'All Users'}
                icon="people"
              />
              <TargetButton
                value="marshals"
                label={I18n.locale === 'ar' ? 'المارشالات' : 'Marshals'}
                icon="flag"
              />
              <TargetButton
                value="admins"
                label={I18n.locale === 'ar' ? 'المسؤولين' : 'Admins'}
                icon="shield-checkmark"
              />
            </View>
          </View>

          {/* English Content */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="language" size={20} color="#fff" />
              <Text style={styles.cardTitle}>English Content</Text>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={titleEn}
              onChangeText={setTitleEn}
              placeholder="Notification title in English"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={bodyEn}
              onChangeText={setBodyEn}
              placeholder="Notification message in English"
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Arabic Content */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="language" size={20} color="#fff" />
              <Text style={styles.cardTitle}>المحتوى العربي</Text>
            </View>

            <Text style={styles.label}>العنوان</Text>
            <TextInput
              style={[styles.input, { textAlign: 'right' }]}
              value={titleAr}
              onChangeText={setTitleAr}
              placeholder="عنوان الإشعار بالعربي"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={styles.label}>الرسالة</Text>
            <TextInput
              style={[styles.input, styles.textArea, { textAlign: 'right' }]}
              value={bodyAr}
              onChangeText={setBodyAr}
              placeholder="نص الإشعار بالعربي"
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendBroadcast}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.sendButtonText}>
                  {I18n.locale === 'ar' ? 'إرسال الإشعار' : 'Send Notification'}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  targetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  targetButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  targetButtonActive: {
    backgroundColor: 'rgba(183,28,28,0.6)',
    borderColor: '#b71c1c',
  },
  targetButtonText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  targetButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: '#b71c1c',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BroadcastMessagesScreen;
