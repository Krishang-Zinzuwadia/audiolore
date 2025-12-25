import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from './app/screens/HomeScreen';
import { ListenScreen } from './app/screens/ListenScreen';
import { SettingsScreen } from './app/screens/SettingsScreen';
import { BottomTabBar } from './app/components/BottomTabBar';
import { colors } from './app/constants/colors';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.backgroundDark} />
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <BottomTabBar {...props} />}
          screenOptions={{
            headerShown: false,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Listen" component={ListenScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}
