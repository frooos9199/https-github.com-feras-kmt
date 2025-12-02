import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { UserContext } from './UserContext';
import I18n from './i18n';

const ManageMarshalsScreen = () => {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marshals, setMarshals] = useState([]);
  const [error, setError] = useState(null);

  const fetchMarshals = async () => {
    if (!user?.token) return;
    
    try {
      setError(null);
      const response = await fetch('https://www.kmtsys.com/api/admin/marshals', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch marshals');
      }
      
      setMarshals(Array.isArray(data.marshals) ? data.marshals : []);
    } catch (err) {
      console.error('[MANAGE MARSHALS]', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarshals();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMarshals();
  };

  const handleDeleteMarshal = (marshalId, marshalName) => {
    Alert.alert(
      I18n.locale === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
      I18n.locale === 'ar' 
        ? `هل أنت متأكد من حذف المارشال "${marshalName}"؟`
        : `Are you sure you want to delete marshal "${marshalName}"?`,
      [
        {
          text: I18n.locale === 'ar' ? 'إلغاء' : 'Cancel',
          style: 'cancel',
        },
        {
          text: I18n.locale === 'ar' ? 'حذف' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://www.kmtsys.com/api/admin/marshals/${marshalId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to delete marshal');
              }

              Alert.alert(
                I18n.locale === 'ar' ? 'نجح' : 'Success',
                I18n.locale === 'ar' ? 'تم حذف المارشال بنجاح' : 'Marshal deleted successfully'
              );

              fetchMarshals(); // Refresh list
            } catch (err) {
              Alert.alert(
                I18n.locale === 'ar' ? 'خطأ' : 'Error',
                err.message
              );
            }
          },
        },
      ]
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>
          {I18n.locale === 'ar' ? 'للمسؤولين فقط' : 'Admins only'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {I18n.locale === 'ar' ? 'إدارة المارشالات' : 'Manage Marshals'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{marshals.length}</Text>
            <Text style={styles.statLabel}>
              {I18n.locale === 'ar' ? 'إجمالي المارشالات' : 'Total Marshals'}
            </Text>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={60} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchMarshals}>
              <Text style={styles.retryText}>
                {I18n.locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : marshals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>
              {I18n.locale === 'ar' ? 'لا يوجد مارشالات' : 'No marshals found'}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.marshalsList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
            }
          >
            {marshals.map((marshal) => (
              <View key={marshal.id} style={styles.marshalCard}>
                <View style={styles.marshalHeader}>
                  {/* Avatar with Image */}
                  {marshal.image ? (
                    <Image 
                      source={{ uri: marshal.image }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarCircle}>
                      <Ionicons name="person" size={28} color="#fff" />
                    </View>
                  )}
                  
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marshalName}>{marshal.name}</Text>
                    <Text style={styles.marshalEmail}>{marshal.email}</Text>
                    {marshal.employeeId && (
                      <Text style={styles.marshalId}>
                        {I18n.locale === 'ar' ? 'رقم الموظف: ' : 'Employee ID: '}
                        {marshal.employeeId}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteMarshal(marshal.id, marshal.name)}
                  >
                    <Ionicons name="trash" size={20} color="#dc2626" />
                  </TouchableOpacity>
                </View>

                {marshal._count && (
                  <View style={styles.marshalStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="calendar" size={16} color="#f59e0b" />
                      <Text style={styles.statItemText}>
                        {marshal._count.attendances || 0} {I18n.locale === 'ar' ? 'حدث' : 'events'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  marshalsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  marshalCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  marshalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  marshalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  marshalEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  marshalId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderRadius: 20,
  },
  marshalStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statItemText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
    marginTop: 16,
  },
});

export default ManageMarshalsScreen;
