import React, { useRef, useEffect } from 'react'
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import Dashboard from '../screens/Dashboard'
import Pathologist from '../screens/Pathologist'
import MarketAI from '../screens/MarketAI'
import LoanAdvisor from '../screens/LoanAdvisor'
import SoilLab from '../screens/SoilLab'
import GovSchemes from '../screens/GovSchemes'
import FarmPassport from '../screens/FarmPassport'
import DiseaseLibrary from '../screens/DiseaseLibrary'
import CropCalendar from '../screens/CropCalendar'
import { colors, typography, spacing, radius } from '../theme/tokens'
import { useLang } from '../context/LanguageContext'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Icon renderer function
function getTabIcon(routeName, color, size) {
  switch (routeName) {
    case 'Home':
      return <Feather name="home" size={size} color={color} />
    case 'AI Scan':
      return <MaterialCommunityIcons name="leaf-maple" size={size} color={color} />
    case 'Library':
      return <Feather name="book-open" size={size} color={color} />
    case 'Market':
      return <Feather name="trending-up" size={size} color={color} />
    case 'Loans':
      return <Feather name="credit-card" size={size} color={color} />
    case 'Calendar':
      return <Feather name="calendar" size={size} color={color} />
    default:
      return <Feather name="help-circle" size={size} color={color} />
  }
}

// ─── Animated Tab Item ────────────────────────────────────────────────────────
function TabItem({ route, isFocused, onPress, label }) {
  const scale  = useRef(new Animated.Value(isFocused ? 1 : 0)).current
  const opacity= useRef(new Animated.Value(isFocused ? 1 : 0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale,  { toValue: isFocused ? 1 : 0, useNativeDriver: true, tension: 70, friction: 9 }),
      Animated.timing(opacity,{ toValue: isFocused ? 1 : 0, duration: 180, useNativeDriver: true }),
    ]).start()
  }, [isFocused])

  const color = isFocused ? colors.primary : colors.textMuted
  const size = isFocused ? 22 : 20

  return (
    <TouchableOpacity
      key={route.key}
      style={TB.tab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Active pill behind icon */}
      <Animated.View style={[TB.pill, { transform: [{ scale }], opacity, backgroundColor: colors.accentMuted }]} />

      <View style={TB.iconWrap}>
        {getTabIcon(route.name, color, size)}
      </View>
      <Text style={[TB.label, isFocused && [TB.labelActive, { color: colors.primary }]]}>{label}</Text>
    </TouchableOpacity>
  )
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={TB.container}>
      {/* Subtle top glow line */}
      <View style={TB.glowLine} />
      <View style={TB.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label =
            options.tabBarLabel !== undefined ? options.tabBarLabel
            : options.title     !== undefined ? options.title
            : route.name

          const isFocused = state.index === index

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress', target: route.key, canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name)
          }

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              onPress={onPress}
              label={label}
            />
          )
        })}
      </View>
    </View>
  )
}

const TB = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.md,
    paddingTop: 0,
  },
  glowLine: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 0,
    marginBottom: spacing.sm,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    position: 'relative',
    gap: spacing.xs,
  },
  pill: {
    position: 'absolute',
    width: '82%',
    height: '100%',
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    top: 0,
  },
  iconWrap: { position: 'relative', zIndex: 1 },
  label: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.regular,
    color: colors.textMuted,
    letterSpacing: 0.3,
    zIndex: 1,
  },
  labelActive: {
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
})

// ─── Stacks ───────────────────────────────────────────────────────────────────
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard"   component={Dashboard} />
      <Stack.Screen name="SoilLab"     component={SoilLab} />
      <Stack.Screen name="GovSchemes"  component={GovSchemes} />
      <Stack.Screen name="FarmPassport" component={FarmPassport} />
    </Stack.Navigator>
  )
}

function LibraryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiseaseLibrary" component={DiseaseLibrary} />
    </Stack.Navigator>
  )
}

function PathologistStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PathologistScreen" component={Pathologist} />
      <Stack.Screen name="DiseaseLibrary" component={DiseaseLibrary} />
      <Stack.Screen name="FarmPassport" component={FarmPassport} />
    </Stack.Navigator>
  )
}

function MarketStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MarketScreen" component={MarketAI} />
    </Stack.Navigator>
  )
}

function LoanStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoanScreen" component={LoanAdvisor} />
    </Stack.Navigator>
  )
}

function CalendarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CalendarScreen" component={CropCalendar} />
    </Stack.Navigator>
  )
}

// Tab label key map
const TAB_LABEL_KEYS = {
  'Home': 'tab_home',
  'AI Scan': 'tab_scan',
  'Library': 'tab_library',
  'Market': 'tab_market',
  'Loans': 'tab_loans',
  'Calendar': 'tab_calendar',
}

// ─── Tab Navigator ─────────────────────────────────────────────────────────────
export default function TabNavigator() {
  const { t } = useLang()
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ route }) => {
        const labelKey = TAB_LABEL_KEYS[route.name] || route.name
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabel: t[labelKey] || route.name,
        }
      }}
    >
      <Tab.Screen name="Home"     component={DashboardStack} />
      <Tab.Screen name="AI Scan"  component={PathologistStack} />
      <Tab.Screen name="Library"  component={LibraryStack} />
      <Tab.Screen name="Market"   component={MarketStack} />
      <Tab.Screen name="Loans"    component={LoanStack} />
      <Tab.Screen name="Calendar" component={CalendarStack} />
    </Tab.Navigator>
  )
}
