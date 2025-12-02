import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import QuickActionsScreen from './QuickActionsScreen';
import PlaceholderCardScreen from './PlaceholderCardScreen';
import RecentActivityScreen from './RecentActivityScreen';
import PendingRequestsScreen from './PendingRequestsScreen';
import ManageEventsScreen from './ManageEventsScreen';
import ManageMarshalsScreen from './ManageMarshalsScreen';
import EventDetailsScreen from './EventDetailsScreen';
import EditEventScreen from './EditEventScreen';
import ReportsScreen from './ReportsScreen';
import BroadcastMessagesScreen from './BroadcastMessagesScreen';
import BackupScreen from './BackupScreen';

const Stack = createStackNavigator();

const QuickActionsNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="QuickActionsMain" component={QuickActionsScreen} />
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="ManageMarshals" component={ManageMarshalsScreen} />
      <Stack.Screen name="PendingRequests" component={PendingRequestsScreen} />
      <Stack.Screen name="RecentActivity" component={RecentActivityScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="BroadcastMessages" component={BroadcastMessagesScreen} />
      <Stack.Screen name="Backup" component={BackupScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="EditEvent" component={EditEventScreen} />
      <Stack.Screen name="PlaceholderCard" component={PlaceholderCardScreen} />
    </Stack.Navigator>
  );
};

export default QuickActionsNavigator;
