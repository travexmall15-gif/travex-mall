import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { sb, C, fmtTZS } from '../lib/supabase'

const PERIODS = ['Today','Week','Month']

export default function FinanceScreen() {
  const [period, setPeriod] = useState('Today')
  const [orders, setOrders] = useState<any[]>([])
  const [sales,  setSales]  = useState<any[]>([])
  const [shopId, setShopId] = useState('')
  const [modal,  setModal]  = useState(false)
  const [type,   setType]   = useState<'income'|'expense'>('income')
  const [desc,   setDesc]   = useState('')
  const [amount, setAmount] = useState('')
  const [date,   setDate]   = useState(new Date().toISOString().split('T')[0])
  const [ref,    setRef]    = useState(false)

  const load = async () => {
    const raw = await AsyncStorage.getItem('seller_session')
    if (!raw) {return}
    const {id} = JSON.parse(raw); setShopId(id)
    const {data:o} = await sb.from('orders').select('*').eq('shop_id',id)
    const {data:s} = await sb.from('seller_sales').select('*').eq('store_id',id).order('date',{ascending:false})
    setOrders(o||[]); setSales(s||[])
  }

  useEffect(() => { load() }, [])

  const today = new Date().toISOString().split('T')[0]
  const ws = (() => { const d = new Date(); d.setDate(d.getDate()-d.getDay()+1); return d.toISOString().split('T')[0] })()
  const ms = today.slice(0,7)

  const fDate = (d: string) => period==='Today'?d.startsWith(today):period==='Week'?d>=ws:d.startsWith(ms)

  const fOrders = orders.filter(o=>fDate(o.created_at||''))
  const fSales  = sales.filter(s=>fDate(s.date||''))
  const income  = fOrders.reduce((a,o)=>a+(Number(o.amount)||0),0) + fSales.filter(s=>s.type==='income').reduce((a,s)=>a+(Number(s.amount)||0),0)
  const expense = fSales.filter(s=>s.type==='expense').reduce((a,s)=>a+(Number(s.amount)||0),0)
  const profit  = income-expense

  const txs = [
    ...fOrders.map(o=>({desc:'Order: '+(o.customer_name||'Customer'),amount:Number(o.amount)||0,type:'income',date:o.created_at})),
    ...fSales.map(s=>({desc:s.description||'Transaction',amount:Number(s.amount)||0,type:s.type,date:s.date}))
  ].sort((a,b)=>b.date>a.date?1:-1)

  const saveTx = async () => {
    if (!desc.trim()||!amount) { Alert.alert('Error','Fill all fields'); return }
    await sb.from('seller_sales').insert({type,description:desc.trim(),amount:Number(amount),date,store_id:shopId,created_at:new Date().toISOString()})
    setModal(false); setDesc(''); setAmount(''); await load()
  }

  return (
    <View style={{flex:1,backgroundColor:C.OFF}}>
      <ScrollView contentContainerStyle={{padding:16}} refreshControl={<RefreshControl refreshing={ref} onRefresh={async()=>{setRef(true);await load();setRef(false)}}/>}>
        <View style={s.tabs}>
          {PERIODS.map(p=>(
            <TouchableOpacity key={p} onPress={()=>setPeriod(p)} style={[s.tab,period===p&&s.tabOn]}>
              <Text style={[s.tabTx,period===p&&{color:C.WHITE}]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{flexDirection:'row',gap:8,marginBottom:14}}>
          {[{l:'Income',v:fmtTZS(income),c:C.GREEN},{l:'Expenses',v:fmtTZS(expense),c:C.RED},{l:'Profit',v:(profit>=0?'+':'')+fmtTZS(Math.abs(profit)),c:profit>=0?C.GREEN:C.RED}].map(x=>(
            <View key={x.l} style={s.finCard}>
              <Text style={{fontSize:9,fontWeight:'600',color:C.GRAY,textTransform:'uppercase',marginBottom:4}}>{x.l}</Text>
              <Text style={{fontSize:12,fontWeight:'900',color:x.c,textAlign:'center'}}>{x.v}</Text>
            </View>
          ))}
        </View>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <Text style={{fontSize:14,fontWeight:'800',color:C.NAVY}}>Transactions</Text>
          <TouchableOpacity onPress={()=>setModal(true)} style={{backgroundColor:C.NAVY,borderRadius:999,paddingHorizontal:14,paddingVertical:7}}>
            <Text style={{color:C.WHITE,fontSize:12,fontWeight:'700'}}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <View style={s.card}>
          {txs.length===0
            ? <Text style={{color:C.GRAY,textAlign:'center',padding:16,fontSize:13}}>No transactions</Text>
            : txs.map((t,i)=>(
              <View key={i} style={{flexDirection:'row',alignItems:'center',gap:10,paddingVertical:10,borderBottomWidth:i<txs.length-1?1:0,borderBottomColor:C.OFF}}>
                <View style={{width:8,height:8,borderRadius:4,backgroundColor:t.type==='income'?C.GREEN:C.RED}}/>
                <View style={{flex:1}}>
                  <Text style={{fontSize:13,fontWeight:'600',color:C.NAVY}}>{t.desc}</Text>
                  <Text style={{fontSize:10,color:C.GRAY}}>{t.date?.split('T')[0]||t.date}</Text>
                </View>
                <Text style={{fontSize:14,fontWeight:'800',color:t.type==='income'?C.GREEN:C.RED}}>
                  {t.type==='income'?'+':'-'}{fmtTZS(t.amount)}
                </Text>
              </View>
            ))
          }
        </View>
      </ScrollView>
      <Modal visible={modal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.mTitle}>Record Transaction</Text>
            <View style={{flexDirection:'row',gap:8,marginBottom:12}}>
              {(['income','expense'] as const).map(t=>(
                <TouchableOpacity key={t} onPress={()=>setType(t)} style={[s.typeBtn,{backgroundColor:type===t?(t==='income'?C.GREEN:C.RED):C.OFF}]}>
                  <Text style={{color:type===t?C.WHITE:C.GRAY,fontWeight:'700',fontSize:13,textAlign:'center'}}>{t==='income'?'Income':'Expense'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={s.inp} placeholder="Description" value={desc} onChangeText={setDesc} placeholderTextColor="#94A3B8"/>
            <TextInput style={s.inp} placeholder="Amount (TZS)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholderTextColor="#94A3B8"/>
            <TextInput style={s.inp} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholderTextColor="#94A3B8"/>
            <View style={{flexDirection:'row',gap:8,marginTop:4}}>
              <TouchableOpacity style={[s.btn,{backgroundColor:C.NAVY,flex:1}]} onPress={saveTx}><Text style={{color:C.WHITE,fontWeight:'700',textAlign:'center'}}>Save</Text></TouchableOpacity>
              <TouchableOpacity style={[s.btn,{backgroundColor:C.OFF,flex:0.7}]} onPress={()=>setModal(false)}><Text style={{fontWeight:'700',textAlign:'center',color:C.NAVY}}>Cancel</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const s = StyleSheet.create({
  tabs:    {flexDirection:'row',backgroundColor:C.WHITE,borderRadius:999,padding:3,gap:3,marginBottom:14,borderWidth:1.5,borderColor:C.LGRAY},
  tab:     {flex:1,padding:8,borderRadius:999,alignItems:'center'},
  tabOn:   {backgroundColor:C.NAVY},
  tabTx:   {fontSize:12,fontWeight:'600',color:C.GRAY},
  finCard: {flex:1,backgroundColor:C.WHITE,borderRadius:12,padding:12,alignItems:'center',borderWidth:1.5,borderColor:C.LGRAY},
  card:    {backgroundColor:C.WHITE,borderRadius:14,padding:14,borderWidth:1.5,borderColor:C.LGRAY},
  overlay: {flex:1,backgroundColor:'rgba(0,0,0,0.45)',justifyContent:'flex-end'},
  modal:   {backgroundColor:C.WHITE,borderRadius:22,padding:22,margin:12},
  mTitle:  {fontSize:17,fontWeight:'800',color:C.NAVY,marginBottom:14},
  inp:     {backgroundColor:C.OFF,borderWidth:1.5,borderColor:C.LGRAY,borderRadius:12,padding:12,fontSize:14,color:C.NAVY,marginBottom:10},
  btn:     {padding:13,borderRadius:12},
  typeBtn: {flex:1,padding:11,borderRadius:12,alignItems:'center'},
  LGRAY:   {borderColor:'#E2E8F0'}
})
