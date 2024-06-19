import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/Login';
import Setting from './screens/Setting';
import TabNavigator from './tabNavigator'; 
import DBExport from './screens/DBExport';

import DatabaseExporter from './screens/DBExport';
import EventUsers from './screens/EventUsers';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabNavigator" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Setting" component={Setting} options={{ tabBarLabel: 'Setting', headerShown: false }} />
      <Tab.Screen name="Events" component={EventsStack} options={{ headerShown: false }} />
      <Tab.Screen name="Screen3" component={DBExport} options={{ tabBarLabel: 'Screen 3', headerShown: false }} />
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

function Screen3() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen 3 Content</Text>
    </View>
  );
}
