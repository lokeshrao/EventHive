import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import Event from './screens/Event';
import Setting from './screens/Setting';
import DatabaseExporter from './screens/DBExport';
import EventUsers from './screens/EventUsers';
import StorageHelper from './utils/storageHelper';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const EventsStack = () => (
  <Stack.Navigator initialRouteName="Events" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AllEvents" component={Event} />
    <Stack.Screen name="EventUsers" component={EventUsers} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  const [checkingToken, setCheckingToken] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Setting'); // Default initial route is 'Setting'
  const navigation = useNavigation();

  useEffect(() => {
    shouldNavigate();
  }, []);

  const shouldNavigate = async () => {
    try {
      const tokenValid = await StorageHelper.isTokenValid();
      setInitialRoute(tokenValid ? 'Events' : 'Setting');
      if (!tokenValid) {
        Alert.alert('Session is expired, please log in again', '', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Setting'),
          },
        ]);
      }
    } catch (error) {
      console.error('Error checking token:', error);
      Alert.alert('Failed to check token validity');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleTabPress = async (routeName: string) => {
    const tokenValid = await StorageHelper.isTokenValid();
    console.log(routeName +"  IsToken Valid :  "+ tokenValid)
    if (routeName === 'Events' && !tokenValid) {
      Alert.alert('Session is expired, please log in again', '', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Setting'),
        },
      ]);
    } else {
      navigation.navigate(routeName);
    }
  };

  if (checkingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking Token...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarActiveTintColor: '#5cbcb3',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { display: 'flex' },
      }}
    >
      <Tab.Screen
        name="Setting"
        component={Setting}
        options={{
          tabBarLabel: 'Setting',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="settings" color={focused ? color : '#5cbcb3'} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Setting') }}
      />
      <Tab.Screen
        name="Events"
        component={EventsStack}
        options={{
          tabBarLabel: 'Events',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="file-tray" color={focused ? color : '#5cbcb3'} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Events') }}
      />
      <Tab.Screen
        name="Screen3"
        component={DatabaseExporter}
        options={{
          tabBarLabel: 'Screen 3',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name="log-out" color={focused ? color : '#5cbcb3'} size={size} />
          ),
        }}
        listeners={{ tabPress: () => handleTabPress('Screen3') }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;
