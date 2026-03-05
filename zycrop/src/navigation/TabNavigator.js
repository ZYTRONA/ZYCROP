import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Home, Camera, TrendingUp, CreditCard } from 'lucide-react-native'

import Dashboard from '../screens/Dashboard'
import Pathologist from '../screens/Pathologist'
import MarketAI from '../screens/MarketAI'
import LoanAdvisor from '../screens/LoanAdvisor'
import SoilLab from '../screens/SoilLab'
import GovSchemes from '../screens/GovSchemes'
import FarmPassport from '../screens/FarmPassport'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack that wraps Dashboard + secondary lab screens
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="SoilLab" component={SoilLab} />
      <Stack.Screen name="GovSchemes" component={GovSchemes} />
      <Stack.Screen name="FarmPassport" component={FarmPassport} />
    </Stack.Navigator>
  )
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10, backgroundColor: 'white' },
        tabBarActiveTintColor: '#1b5e20',
        tabBarInactiveTintColor: '#9e9e9e',
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
      />
      <Tab.Screen
        name="AI Scan"
        component={Pathologist}
        options={{ tabBarIcon: ({ color }) => <Camera color={color} size={24} /> }}
      />
      <Tab.Screen
        name="Market"
        component={MarketAI}
        options={{ tabBarIcon: ({ color }) => <TrendingUp color={color} size={24} /> }}
      />
      <Tab.Screen
        name="Loans"
        component={LoanAdvisor}
        options={{ tabBarIcon: ({ color }) => <CreditCard color={color} size={24} /> }}
      />
    </Tab.Navigator>
  )
}
