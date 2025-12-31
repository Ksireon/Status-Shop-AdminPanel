'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { supabase } from '@/lib/supabase'

type Room = { id: string, user_id: string, assigned_role?: string | null, last_message_at?: string | null }
type Msg = { id: string, room_id: string, sender_type: 'user' | 'staff', content: string, created_at: string }

export default function ChatAdminPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [role, setRole] = useState<'owner' | 'director' | 'manager' | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    const loadRooms = async () => {
      const cookie = typeof document !== 'undefined' ? document.cookie : ''
      const match = cookie.match(/(?:^|;\\s*)admin_role=([^;]+)/)
      const r = (match?.[1] || '') as any
      const currentRole = (r === 'owner' || r === 'director' || r === 'manager') ? r : null
      setRole(currentRole)
      let q = supabase.from('chat_rooms').select('*')
      if (currentRole) q = q.eq('assigned_role', currentRole)
      const { data } = await q.order('last_message_at', { ascending: false })
      setRooms((data as any) || [])
    }
    loadRooms()
  }, [])

  useEffect(() => {
    if (!active) return
    const loadMsgs = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('room_id', active).order('created_at', { ascending: true }).limit(200)
      setMessages((data as any) || [])
    }
    loadMsgs()
    const ch = supabase
      .channel(`chat-${active}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${active}` }, (payload) => {
        setMessages((prev) => {
          const next = [...prev]
          const rec = payload.new as any
          if (rec) next.push(rec)
          return next
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [active])

  const send = async () => {
    if (!active || !text.trim()) return
    await supabase.from('chat_messages').insert({ room_id: active, sender_type: 'staff', content: text.trim() })
    setText('')
  }

  const transfer = async (newRole: 'owner' | 'director' | 'manager') => {
    if (!active) return
    setPending(true)
    try {
      await fetch('/api/chat/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active, assigned_role: newRole })
      })
      // refresh rooms
      const { data } = await supabase.from('chat_rooms').select('*').order('last_message_at', { ascending: false })
      setRooms((data as any) || [])
    } finally {
      setPending(false)
    }
  }

  const closeRoom = async () => {
    if (!active) return
    setPending(true)
    try {
      await fetch('/api/chat/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: active })
      })
      // refresh rooms and reset active
      const { data } = await supabase.from('chat_rooms').select('*').order('last_message_at', { ascending: false })
      setRooms((data as any) || [])
      setActive(null)
      setMessages([])
    } finally {
      setPending(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Диалоги</h2>
          <div className="space-y-2">
            {rooms.map(r => (
              <button key={r.id} onClick={() => setActive(r.id)} className={`w-full text-left p-2 rounded-md border ${active === r.id ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
                <div className="text-sm">Room: {r.id.slice(0,8)}</div>
                <div className="text-xs text-gray-500">User: {r.user_id}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Сообщения</h2>
            {active && (
              <div className="flex items-center gap-2">
                <select
                  className="rounded-md border px-2 py-1 text-sm"
                  defaultValue={role || 'manager'}
                  onChange={(e) => transfer(e.target.value as any)}
                  disabled={pending}
                >
                  <option value="manager">Менеджер</option>
                  <option value="director">Директор</option>
                  <option value="owner">Владелец</option>
                </select>
                <button
                  onClick={closeRoom}
                  className="rounded-md border px-2 py-1 text-sm"
                  disabled={pending}
                >
                  Закрыть диалог
                </button>
              </div>
            )}
          </div>
          {!active ? (
            <div className="text-sm text-gray-500">Выберите диалог слева</div>
          ) : (
            <div className="flex flex-col h-[60vh]">
              <div className="flex-1 overflow-auto space-y-2">
                {messages.map(m => (
                  <div key={m.id} className={`max-w-[60%] p-2 rounded-md ${m.sender_type === 'staff' ? 'bg-red-100 ml-auto' : 'bg-gray-100'}`}>
                    <div className="text-sm">{m.content}</div>
                    <div className="text-[10px] text-gray-500">{new Date(m.created_at).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input className="flex-1 rounded-md border px-2 py-1" value={text} onChange={e => setText(e.target.value)} placeholder="Напишите ответ..." />
                <button onClick={send} className="rounded-md bg-red-600 text-white px-3 py-1">Отправить</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
