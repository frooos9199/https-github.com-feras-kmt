import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text } from 'react-native';
import HomeScreen from './HomeScreen';
import NotificationsScreen from './NotificationsScreen';
import EventsScreen from './EventsScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import I18n from './i18n';


const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#dc2626',
      tabBarInactiveTintColor: '#fff',
      tabBarStyle: {
        backgroundColor: '#1a1a1a',
        borderTopWidth: 0.5,
        borderTopColor: '#991b1b',
        height: 62,
        paddingBottom: 6,
        paddingTop: 6,
      },
      tabBarIcon: ({ color, size }) => {
        if (route.name === 'Home') {
          return <Ionicons name="home" size={size} color={color} />;
        } else if (route.name === 'Notifications') {
          return <Ionicons name="notifications" size={size} color={color} />;
        } else if (route.name === 'Events') {
          return <MaterialCommunityIcons name="calendar-star" size={size} color={color} />;
        } else if (route.name === 'Stats') {
          return <Ionicons name="stats-chart" size={size} color={color} />;
        } else if (route.name === 'Profile') {
          return <Ionicons name="person-circle" size={size} color={color} />;
        }
        return null;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: I18n.t('tab_home') }} />
    <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: I18n.t('tab_events') }} />
    <Tab.Screen name="Stats" component={StatsScreen} options={{ tabBarLabel: I18n.t('tab_stats') }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: I18n.t('tab_profile') }} />
  </Tab.Navigator>
);

export default MainTabNavigator;
