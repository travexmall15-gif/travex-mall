import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, fmtTZS, NAVY, OFF, GRAY, GREEN, RED, GOLD } from '../lib/supabase'

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([])
  const [shopId, setShopId]     = useState('')
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState<any>(null)
  const [name, setName]         = useState('')
  const [price, setPrice]       = useState('')
  const [desc, setDesc]         = useState('')
  const [refreshing, setRef]    = useState(false)

  const load = useCallback(async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) return
    const { id } = JSON.parse(raw)
    setShopId(id)
    const { data } = await sb.from('products').select('*').eq('shop_id', id).order('created_at', { ascending: false })
    setProducts(data || [])
  }, [])

  useEffect(() => { load() }, [load])
  const onRefresh = async () => { setRef(true); await load(); setRef(false) }

  const openAdd = () => { setEditing(null); setName(''); setPrice(''); setDesc(''); setModal(true) }
  const openEdit = (p: any) => { setEditing(p); setName(p.name || ''); setPrice(String(p.price || '')); setDesc(p.description || ''); setModal(true) }

  const save = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter a product name'); return }
    if (editing) {
      await sb.from('products').update({ name: name.trim(), price: Number(price) || 0, description: desc.trim() }).eq('id', editing.id)
    } else {
      await sb.from('products').insert({ name: name.trim(), price: Number(price) || 0, description: desc.trim(), shop_id: shopId, created_at: new Date().toISOString() })
    }
    setModal(false)
    await load()
  }

  const del = () => Alert.alert('Delete Product', 'Are you sure?', [
    { text: 'Cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      if (editing) await sb.from('products').delete().eq('id', editing.id)
      setModal(false); await load()
    }}
  ])

  const renderItem = ({ item: p }: any) => (
    <TouchableOpacity style={s.card} onPress={() => openEdit(p)} activeOpacity={0.85}>
      <View style={s.img}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: NAVY, textAlign: 'center', paddingHorizontal: 4 }} numberOfLines={2}>{p.name}</Text>
      </View>
      <View style={{ padding: 8 }}>
        <Text style={s.pName} numberOfLines={1}>{p.name}</Text>
        <Text style={s.pPrice}>{fmtTZS(p.price || 0)}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1, backgroundColor: OFF }}>
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 10 }}
        contentContainerStyle={{ padding: 16, gap: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        ListHeaderComponent={
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>+ Add Product</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: NAVY, marginBottom: 6 }}>No products yet</Text>
            <Text style={{ fontSize: 13, color: GRAY, textAlign: 'center' }}>Add your first product to start selling</Text>
          </View>
        }
        renderItem={renderItem}
      />

      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.mTitle}>{editing ? 'Edit Product' : 'Add Product'}</Text>
            <TextInput style={s.inp} placeholder="Product name" value={name} onChangeText={setName} placeholderTextColor="#94A3B8"/>
            <TextInput style={s.inp} placeholder="Price (TZS)" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor="#94A3B8"/>
            <TextInput style={[s.inp, { height: 80, textAlignVertical: 'top' }]} placeholder="Description (optional)" value={desc} onChangeText={setDesc} multiline placeholderTextColor="#94A3B8"/>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
              <TouchableOpacity style={[s.btn, { backgroundColor: NAVY, flex: 1 }]} onPress={save}>
                <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>Save</Text>
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity style={[s.btn, { backgroundColor: 'rgba(220,38,38,0.08)', flex: 0.7, borderWidth: 1, borderColor: 'rgba(220,38,38,0.2)' }]} onPress={del}>
                  <Text style={{ color: RED, fontWeight: '700', textAlign: 'center' }}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[s.btn, { backgroundColor: '#F1F5F9', flex: 0.6 }]} onPress={() => setModal(false)}>
                <Text style={{ color: NAVY, fontWeight: '700', textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  addBtn:  { backgroundColor: NAVY, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 },
  card:    { flex: 1, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0' },
  img:     { height: 80, backgroundColor: OFF, alignItems: 'center', justifyContent: 'center' },
  pName:   { fontSize: 13, fontWeight: '700', color: NAVY, marginBottom: 2 },
  pPrice:  { fontSize: 12, fontWeight: '800', color: GREEN },
  empty:   { padding: 40, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modal:   { backgroundColor: '#fff', borderRadius: 22, padding: 22, margin: 12 },
  mTitle:  { fontSize: 17, fontWeight: '800', color: NAVY, marginBottom: 16 },
  inp:     { backgroundColor: '#F8FAFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, fontSize: 14, color: NAVY, marginBottom: 10 },
  btn:     { padding: 13, borderRadius: 12 },
})
