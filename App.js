import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DonateFoodScreen from './src/screens/DonateFoodScreen';
import ViewRequestsScreen from './src/screens/ViewRequestsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DonateFood" component={DonateFoodScreen} />
        <Stack.Screen name="ViewRequests" component={ViewRequestsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
