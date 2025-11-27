import './firebaseInit';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
// import messaging from '@react-native-firebase/messaging';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  // تم تعطيل كود الإشعارات مؤقتاً

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الإشعارات</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardBody}>{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>لا توجد إشعارات بعد</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#222', borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { color: '#dc2626', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  cardBody: { color: '#fff', fontSize: 15 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});

export default NotificationsScreen;
