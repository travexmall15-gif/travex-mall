import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native'
import { C } from '../lib/supabase'
import SplashScreen from '../screens/SplashScreen'
import LoginScreen from '../screens/LoginScreen'
import HomeScreen from '../screens/HomeScreen'
import OrdersScreen from '../screens/OrdersScreen'
import FinanceScreen from '../screens/FinanceScreen'
import MessagesScreen from '../screens/MessagesScreen'
import MoreScreen from '../screens/MoreScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const TABS = [
  { name: 'Home',     icon: '🏠' },
  { name: 'Orders',   icon: '📦' },
  { name: 'Finance',  icon: '💰' },
  { name: 'Messages', icon: '💬' },
  { name: 'More',     icon: '☰'  },
]

const SCREENS: Record<string, React.ComponentType<any>> = {
  Home: HomeScreen, Orders: OrdersScreen,
  Finance: FinanceScreen, Messages: MessagesScreen, More: MoreScreen,
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.4 }}>
            {TABS.find(t => t.name === route.name)?.icon || '●'}
          </Text>
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={{ fontSize: 10, color: focused ? C.NAVY : C.GRAY, fontWeight: focused ? '700' : '400', marginBottom: 2 }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: { height: 62, paddingBottom: 8, paddingTop: 6, backgroundColor: C.WHITE, borderTopColor: C.LGRAY },
      })}
    >
      {TABS.map(t => <Tab.Screen key={t.name} name={t.name} component={SCREENS[t.name]} />)}
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login"  component={LoginScreen} />
      <Stack.Screen name="Main"   component={Tabs} />
    </Stack.Navigator>
  )
}
