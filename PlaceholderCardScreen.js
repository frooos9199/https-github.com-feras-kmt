import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import I18n from './i18n';

const PlaceholderCardScreen = ({ route }) => {
  const navigation = useNavigation();
  const { actionKey } = route.params || {};
  const label = I18n.t(actionKey) || actionKey;

  const renderContent = () => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.emptyState}>
          <Ionicons name="construct" size={80} color="rgba(255,255,255,0.3)" />
          <Text style={styles.emptyTitle}>
            {I18n.locale === 'ar' ? 'قيد التطوير' : 'Under Development'}
          </Text>
          <Text style={styles.emptyDesc}>
            {I18n.locale === 'ar' 
              ? 'هذه الميزة قيد التطوير وستكون متاحة قريباً' 
              : 'This feature is under development and will be available soon'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#000', '#b71c1c']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{label}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Content */}
        <ScrollView style={{ flex: 1 }}>
          {renderContent()}
        </ScrollView>
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
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default PlaceholderCardScreen;
