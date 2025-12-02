import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const BackupScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const createBackup = async (type) => {
    Alert.alert(
      I18n.locale === 'ar' ? 'تأكيد' : 'Confirm',
      I18n.locale === 'ar' 
        ? `هل تريد إنشاء نسخة احتياطية ${type === 'full' ? 'كاملة' : 'للبيانات فقط'}؟`
        : `Do you want to create a ${type === 'full' ? 'full' : 'data-only'} backup?`,
      [
        {
          text: I18n.locale === 'ar' ? 'إلغاء' : 'Cancel',
          style: 'cancel',
        },
        {
          text: I18n.locale === 'ar' ? 'نعم' : 'Yes',
          onPress: () => performBackup(type),
        },
      ]
    );
  };

  const performBackup = async (type) => {
    setLoading(true);
    try {
      const response = await fetch('https://www.kmtsys.com/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastBackup({
          date: new Date().toISOString(),
          type,
          size: data.size || 'N/A',
        });
        
        Alert.alert(
          I18n.locale === 'ar' ? 'نجاح' : 'Success',
          I18n.locale === 'ar' 
            ? 'تم إنشاء النسخة الاحتياطية بنجاح'
            : 'Backup created successfully'
        );
      } else {
        throw new Error(data.error || 'Failed to create backup');
      }
    } catch (error) {
      Alert.alert(
        I18n.locale === 'ar' ? 'خطأ' : 'Error',
        error.message || (I18n.locale === 'ar' ? 'فشل إنشاء النسخة الاحتياطية' : 'Failed to create backup')
      );
    } finally {
      setLoading(false);
    }
  };

  const BackupOption = ({ icon, title, description, type, color }) => (
    <TouchableOpacity
      style={styles.backupCard}
      onPress={() => createBackup(type)}
      disabled={loading}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.backupContent}>
        <Text style={styles.backupTitle}>{title}</Text>
        <Text style={styles.backupDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
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
            {I18n.locale === 'ar' ? 'النسخ الاحتياطي' : 'Backup & Restore'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>
                {I18n.locale === 'ar' ? 'جاري إنشاء النسخة الاحتياطية...' : 'Creating backup...'}
              </Text>
            </View>
          )}

          {/* Last Backup Info */}
          {lastBackup && (
            <View style={styles.infoCard}>
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoTitle}>
                  {I18n.locale === 'ar' ? 'آخر نسخة احتياطية' : 'Last Backup'}
                </Text>
                <Text style={styles.infoText}>
                  {new Date(lastBackup.date).toLocaleString(I18n.locale === 'ar' ? 'ar-EG' : 'en-US')}
                </Text>
                <Text style={styles.infoText}>
                  {I18n.locale === 'ar' ? 'النوع: ' : 'Type: '}
                  {lastBackup.type === 'full' 
                    ? (I18n.locale === 'ar' ? 'كاملة' : 'Full')
                    : (I18n.locale === 'ar' ? 'بيانات فقط' : 'Data Only')
                  }
                </Text>
              </View>
            </View>
          )}

          {/* Backup Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {I18n.locale === 'ar' ? 'خيارات النسخ الاحتياطي' : 'Backup Options'}
            </Text>

            <BackupOption
              icon="cloud-upload"
              title={I18n.locale === 'ar' ? 'نسخة احتياطية كاملة' : 'Full Backup'}
              description={I18n.locale === 'ar' 
                ? 'نسخ احتياطي لجميع البيانات والإعدادات'
                : 'Backup all data and settings'
              }
              type="full"
              color="#3b82f6"
            />

            <BackupOption
              icon="folder"
              title={I18n.locale === 'ar' ? 'نسخ البيانات فقط' : 'Data Only Backup'}
              description={I18n.locale === 'ar' 
                ? 'نسخ احتياطي للبيانات دون الإعدادات'
                : 'Backup data without settings'
              }
              type="data"
              color="#8b5cf6"
            />
          </View>

          {/* Warning */}
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.warningTitle}>
                {I18n.locale === 'ar' ? 'تنبيه' : 'Important'}
              </Text>
              <Text style={styles.warningText}>
                {I18n.locale === 'ar' 
                  ? 'سيتم حفظ النسخة الاحتياطية على السيرفر. يُنصح بعمل نسخ احتياطية دورية للحفاظ على بياناتك.'
                  : 'Backups will be stored on the server. Regular backups are recommended to protect your data.'
                }
              </Text>
            </View>
          </View>

          {/* Restore Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {I18n.locale === 'ar' ? 'استعادة البيانات' : 'Restore Data'}
            </Text>

            <TouchableOpacity
              style={styles.restoreCard}
              onPress={() => {
                Alert.alert(
                  I18n.locale === 'ar' ? 'قريباً' : 'Coming Soon',
                  I18n.locale === 'ar' 
                    ? 'ميزة استعادة البيانات ستكون متاحة قريباً'
                    : 'Data restore feature will be available soon'
                );
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#10b98120' }]}>
                <Ionicons name="cloud-download" size={32} color="#10b981" />
              </View>
              <View style={styles.backupContent}>
                <Text style={styles.backupTitle}>
                  {I18n.locale === 'ar' ? 'استعادة من نسخة احتياطية' : 'Restore from Backup'}
                </Text>
                <Text style={styles.backupDescription}>
                  {I18n.locale === 'ar' ? 'استرجاع البيانات من نسخة سابقة' : 'Restore data from previous backup'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>
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
  loadingOverlay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  backupCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  backupContent: {
    flex: 1,
  },
  backupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  backupDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  warningCard: {
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f59e0b',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
});

export default BackupScreen;
