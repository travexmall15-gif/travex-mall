import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text } from 'react-native'
import SplashScreen   from '../screens/SplashScreen'
import LoginScreen    from '../screens/LoginScreen'
import HomeScreen     from '../screens/HomeScreen'
import OrdersScreen   from '../screens/OrdersScreen'
import FinanceScreen  from '../screens/FinanceScreen'
import MessagesScreen from '../screens/MessagesScreen'
import MoreScreen     from '../screens/MoreScreen'
import ProductsScreen from '../screens/ProductsScreen'

const Stack = createNativeStackNavigator()
const Tab   = createBottomTabNavigator()

const NAVY = '#0D1B3E'
const GRAY = '#94A3B8'

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons: Record<string,string> = {
            Home:'🏠', Orders:'📦', Finance:'💰', Messages:'💬', More:'⋯'
          }
          return (
            <Text style={{ fontSize:22, color: focused ? NAVY : GRAY }}>
              {icons[route.name] || '•'}
            </Text>
          )
        },
        tabBarLabel: ({ focused }) => (
          <Text style={{ fontSize:10, color: focused ? NAVY : GRAY, fontWeight: focused ? '700' : '500', marginBottom:2 }}>
            {route.name}
          </Text>
        ),
        tabBarStyle: {
          height:62, paddingBottom:8, paddingTop:6,
          borderTopWidth:1, borderTopColor:'#E2E8F0', backgroundColor:'#fff'
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"     component={HomeScreen}/>
      <Tab.Screen name="Orders"   component={OrdersScreen}/>
      <Tab.Screen name="Finance"  component={FinanceScreen}/>
      <Tab.Screen name="Messages" component={MessagesScreen}/>
      <Tab.Screen name="More"     component={MoreScreen}/>
    </Tab.Navigator>
  )
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash"   component={SplashScreen}/>
      <Stack.Screen name="Login"    component={LoginScreen}/>
      <Stack.Screen name="Main"     component={MainTabs}/>
      <Stack.Screen name="Products" component={ProductsScreen}
        options={{ headerShown:true, title:'Products', headerStyle:{ backgroundColor:'#fff' }, headerTintColor:NAVY }}
      />
    </Stack.Navigator>
  )
}
