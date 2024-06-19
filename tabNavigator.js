import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ToastAndroid } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

import Event from './screens/Event';
import Setting from './screens/Setting';
import EventUsers from './screens/EventUsers';
import { isTokenValid } from './utils/storageHelper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function TabNavigator() {
  const [checkingToken, setCheckingToken] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const navigation = useNavigation();
  const [initialRoute, setInitialRoute] = useState('Setting'); // Default initial route is 'Setting'

  useEffect(() => {
    const checkToken = async () => {
      try {
        const tokenValid = await isTokenValid();
        setValidToken(tokenValid);
        setCheckingToken(false);
        if (tokenValid) {
          setInitialRoute('Events');
        } else {
          ToastAndroid.show('Session is expired, please log in again', ToastAndroid.SHORT);
        }
      } catch (error) {
        console.error('Error checking token:', error);
        setCheckingToken(false);
        ToastAndroid.show('Failed to check token validity', ToastAndroid.SHORT);
      }
    };
    checkToken();
  }, [navigation]);

  if (checkingToken) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Checking Token...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator initialRouteName={initialRoute}>
    <Tab.Screen
      name="Setting"
      component={Setting}
      options={{
        tabBarLabel: 'Setting',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" color="black" size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Events"
      component={EventsStack}
      options={{
        tabBarLabel: 'Events',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="alarm" color="black"  size={size} />
        ),
      }}
    />
    <Tab.Screen
      name="Screen3"
      component={Screen3}
      options={{
        tabBarLabel: 'Screen 3',
        headerShown: false,
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="home" color="black" size={size} />
        ),
      }}
    />
  </Tab.Navigator>
  );
}

const EventsStack = () => {
  return (
    <Stack.Navigator initialRouteName="Events" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Events" component={Event} />
      <Stack.Screen name="EventUsers" component={EventUsers} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function Screen3() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen 3 Content</Text>
    </View>
  );
}
