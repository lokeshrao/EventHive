import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';

import LoginScreen from './screens/Login';
import Event from './screens/Event';
import Setting from './screens/Setting';


// import HomeScreen from './screens/HomeScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="TabNavigator">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TabNavigator" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Setting" 
        component={Setting} 
        options={{ tabBarLabel: 'Setting',headerShown: false }} // Remove tabBarIcon from options
      />
      <Tab.Screen 
        name="Events" 
        component={Event} 
        options={{ tabBarLabel: 'Events' ,headerShown: false}} // Remove tabBarIcon from options
      />
      <Tab.Screen 
        name="Screen3" 
        component={Screen3} 
        options={{ tabBarLabel: 'Screen 3',headerShown: false }} // Remove tabBarIcon from options
      />
    </Tab.Navigator>
  );
}
function Screen1() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen 1 Content</Text>
    </View>
  );
}

function Screen3() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Screen 3 Content</Text>
    </View>
  );
}