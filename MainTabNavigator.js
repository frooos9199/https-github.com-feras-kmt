import React, { useContext, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { View, Text } from 'react-native';
import HomeScreen from './HomeScreen';
import NotificationsScreen from './NotificationsScreen';
import EventsScreen from './EventsScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import QuickActionsNavigator from './QuickActionsNavigator';
import AttendanceScreen from './AttendanceScreen';
import MyAttendanceScreen from './MyAttendanceScreen';
import I18n from './i18n';
import { UserContext } from './UserContext';


const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { user } = useContext(UserContext);
  const [lang, setLang] = useState(I18n.locale);
  const isAdmin = user?.role === 'admin';
  const isMarshal = user?.role === 'marshal';

  // تحديث اللغة عند التبديل
  useEffect(() => {
    const interval = setInterval(() => {
      if (I18n.locale !== lang) {
        setLang(I18n.locale);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: isAdmin ? '#dc2626' : '#f59e0b',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          backgroundColor: isAdmin ? '#1a1a1a' : '#111827',
          borderTopWidth: 1,
          borderTopColor: isAdmin ? '#991b1b' : '#374151',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          let IconComponent = Ionicons;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Events') {
            IconComponent = MaterialCommunityIcons;
            iconName = focused ? 'calendar-star' : 'calendar-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'QuickActions') {
            iconName = focused ? 'flash' : 'flash-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'calendar-sharp' : 'calendar-outline';
          } else if (route.name === 'MyAttendance') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <IconComponent name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* Tabs مشتركة للجميع */}
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarLabel: lang === 'ar' ? 'الرئيسية' : 'Home' }} 
      />
      <Tab.Screen 
        name="Events" 
        component={EventsScreen} 
        options={{ tabBarLabel: lang === 'ar' ? 'الأحداث' : 'Events' }} 
      />

      {/* Tabs خاصة بالمارشال */}
      {isMarshal && (
        <>
          <Tab.Screen 
            name="Attendance" 
            component={AttendanceScreen} 
            options={{ 
              tabBarLabel: lang === 'ar' ? 'تسجيل' : 'Register',
              tabBarBadge: undefined,
            }} 
          />
          <Tab.Screen 
            name="MyAttendance" 
            component={MyAttendanceScreen} 
            options={{ 
              tabBarLabel: lang === 'ar' ? 'طلباتي' : 'My Requests',
            }} 
          />
        </>
      )}

      {/* Tabs خاصة بالأدمن */}
      {isAdmin && (
        <>
          <Tab.Screen 
            name="Stats" 
            component={StatsScreen} 
            options={{ tabBarLabel: lang === 'ar' ? 'الإحصائيات' : 'Stats' }} 
          />
          <Tab.Screen 
            name="QuickActions" 
            component={QuickActionsNavigator} 
            options={{ 
              tabBarLabel: lang === 'ar' ? 'إجراءات' : 'Actions',
            }} 
          />
        </>
      )}

      {/* Tab البروفايل للجميع */}
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: lang === 'ar' ? 'البروفايل' : 'Profile' }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
