import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { C } from '../../lib/theme'

function TabIcon({ emoji, label, focused }: { emoji:string; label:string; focused:boolean }) {
  return (
    <View style={s.tab}>
      <Text style={s.emoji}>{emoji}</Text>
      <Text style={[s.label, focused && s.active]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopColor: C.border,
        height: 60,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: C.navy,
      tabBarInactiveTintColor: C.light,
    }}>
      <Tabs.Screen name="home" options={{ title:'Home', tabBarIcon:({focused})=><TabIcon emoji="🏠" label="Home" focused={focused}/> }} />
      <Tabs.Screen name="market" options={{ title:'Market', tabBarIcon:({focused})=><TabIcon emoji="🏪" label="Market" focused={focused}/> }} />
      <Tabs.Screen name="vybe" options={{ title:'Vybe', tabBarIcon:({focused})=><TabIcon emoji="✨" label="Vybe" focused={focused}/> }} />
      <Tabs.Screen name="orders" options={{ title:'Orders', tabBarIcon:({focused})=><TabIcon emoji="📦" label="Orders" focused={focused}/> }} />
      <Tabs.Screen name="menu" options={{ title:'Menu', tabBarIcon:({focused})=><TabIcon emoji="☰" label="Menu" focused={focused}/> }} />
    </Tabs>
  )
}

const s = StyleSheet.create({
  tab:    { alignItems:'center', paddingTop:4 },
  emoji:  { fontSize:18 },
  label:  { fontSize:10, color:C.light, marginTop:2, fontWeight:'600' },
  active: { color:C.navy },
})
