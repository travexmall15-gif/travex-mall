import 'react-native-url-polyfill/auto'
import React, { useEffect } from 'react'
import { NavigationContainer, LinkingOptions } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import * as Notifications from 'expo-notifications'
import AppNavigator from './src/navigation/AppNavigator'

SplashScreen.preventAutoHideAsync()

// Push notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
})

// Deep link config — notification tap opens Orders
const linking: LinkingOptions<any> = {
  prefixes: ['shopnektseller://'],
  config: {
    screens: {
      Main: {
        screens: {
          Orders: 'orders',
          Home:   'home',
        }
      }
    }
  }
}

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync()

    // Listen for notification taps — navigate to Orders
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      // Navigation handled by deep link
    })
    return () => sub.remove()
  }, [])

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style="light"/>
      <AppNavigator/>
    </NavigationContainer>
  )
}
