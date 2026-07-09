/* ============ МОК-ДАННЫЕ ДЛЯ ДЕМОНСТРАЦИИ КЛИЕНТУ ============ */

export type Category = 'original' | 'clone-swiss' | 'clone-mech' | 'aaaa' | 'aaa'
export type Style = 'diver' | 'dress' | 'sport' | 'pilot' | 'chrono'

export const CATEGORY_LABEL: Record<Category, string> = {
  original: 'Оригинал',
  'clone-swiss': '1:1 клон · Swiss механизм',
  'clone-mech': '1:1 клон',
  aaaa: 'AAAA копия',
  aaa: 'AAA копия',
}

export const STYLE_LABEL: Record<Style, string> = {
  diver: 'Дайверские', dress: 'Классика', sport: 'Спорт', pilot: 'Пилот', chrono: 'Хронограф',
}

export type Product = {
  id: number
  name: string
  brand: string
  category: Category
  style: Style
  gender: 'муж' | 'жен' | 'унисекс'
  price: number
  diameter: number
  glass: 'сапфировое' | 'минеральное'
  water: number          // м
  reserve: number        // ч запас хода
  movement: 'автоподзавод' | 'кварц' | 'механика'
  inStock: boolean
  stock: number          // остаток на складе (шт.)
  discount: number       // скидка на модель, %
  dial: [string, string]
  accent: string
}

// Порог «мало осталось» — ниже показываем срочность на витрине
export const LOW_STOCK = 3
// Варианты скидок для управления в CRM
export const DISCOUNT_OPTIONS = [0, 5, 10, 15, 20] as const

// Базовые данные без изменяемых полей склада — остаток/скидку добавляем ниже
type ProductBase = Omit<Product, 'stock' | 'discount'>

// Стартовые остатки (демо): часть моделей специально с малым запасом,
// чтобы показать срочность «осталось N — торопитесь». 0 — для «под заказ».
const START_STOCK: Record<number, number> = {
  1: 7, 2: 4, 3: 6, 4: 9, 5: 0, 6: 5, 7: 3, 8: 2,
  9: 3, 10: 8, 11: 1, 12: 12, 13: 4, 14: 6, 15: 0, 16: 3,
}

const rawProducts: ProductBase[] = [
  { id: 1,  name: 'Tissot Seastar 1000',        brand: 'Tissot',              category: 'original',    style: 'diver',  gender: 'муж',     price: 850,  diameter: 43,   glass: 'сапфировое',  water: 300, reserve: 80, movement: 'автоподзавод', inStock: true,  dial: ['#123241', '#07141b'], accent: '#d4af6a' },
  { id: 2,  name: 'Longines HydroConquest',     brand: 'Longines',            category: 'original',    style: 'sport',  gender: 'муж',     price: 1750, diameter: 41,   glass: 'сапфировое',  water: 300, reserve: 72, movement: 'автоподзавод', inStock: true,  dial: ['#1c1f2b', '#0a0b11'], accent: '#f0d9a8' },
  { id: 3,  name: 'Frederique Constant Classics', brand: 'Frederique Constant', category: 'original',  style: 'dress',  gender: 'муж',     price: 1300, diameter: 40,   glass: 'сапфировое',  water: 50,  reserve: 38, movement: 'автоподзавод', inStock: true,  dial: ['#2b2118', '#120d08'], accent: '#d4af6a' },
  { id: 4,  name: 'Alpina Startimer Pilot',     brand: 'Alpina',              category: 'original',    style: 'pilot',  gender: 'муж',     price: 800,  diameter: 42,   glass: 'сапфировое',  water: 100, reserve: 42, movement: 'автоподзавод', inStock: true,  dial: ['#20262e', '#0b0d11'], accent: '#f0d9a8' },
  { id: 5,  name: 'Rolex Submariner Date',      brand: 'Rolex',               category: 'clone-swiss', style: 'diver',  gender: 'муж',     price: 800,  diameter: 41,   glass: 'сапфировое',  water: 300, reserve: 70, movement: 'автоподзавод', inStock: false, dial: ['#0e2a1e', '#05130c'], accent: '#7fc97f' },
  { id: 6,  name: 'Rolex Datejust 36',          brand: 'Rolex',               category: 'clone-swiss', style: 'dress',  gender: 'унисекс', price: 750,  diameter: 36,   glass: 'сапфировое',  water: 100, reserve: 70, movement: 'автоподзавод', inStock: true,  dial: ['#3a3f4b', '#14161c'], accent: '#f0d9a8' },
  { id: 7,  name: 'Audemars Piguet Royal Oak',  brand: 'Audemars Piguet',     category: 'clone-swiss', style: 'sport',  gender: 'муж',     price: 800,  diameter: 41,   glass: 'сапфировое',  water: 50,  reserve: 60, movement: 'автоподзавод', inStock: true,  dial: ['#16213a', '#090d18'], accent: '#6ab3d4' },
  { id: 8,  name: 'Patek Philippe Nautilus',    brand: 'Patek Philippe',      category: 'clone-mech',  style: 'sport',  gender: 'муж',     price: 850,  diameter: 40,   glass: 'сапфировое',  water: 120, reserve: 45, movement: 'автоподзавод', inStock: true,  dial: ['#1d2b33', '#0b1216'], accent: '#d4af6a' },
  { id: 9,  name: 'Omega Seamaster Diver 300M', brand: 'Omega',               category: 'aaaa',        style: 'diver',  gender: 'муж',     price: 450,  diameter: 42,   glass: 'сапфировое',  water: 300, reserve: 55, movement: 'автоподзавод', inStock: true,  dial: ['#102638', '#071119'], accent: '#6ab3d4' },
  { id: 10, name: 'Rolex Daytona',              brand: 'Rolex',               category: 'aaaa',        style: 'chrono', gender: 'муж',     price: 500,  diameter: 40,   glass: 'сапфировое',  water: 100, reserve: 60, movement: 'автоподзавод', inStock: true,  dial: ['#e8e4da', '#b9b2a2'], accent: '#8a6d3b' },
  { id: 11, name: 'Hublot Classic Fusion',      brand: 'Hublot',              category: 'aaa',         style: 'sport',  gender: 'муж',     price: 300,  diameter: 42,   glass: 'минеральное', water: 50,  reserve: 40, movement: 'автоподзавод', inStock: true,  dial: ['#1b1b1f', '#0a0a0c'], accent: '#d4af6a' },
  { id: 12, name: 'Orient Bambino',             brand: 'Orient',              category: 'original',    style: 'dress',  gender: 'муж',     price: 300,  diameter: 40.5, glass: 'минеральное', water: 30,  reserve: 40, movement: 'автоподзавод', inStock: true,  dial: ['#efe8d8', '#c9bfa8'], accent: '#8a6d3b' },
  { id: 13, name: 'FC Moonphase Limited',       brand: 'Frederique Constant', category: 'original',    style: 'dress',  gender: 'муж',     price: 2000, diameter: 40,   glass: 'сапфировое',  water: 50,  reserve: 38, movement: 'автоподзавод', inStock: true,  dial: ['#101a30', '#070b15'], accent: '#f0d9a8' },
  { id: 14, name: 'Longines Conquest V.H.P.',   brand: 'Longines',            category: 'original',    style: 'sport',  gender: 'муж',     price: 1100, diameter: 41,   glass: 'сапфировое',  water: 100, reserve: 0,  movement: 'кварц',        inStock: true,  dial: ['#22262c', '#0c0e11'], accent: '#d4af6a' },
  { id: 15, name: 'Rolex GMT-Master II',        brand: 'Rolex',               category: 'clone-swiss', style: 'diver',  gender: 'муж',     price: 820,  diameter: 40,   glass: 'сапфировое',  water: 100, reserve: 70, movement: 'автоподзавод', inStock: false, dial: ['#1a1030', '#0b0616'], accent: '#e07a7a' },
  { id: 16, name: 'Cartier Santos Medium',      brand: 'Cartier',             category: 'aaaa',        style: 'dress',  gender: 'жен',     price: 480,  diameter: 35,   glass: 'сапфировое',  water: 100, reserve: 42, movement: 'автоподзавод', inStock: true,  dial: ['#ece7dc', '#c4bca9'], accent: '#8a6d3b' },
  { id: 17, name: 'Breitling Superocean Heritage B31', brand: 'Breitling',      category: 'original',    style: 'diver',  gender: 'муж',     price: 4200, diameter: 44,   glass: 'сапфировое',  water: 200, reserve: 78, movement: 'автоподзавод', inStock: true,  dial: ['#1b2029', '#0a0c11'], accent: '#6ab3d4' },
]

export const products: Product[] = rawProducts.map(p => ({
  ...p,
  stock: START_STOCK[p.id] ?? 6,
  discount: 0,
}))

export const brands = [...new Set(products.map(p => p.brand))].sort()

/* ============ CRM: клиенты ============ */
export type Client = {
  id: number; name: string; phone: string
  level: 'Silver' | 'Gold' | 'Platinum'
  points: number; ltv: number; lastVisit: string
}

export const clients: Client[] = [
  { id: 1, name: 'Азиз Каримов',      phone: '+998 90 123 45 67', level: 'Gold',     points: 1240, ltv: 4150, lastVisit: 'сегодня' },
  { id: 2, name: 'Дильноза Юсупова',  phone: '+998 93 220 18 44', level: 'Platinum', points: 3820, ltv: 9600, lastVisit: 'вчера' },
  { id: 3, name: 'Тимур Рахимов',     phone: '+998 97 401 77 02', level: 'Silver',   points: 310,  ltv: 850,  lastVisit: '2 дня назад' },
  { id: 4, name: 'Малика Ахмедова',   phone: '+998 90 555 90 31', level: 'Gold',     points: 1780, ltv: 5200, lastVisit: 'сегодня' },
  { id: 5, name: 'Жасур Ибрагимов',   phone: '+998 94 118 23 65', level: 'Silver',   points: 150,  ltv: 500,  lastVisit: '5 дней назад' },
  { id: 6, name: 'Нодира Салимова',   phone: '+998 99 812 40 19', level: 'Gold',     points: 990,  ltv: 3300, lastVisit: 'вчера' },
  { id: 7, name: 'Сардор Тошматов',   phone: '+998 91 733 55 80', level: 'Silver',   points: 420,  ltv: 1300, lastVisit: '3 дня назад' },
  { id: 8, name: 'Камола Нуриддинова', phone: '+998 95 640 12 97', level: 'Platinum', points: 2650, ltv: 7450, lastVisit: 'сегодня' },
]

/* ============ CRM: интересы (кто что смотрел N раз) ============ */
export type Interest = { clientId: number; productId: number; views: number; lastSeen: string; discountSent: boolean }

export const interests: Interest[] = [
  { clientId: 1, productId: 2,  views: 6, lastSeen: '20 мин назад',  discountSent: false },
  { clientId: 4, productId: 13, views: 5, lastSeen: '1 час назад',   discountSent: false },
  { clientId: 2, productId: 7,  views: 4, lastSeen: 'сегодня, 11:40', discountSent: true },
  { clientId: 8, productId: 16, views: 4, lastSeen: 'сегодня, 10:05', discountSent: false },
  { clientId: 3, productId: 9,  views: 3, lastSeen: 'вчера, 21:12',   discountSent: false },
  { clientId: 6, productId: 1,  views: 3, lastSeen: 'вчера, 18:30',   discountSent: true },
  { clientId: 7, productId: 11, views: 3, lastSeen: '2 дня назад',    discountSent: false },
]

/* ============ CRM: аналитика просмотров за 7 дней ============ */
export const views7d: { productId: number; views: number }[] = [
  { productId: 5,  views: 312 },
  { productId: 2,  views: 264 },
  { productId: 7,  views: 231 },
  { productId: 8,  views: 198 },
  { productId: 1,  views: 175 },
  { productId: 10, views: 142 },
  { productId: 13, views: 118 },
  { productId: 9,  views: 96 },
]

export const dailyVisits = [
  { day: 'Чт', visits: 214 }, { day: 'Пт', visits: 268 }, { day: 'Сб', visits: 342 },
  { day: 'Вс', visits: 301 }, { day: 'Пн', visits: 190 }, { day: 'Вт', visits: 226 }, { day: 'Ср', visits: 254 },
]

/* ============ CRM: лист ожидания / спрос ============ */
export type Demand = { id: number; model: string; brand: string; queue: number; deposits: number; avgBudget: number }

export const demand: Demand[] = [
  { id: 1, model: 'Rolex Submariner Date (оригинал)', brand: 'Rolex',  queue: 14, deposits: 3, avgBudget: 12500 },
  { id: 2, model: 'Patek Philippe Aquanaut (1:1 swiss)', brand: 'Patek Philippe', queue: 9, deposits: 2, avgBudget: 900 },
  { id: 3, model: 'Omega Speedmaster Moonwatch (оригинал)', brand: 'Omega', queue: 7, deposits: 1, avgBudget: 6800 },
  { id: 4, model: 'Rolex GMT-Master II «Pepsi» (1:1 swiss)', brand: 'Rolex', queue: 6, deposits: 2, avgBudget: 850 },
  { id: 5, model: 'Cartier Tank Must (оригинал)', brand: 'Cartier', queue: 5, deposits: 0, avgBudget: 3100 },
]

/* ============ CRM: продажи (для отчёта и создания заказов) ============ */
export type Sale = {
  id: number
  date: string      // YYYY-MM-DD
  time: string      // HH:MM
  productId: number
  clientId: number
  discountPct: number
}

/**
 * История продаж с 1 января 2026 по сегодня (демо: 03.07.2026).
 * Генерация детерминированная (фиксированный seed) — при каждом запуске одни и те же данные.
 * Реалистичный разброс: есть дни без продаж, обычно 1–2, в выходные больше,
 * всплески в праздники (14 февраля, 8 марта, Навруз 21 марта).
 */
function genSales(): Sale[] {
  let seed = 20260703
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648 }
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]

  const ids = products.map(p => p.id)
  const out: Sale[] = []
  let id = 1

  const spikes: Record<string, number> = { '2026-02-14': 5, '2026-03-08': 9, '2026-03-21': 6 }

  const d = new Date(2026, 0, 1)
  const end = new Date(2026, 6, 2) // по 2 июля; 3 июля добавляем вручную ниже
  while (d <= end) {
    const date = `2026-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const weekend = d.getDay() === 0 || d.getDay() === 6
    let n: number
    if (spikes[date] !== undefined) n = spikes[date]
    else {
      const r = rnd()
      if (r < (weekend ? 0.12 : 0.30)) n = 0            // день без продаж
      else if (r < (weekend ? 0.45 : 0.68)) n = 1
      else if (r < (weekend ? 0.80 : 0.91)) n = 2
      else if (r < 0.97) n = 3
      else n = 4 + Math.floor(rnd() * 3)                 // редкий всплеск 4–6
    }
    for (let i = 0; i < n; i++) {
      out.push({
        id: id++, date,
        time: `${11 + Math.floor(rnd() * 10)}:${String(Math.floor(rnd() * 60)).padStart(2, '0')}`,
        productId: pick(ids),
        clientId: 1 + Math.floor(rnd() * clients.length),
        discountPct: rnd() < 0.16 ? pick([5, 10, 15]) : 0,
      })
    }
    d.setDate(d.getDate() + 1)
  }

  // сегодняшний день — фиксированный, чтобы демо всегда открывалось с продажами
  out.push(
    { id: id++, date: '2026-07-03', time: '11:45', productId: 2,  clientId: 1, discountPct: 10 },
    { id: id++, date: '2026-07-03', time: '12:30', productId: 11, clientId: 5, discountPct: 0 },
    { id: id++, date: '2026-07-03', time: '18:20', productId: 6,  clientId: 4, discountPct: 0 },
  )
  return out.reverse()
}

export const salesMock: Sale[] = genSales()

/* PIN-код владельца для проведения скидки при продаже (демо) */
export const DISCOUNT_PIN = '2468'

/* ============ CRM: приближающееся ТО ============ */
export type ServiceDue = {
  id: number; clientId: number; model: string; serial: string
  purchased: string; due: string; daysLeft: number; reminded: boolean
}

export const serviceDue: ServiceDue[] = [
  { id: 1, clientId: 1, model: 'Tissot Seastar 1000',      serial: 'TS-2508-0341', purchased: '14.08.2025', due: '14.08.2026', daysLeft: 43, reminded: false },
  { id: 2, clientId: 2, model: 'FC Moonphase Limited',      serial: 'FC-2507-1102', purchased: '22.07.2025', due: '22.07.2026', daysLeft: 20, reminded: false },
  { id: 3, clientId: 4, model: 'Longines HydroConquest',    serial: 'LG-2509-0877', purchased: '03.09.2025', due: '03.09.2026', daysLeft: 63, reminded: true },
  { id: 4, clientId: 6, model: 'Alpina Startimer Pilot',    serial: 'AL-2508-0219', purchased: '29.08.2025', due: '29.08.2026', daysLeft: 58, reminded: false },
]

/* ============ Личный кабинет: Азиз Каримов ============ */
export type Purchase = {
  id: number; productId: number; date: string; price: number
  serial: string; ref: string; warrantyUntil: string; nextService: string; daysToService: number
  history: { date: string; what: string }[]
}

export const myPurchases: Purchase[] = [
  {
    id: 1, productId: 1, date: '14.08.2025', price: 850,
    serial: 'TS-2508-0341', ref: 'T120.607.11.041.02', warrantyUntil: '14.08.2027',
    nextService: '14.08.2026', daysToService: 43,
    history: [{ date: '14.08.2025', what: 'Покупка · выдан цифровой паспорт' }],
  },
  {
    id: 2, productId: 3, date: '02.12.2024', price: 1300,
    serial: 'FC-2412-0958', ref: 'FC-303NB5B6', warrantyUntil: '02.12.2026',
    nextService: '02.12.2025', daysToService: -212,
    history: [
      { date: '02.12.2024', what: 'Покупка · выдан цифровой паспорт' },
      { date: '28.11.2025', what: 'Плановое ТО: чистка механизма, замена прокладок' },
    ],
  },
]

/* ============ Цифровые паспорта часов (по QR) ============ */
export type PassportInfo = {
  serial: string
  purchaseId: number
  recordNo: string          // № записи в реестре бутика
  producedDate: string      // дата производства
  caliber: string
  jewels: number
  frequency: string
  warrantyMonths: number
  serviceIntervalYears: number   // полное ТО
  waterCheckMonths: number       // проверка водозащиты
  freeVisitsTotal: number        // бесплатных визитов в первый год
  freeVisitsUsed: number
  verifiedDate: string
  verifiedBy: string
}

export const passports: PassportInfo[] = [
  {
    serial: 'TS-2508-0341', purchaseId: 1, recordNo: 'CHS-2025-00847',
    producedDate: '03.2025', caliber: 'Powermatic 80.111 (автоподзавод)', jewels: 23, frequency: '21 600 пк/ч (3 Гц)',
    warrantyMonths: 24, serviceIntervalYears: 4, waterCheckMonths: 12,
    freeVisitsTotal: 2, freeVisitsUsed: 0,
    verifiedDate: '14.08.2025', verifiedBy: 'Бутик CHASI.UZ · Ташкент, Мирабад 12',
  },
  {
    serial: 'FC-2412-0958', purchaseId: 2, recordNo: 'CHS-2024-00512',
    producedDate: '09.2024', caliber: 'FC-303 (автоподзавод)', jewels: 26, frequency: '28 800 пк/ч (4 Гц)',
    warrantyMonths: 24, serviceIntervalYears: 4, waterCheckMonths: 12,
    freeVisitsTotal: 2, freeVisitsUsed: 1,
    verifiedDate: '02.12.2024', verifiedBy: 'Бутик CHASI.UZ · Ташкент, Мирабад 12',
  },
]

export type WishItem = { id: number; model: string; inStock: boolean; queuePos?: number; note: string }

export const myWishlist: WishItem[] = [
  { id: 1, model: 'Rolex Submariner Date (оригинал)', inStock: false, queuePos: 4,  note: 'Вы в листе ожидания. Сообщим в день поступления.' },
  { id: 2, model: 'Omega Seamaster Diver 300M',       inStock: true,               note: 'В наличии в бутике — забронировать?' },
  { id: 3, model: 'Longines HydroConquest 41мм',      inStock: true,               note: 'Вы смотрели эту модель 6 раз — доступна скидка −10%.' },
]

export const myNotifications = [
  { id: 1, title: 'Пора на ТО ✦', body: 'Вашему Tissot Seastar 1000 (TS-2508-0341) через 43 дня исполнится год. Рекомендуем плановое обслуживание механизма — запишитесь на удобное время.', date: '02.07.2026, 09:00', kind: 'ТО' },
  { id: 2, title: 'Персональная скидка −10%', body: 'Вы несколько раз смотрели Longines HydroConquest. Дарим скидку −10%, действует 48 часов. Промокод: AZIZ-LNG10.', date: '01.07.2026, 18:22', kind: 'Скидка' },
  { id: 3, title: 'Товар из wishlist в наличии', body: 'Omega Seamaster Diver 300M снова в бутике. Вы в списке первых — бронь действует 72 часа.', date: '29.06.2026, 12:10', kind: 'Wishlist' },
  { id: 4, title: 'Начислены баллы', body: '+124 балла за покупку. Ваш уровень: Gold. До Platinum осталось 2 760 баллов.', date: '14.08.2025, 15:47', kind: 'Баллы' },
]

/* ============ ПОДАРОЧНЫЙ БОКС (доп. услуга при оформлении) ============ */
export const GIFT_BOX = {
  price: 25,
  title: 'Подарочный бокс CHASI.UZ',
  desc: 'Премиальная коробка с ложементом, фирменная лента, открытка с рукописным пожеланием и пакет для переноски. Часы будут выглядеть презентабельно как подарок.',
}

/* ============ ПОДАРОЧНЫЕ НАБОРЫ (кастомные комплекты к часам) ============ */
export type GiftSet = {
  id: number
  name: string
  tagline: string
  price: number
  items: string[]           // что входит
  dial: [string, string]    // для визуала-заглушки
  accent: string
  popular?: boolean
}

export const giftSets: GiftSet[] = [
  {
    id: 101, name: 'Набор «Джентльмен»', tagline: 'Классика для делового подарка', price: 60,
    items: ['Подарочный бокс с ложементом', 'Кожаный чехол для часов', 'Салфетка из микрофибры', 'Открытка с пожеланием'],
    dial: ['#2b2118', '#120d08'], accent: '#d4af6a', popular: true,
  },
  {
    id: 102, name: 'Набор «Дайвер»', tagline: 'Для активных и спортивных', price: 75,
    items: ['Влагозащищённый бокс', 'Запасной каучуковый ремешок', 'Инструмент для смены ремешка', 'Фирменная наклейка'],
    dial: ['#0e2a1e', '#05130c'], accent: '#7fc97f',
  },
  {
    id: 103, name: 'Набор «Престиж»', tagline: 'Максимально презентабельно', price: 120,
    items: ['Премиальный бокс из эко-кожи', 'Шкатулка-подставка для часов', 'Средство для чистки', 'Сертификат подлинности в рамке', 'Открытка + лента'],
    dial: ['#16213a', '#090d18'], accent: '#6ab3d4', popular: true,
  },
  {
    id: 104, name: 'Набор «Она»', tagline: 'Нежный подарок для неё', price: 70,
    items: ['Подарочный бокс пастельных тонов', 'Мини-шкатулка для украшений', 'Открытка с пожеланием', 'Фирменная лента'],
    dial: ['#ece7dc', '#c4bca9'], accent: '#c98aa8',
  },
]

/* ============ КОРЗИНА И ЗАКАЗЫ С САЙТА (localStorage, без сервера) ============ */
export type CartItem = {
  productId: number
  qty: number
}

export type PaymentMethod = 'payme' | 'click' | 'cod'
export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  payme: 'Payme',
  click: 'Click',
  cod: 'Оплата при получении',
}

export type OrderStatus = 'новый' | 'оформлен'

export type OnlineOrder = {
  id: string
  createdAt: string          // ISO
  items: CartItem[]
  giftBox: boolean
  giftSetId: number | null
  payment: PaymentMethod
  customer: { name: string; phone: string; address: string; comment: string }
  itemsTotal: number         // сумма часов
  extrasTotal: number        // бокс + набор
  total: number
  status: OrderStatus
}

/* ============ Записи на ТО (клиент записывается с витрины) ============ */
export type BookingStatus = 'новая' | 'подтверждена' | 'отказано'
export type ServiceBooking = {
  id: string
  createdAt: string      // ISO
  name: string
  phone: string
  watch: string          // бренд / модель, свободный ввод
  year: number
  date: string           // YYYY-MM-DD — выбранный день
  status: BookingStatus
  rejectReason?: string  // причина отказа
}

/* Демо-записи на ТЕКУЩУЮ неделю (даты считаются от реальной даты).
   Статус «подтверждена» — чтобы график был заполнен, но счётчик НОВЫХ
   заявок стартовал с нуля; новые появляются только при реальной заявке. */
const _pad = (n: number) => String(n).padStart(2, '0')
function _weekDay(offset: number): string {
  const d = new Date()
  const wd = (d.getDay() + 6) % 7      // 0 = понедельник
  d.setDate(d.getDate() - wd + offset) // понедельник текущей недели + offset
  return `${d.getFullYear()}-${_pad(d.getMonth() + 1)}-${_pad(d.getDate())}`
}

export const serviceBookings: ServiceBooking[] = [
  { id: 'SB-9001', createdAt: _weekDay(0) + 'T09:10:00', name: 'Тимур Рахимов',      phone: '+998 97 401 77 02', watch: 'Tissot Seastar 1000',   year: 2024, date: _weekDay(0), status: 'подтверждена' },
  { id: 'SB-9002', createdAt: _weekDay(1) + 'T11:40:00', name: 'Дильноза Юсупова',   phone: '+998 93 220 18 44', watch: 'Longines HydroConquest', year: 2023, date: _weekDay(1), status: 'подтверждена' },
  { id: 'SB-9003', createdAt: _weekDay(2) + 'T13:05:00', name: 'Малика Ахмедова',    phone: '+998 90 555 90 31', watch: 'FC Classics',           year: 2022, date: _weekDay(2), status: 'подтверждена' },
  { id: 'SB-9004', createdAt: _weekDay(3) + 'T15:20:00', name: 'Нодира Салимова',    phone: '+998 99 812 40 19', watch: 'Rolex Datejust 36',     year: 2025, date: _weekDay(3), status: 'подтверждена' },
  { id: 'SB-9005', createdAt: _weekDay(4) + 'T10:30:00', name: 'Сардор Тошматов',    phone: '+998 91 733 55 80', watch: 'Alpina Startimer',      year: 2023, date: _weekDay(4), status: 'подтверждена' },
  { id: 'SB-9006', createdAt: _weekDay(5) + 'T16:15:00', name: 'Камола Нуриддинова', phone: '+998 95 640 12 97', watch: 'Cartier Santos Medium', year: 2024, date: _weekDay(5), status: 'подтверждена' },
]
