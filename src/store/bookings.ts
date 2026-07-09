import { useSyncExternalStore } from 'react'
import { BookingStatus, ServiceBooking, serviceBookings } from '../data/mock'

/* ============ Записи на ТО (localStorage + подписка) ============
   Демо-записи текущей недели (подтверждённые) + реальные заявки с витрины.
   Счётчик НОВЫХ стартует с нуля — новые появляются только при заявке. */

const KEY = 'chasi-bookings'

let cache: ServiceBooking[] | null = null
const listeners = new Set<() => void>()

function read(): ServiceBooking[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ServiceBooking[]) : []
  } catch {
    return []
  }
}

function stored(): ServiceBooking[] {
  if (cache === null) cache = read()
  return cache
}

function write(list: ServiceBooking[]) {
  cache = list
  localStorage.setItem(KEY, JSON.stringify(list))
  listeners.forEach(fn => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Все записи: заявки с сайта (localStorage) + демо текущей недели. */
export function getBookings(): ServiceBooking[] {
  return [...stored(), ...serviceBookings]
}

export function addBooking(b: Omit<ServiceBooking, 'id' | 'createdAt' | 'status'>) {
  const booking: ServiceBooking = {
    ...b,
    id: 'SB-' + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    status: 'новая',
  }
  write([booking, ...stored()])
  return booking
}

export function setBookingStatus(id: string, status: BookingStatus, rejectReason?: string) {
  write(stored().map(b => (b.id === id ? { ...b, status, ...(rejectReason !== undefined ? { rejectReason } : {}) } : b)))
}

/** React-хук: живой список записей (localStorage + демо-неделя). */
export function useBookings(): ServiceBooking[] {
  const s = useSyncExternalStore(subscribe, stored, stored)
  return [...s, ...serviceBookings]
}

/** React-хук: только МОИ заявки (оформленные с этого устройства). */
export function useMyBookings(): ServiceBooking[] {
  return useSyncExternalStore(subscribe, stored, stored)
}
