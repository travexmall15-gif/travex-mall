import 'react-native-url-polyfill/auto'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import AppNavigator from './src/navigation/AppNavigator'

SplashScreen.preventAutoHideAsync()

export default function App() {
  useEffect(() => { SplashScreen.hideAsync() }, [])
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </NavigationContainer>
  )
}
