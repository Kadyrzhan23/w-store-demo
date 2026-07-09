import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clients, Client, demand, DISCOUNT_OPTIONS, DISCOUNT_PIN, giftSets, GIFT_BOX, interests, OnlineOrder, PAYMENT_LABEL, products, Sale, salesMock, serviceDue, views7d, dailyVisits } from '../data/mock'
import { updateOrderStatus, useOrders } from '../store/orders'
import { effectivePrice, isLowStock, setDiscount, setStock, useProducts } from '../store/products'
import { setBookingStatus, useBookings } from '../store/bookings'
import { toast } from '../toast'

type Tab = 'dash' | 'products' | 'weborders' | 'bookings' | 'neworder' | 'sales' | 'interest' | 'demand' | 'service' | 'clients'

type Prefill = { productId: number; clientId: number; orderId?: string }

const DEMO_TODAY = '2026-07-03'
const money = (n: number) => n.toLocaleString('ru-RU') + ' $'

const prod = (id: number) => products.find(p => p.id === id)!
const client = (id: number) => clients.find(c => c.id === id)!

function Bars({ rows }: { rows: { name: string; value: number }[] }) {
  const [go, setGo] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGo(true), 120); return () => clearTimeout(t) }, [])
  const max = Math.max(...rows.map(r => r.value))
  return (
    <div>
      {rows.map(r => (
        <div className="bar-row" key={r.name}>
          <div className="nm">{r.name}</div>
          <div className="bar-wrap"><div className="bar" style={{ width: go ? `${(r.value / max) * 100}%` : 0 }} /></div>
          <div className="vv">{r.value}</div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Новый заказ ---------- */
function NewOrder({ onCreate, clientList, prefill, onProcessed }: {
  onCreate: (s: Sale) => void
  clientList: Client[]
  prefill: Prefill | null
  onProcessed: (orderId: string) => void
}) {
  const shopProducts = useProducts()
  const [clientId, setClientId] = useState('')
  const [productId, setProductId] = useState('')
  const [pin, setPin] = useState('')
  const [pinOk, setPinOk] = useState(false)
  const [discount, setDiscount] = useState(0)

  // автозаполнение при переходе с заказа с сайта
  useEffect(() => {
    if (prefill) {
      setProductId(String(prefill.productId))
      setClientId(String(prefill.clientId))
    }
  }, [prefill])

  const p = shopProducts.find(x => x.id === +productId)
  const total = p ? Math.round(p.price * (1 - discount / 100)) : 0

  const checkPin = () => {
    if (pin === DISCOUNT_PIN) {
      setPinOk(true)
      toast({ kind: 'gold', title: 'PIN подтверждён ✦', text: 'Скидка разблокирована. Каждое применение PIN фиксируется в журнале операций.' })
    } else {
      toast({ kind: 'gold', title: 'Неверный PIN', text: 'Скидку может провести только владелец или старший менеджер. Попытка записана в журнал.' })
      setPin('')
    }
  }

  const submit = () => {
    if (!clientId || !p) return
    onCreate({
      id: Date.now(), date: DEMO_TODAY,
      time: new Date().toTimeString().slice(0, 5),
      productId: p.id, clientId: +clientId, discountPct: discount,
    })
    const c = clientList.find(x => x.id === +clientId)!
    toast({
      title: 'Заказ оформлен ✦',
      text: `${c.name.split(' ')[0]}, спасибо за покупку! ${p.name} — ${money(total)}${discount ? ` (скидка −${discount}%)` : ''}. Цифровой паспорт часов уже в вашем кабинете. — так клиент получит чек в Telegram.`,
    })
    if (prefill?.orderId) onProcessed(prefill.orderId)
    setClientId(''); setProductId(''); setDiscount(0); setPin(''); setPinOk(false)
  }

  const lbl = { fontSize: '.68rem', letterSpacing: '.2em', textTransform: 'uppercase' as const, color: 'var(--gold)', display: 'block', marginBottom: 8 }

  return (
    <>
      <span className="sec-label">CRM · касса</span>
      <h2 style={{ marginBottom: 8 }}>Новый заказ</h2>
      <p className="muted" style={{ fontSize: '.82rem', marginBottom: 26, fontWeight: 300 }}>
        Один заказ — одни часы. Выберите модель, прикрепите клиента; скидка проводится только после PIN-кода владельца.
      </p>
      {prefill?.orderId && (
        <div className="prefill-note">
          ✦ Форма заполнена из заказа с сайта <b>{prefill.orderId}</b>. Проверьте данные и оформите продажу — заказ отметится как «оформлен».
        </div>
      )}
      <div className="panel" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>1 · Модель из магазина</label>
          <select className="select" style={{ width: '100%' }} value={productId} onChange={e => setProductId(e.target.value)}>
            <option value="">— выберите часы —</option>
            {shopProducts.filter(x => x.inStock).map(x => (
              <option key={x.id} value={x.id}>{x.brand} · {x.name} — {money(x.price)}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>2 · Аккаунт клиента</label>
          <select className="select" style={{ width: '100%' }} value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">— выберите клиента —</option>
            {clientList.map(c => <option key={c.id} value={c.id}>{c.name} · {c.phone} · {c.level}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>3 · Скидка (по PIN-коду владельца)</label>
          {!pinOk ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <input className="search-inp" style={{ marginBottom: 0, maxWidth: 160, letterSpacing: '.4em', textAlign: 'center' }}
                type="password" inputMode="numeric" maxLength={4} placeholder="••••"
                value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} />
              <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'center' }} onClick={checkPin} disabled={pin.length !== 4}>Подтвердить</button>
              <span className="muted" style={{ fontSize: '.68rem', alignSelf: 'center' }}>демо-PIN: 2468</span>
            </div>
          ) : (
            <div className="chips">
              {[0, 5, 10, 15, 20].map(d => (
                <button key={d} className={`chip ${discount === d ? 'on' : ''}`} onClick={() => setDiscount(d)}>
                  {d === 0 ? 'Без скидки' : `−${d}%`}
                </button>
              ))}
            </div>
          )}
        </div>
        {p && (
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
            <span className="muted" style={{ fontSize: '.8rem' }}>{p.name}{discount > 0 && <> · скидка −{discount}%</>}</span>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '1.9rem', color: 'var(--gold2)' }}>
              {discount > 0 && <s className="muted" style={{ fontSize: '1rem', marginRight: 12 }}>{money(p.price)}</s>}
              {money(total)}
            </span>
          </div>
        )}
        <button className="btn btn-gold" style={{ width: '100%', opacity: !clientId || !p ? 0.45 : 1 }} disabled={!clientId || !p} onClick={submit}>
          Оформить заказ
        </button>
      </div>
    </>
  )
}

/* ---------- Продажи за день / месяц ---------- */
function SalesReport({ sales, clientList }: { sales: Sale[]; clientList: Client[] }) {
  const [mode, setMode] = useState<'day' | 'month'>('day')
  const [day, setDay] = useState(DEMO_TODAY)
  const [month, setMonth] = useState(DEMO_TODAY.slice(0, 7))

  const rows = useMemo(
    () => sales
      .filter(s => (mode === 'day' ? s.date === day : s.date.startsWith(month)))
      .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [sales, mode, day, month],
  )
  const withTotals = rows.map(s => {
    const p = products.find(x => x.id === s.productId)!
    return { ...s, p, price: p.price, total: Math.round(p.price * (1 - s.discountPct / 100)) }
  })
  const turnover = withTotals.reduce((a, s) => a + s.price, 0)
  const revenue = withTotals.reduce((a, s) => a + s.total, 0)

  return (
    <>
      <span className="sec-label">CRM · отчёт</span>
      <h2 style={{ marginBottom: 22 }}>Продажи</h2>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 26, flexWrap: 'wrap' }}>
        <div className="chips">
          <button className={`chip ${mode === 'day' ? 'on' : ''}`} onClick={() => setMode('day')}>За день</button>
          <button className={`chip ${mode === 'month' ? 'on' : ''}`} onClick={() => setMode('month')}>За месяц</button>
        </div>
        {mode === 'day'
          ? <input className="select" type="date" value={day} onChange={e => setDay(e.target.value)} />
          : <input className="select" type="month" value={month} onChange={e => setMonth(e.target.value)} />}
        <span className="muted" style={{ fontSize: '.72rem' }}>история продаж: с 1 января 2026 — есть дни с 0, 1–2 и до 9 продаж</span>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="v">{rows.length}</div><div className="l">продаж</div></div>
        <div className="kpi"><div className="v">{money(turnover)}</div><div className="l">оборот (до скидок)</div></div>
        <div className="kpi"><div className="v">{money(turnover - revenue)}</div><div className="l">скидки</div></div>
        <div className="kpi"><div className="v">{money(revenue)}</div><div className="l">выручка (итог)</div></div>
      </div>

      {rows.length === 0 ? (
        <div className="empty">За выбранный период продаж нет.</div>
      ) : (
        <table className="tbl">
          <thead><tr><th>Дата · время</th><th>Товар</th><th>Клиент</th><th>Цена</th><th>Скидка</th><th>Итог</th></tr></thead>
          <tbody>
            {withTotals.map(s => {
              const c = clientList.find(x => x.id === s.clientId)
              return (
                <tr key={s.id}>
                  <td className="muted">{s.date.split('-').reverse().join('.')} · {s.time}</td>
                  <td>{s.p.brand} {s.p.name}</td>
                  <td>{c ? c.name : '—'}</td>
                  <td>{money(s.price)}</td>
                  <td>{s.discountPct > 0 ? <span className="pill y">−{s.discountPct}%</span> : <span className="muted">—</span>}</td>
                  <td style={{ color: 'var(--gold2)' }}>{money(s.total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </>
  )
}

/* ---------- Управление товарами ---------- */
type PFilter = 'all' | 'in' | 'order' | 'sale' | 'low'
const PFILTER_LABEL: Record<PFilter, string> = {
  all: 'Все', in: 'В наличии', order: 'Под заказ', sale: 'Со скидкой', low: 'Мало осталось',
}

function ProductsAdmin() {
  const navigate = useNavigate()
  const list = useProducts()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<PFilter>('all')

  const rows = useMemo(() => list.filter(p => {
    if (q && !(p.name + ' ' + p.brand).toLowerCase().includes(q.toLowerCase())) return false
    if (filter === 'in' && !p.inStock) return false
    if (filter === 'order' && p.inStock) return false
    if (filter === 'sale' && p.discount === 0) return false
    if (filter === 'low' && !isLowStock(p)) return false
    return true
  }), [list, q, filter])

  const lowCount = list.filter(isLowStock).length
  const saleCount = list.filter(p => p.discount > 0).length

  return (
    <>
      <span className="sec-label">CRM · склад</span>
      <h2 style={{ marginBottom: 8 }}>Продукты</h2>
      <p className="muted" style={{ fontSize: '.82rem', marginBottom: 22, fontWeight: 300 }}>
        Все товары из базы магазина. Меняйте статус наличия, остаток и скидку — изменения сразу
        видны клиентам на сайте. Мало осталось: <b style={{ color: 'var(--gold2)' }}>{lowCount}</b> ·
        со скидкой: <b style={{ color: 'var(--gold2)' }}>{saleCount}</b>.
      </p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
        <input className="search-inp" style={{ marginBottom: 0, maxWidth: 280 }} placeholder="Поиск: модель или бренд…" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips">
          {(Object.keys(PFILTER_LABEL) as PFilter[]).map(f => (
            <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{PFILTER_LABEL[f]}</button>
          ))}
        </div>
        <span className="muted" style={{ fontSize: '.72rem' }}>найдено: {rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">Ничего не найдено по этому фильтру.</div>
      ) : (
        <div className="prod-admin">
          {rows.map(p => (
            <div className="prow" key={p.id}>
              <div className="prow-name">
                <b>{p.name}</b>
                <div className="muted" style={{ fontSize: '.72rem' }}>{p.brand} · ⌀{p.diameter}мм</div>
                <div className="prow-price">
                  {p.discount > 0
                    ? <><s className="muted" style={{ fontSize: '.8rem', marginRight: 8 }}>{money(p.price)}</s><b style={{ color: 'var(--gold2)' }}>{money(effectivePrice(p))}</b></>
                    : money(p.price)}
                </div>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => navigate(`/admin/product/${p.id}`)}>✎ Изменить</button>
              </div>

              <div className="prow-ctrl">
                <div className="prow-label">Статус</div>
                <div>
                  {p.stock === 0
                    ? <span className="pill r">под заказ</span>
                    : isLowStock(p)
                      ? <span className="pill y">осталось {p.stock}</span>
                      : <span className="pill g">в наличии</span>}
                  <div className="muted" style={{ fontSize: '.66rem', marginTop: 6 }}>по остатку</div>
                </div>
              </div>

              <div className="prow-ctrl">
                <div className="prow-label">Остаток</div>
                <div className="stepper">
                  <button onClick={() => setStock(p.id, p.stock - 1)} disabled={p.stock <= 0}>−</button>
                  <span>{p.stock} шт.</span>
                  <button onClick={() => setStock(p.id, p.stock + 1)}>+</button>
                </div>
              </div>

              <div className="prow-ctrl">
                <div className="prow-label">Скидка</div>
                <div className="chips">
                  {DISCOUNT_OPTIONS.map(d => (
                    <button key={d} className={`chip ${p.discount === d ? 'on' : ''}`} onClick={() => setDiscount(p.id, d)}>
                      {d === 0 ? 'Нет' : `−${d}%`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- Заказы с сайта ---------- */
function WebOrders({ orders, onProcess }: { orders: OnlineOrder[]; onProcess: (o: OnlineOrder) => void }) {
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} · ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }
  return (
    <>
      <span className="sec-label">CRM · онлайн-канал</span>
      <h2 style={{ marginBottom: 8 }}>Заказы с сайта</h2>
      <p className="muted" style={{ fontSize: '.82rem', marginBottom: 26, fontWeight: 300 }}>
        Заявки, оформленные клиентами на сайте. Нажмите «Оформить в кассе» — откроется форма нового заказа
        с уже заполненными клиентом и моделью. Осталось подтвердить и провести продажу.
      </p>

      {orders.length === 0 ? (
        <div className="empty">Пока нет заказов с сайта. Оформите заказ в корзине — он появится здесь.</div>
      ) : (
        <div className="weborders">
          {orders.map(o => {
            const gs = giftSets.find(g => g.id === o.giftSetId)
            return (
              <div className={`panel weborder ${o.status === 'новый' ? 'is-new' : ''}`} key={o.id}>
                <div className="weborder-top">
                  <div>
                    <b style={{ color: 'var(--gold2)', fontSize: '1.05rem' }}>Заказ {o.id}</b>
                    <div className="muted" style={{ fontSize: '.72rem', marginTop: 4 }}>{fmt(o.createdAt)}</div>
                  </div>
                  {o.status === 'новый'
                    ? <span className="pill y">новый</span>
                    : <span className="pill g">оформлен ✓</span>}
                </div>

                <div className="weborder-body">
                  <div>
                    <div className="wo-label">Клиент</div>
                    <div>{o.customer.name}</div>
                    <div className="muted" style={{ fontSize: '.76rem' }}>{o.customer.phone}</div>
                    {o.customer.address && <div className="muted" style={{ fontSize: '.76rem' }}>{o.customer.address}</div>}
                    {o.customer.comment && <div className="muted" style={{ fontSize: '.72rem', marginTop: 4 }}>💬 {o.customer.comment}</div>}
                  </div>
                  <div>
                    <div className="wo-label">Состав</div>
                    {o.items.map(i => (
                      <div key={i.productId}>{prod(i.productId).brand} {prod(i.productId).name} × {i.qty}</div>
                    ))}
                    {o.giftBox && <div className="muted" style={{ fontSize: '.78rem' }}>+ {GIFT_BOX.title}</div>}
                    {gs && <div className="muted" style={{ fontSize: '.78rem' }}>+ Набор «{gs.name}»</div>}
                  </div>
                  <div>
                    <div className="wo-label">Оплата</div>
                    <div>{PAYMENT_LABEL[o.payment]}</div>
                    <div className="wo-label" style={{ marginTop: 12 }}>Сумма</div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--gold2)' }}>{money(o.total)}</div>
                  </div>
                </div>

                <div className="weborder-foot">
                  {o.status === 'новый'
                    ? <button className="btn btn-gold btn-sm" onClick={() => onProcess(o)}>Оформить в кассе →</button>
                    : <span className="muted" style={{ fontSize: '.76rem' }}>Проведён через кассу</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

/* ---------- Записи на ТО ---------- */
const DOW = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const pad2 = (n: number) => String(n).padStart(2, '0')
const isoDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const statusPill = (s: string) => (s === 'подтверждена' ? 'g' : s === 'отказано' ? 'r' : 'y')
const mondayOf = (src: Date) => {
  const d = new Date(src)
  const wd = (d.getDay() + 6) % 7 // 0 = Пн
  d.setDate(d.getDate() - wd)
  d.setHours(0, 0, 0, 0)
  return d
}
const REJECT_REASONS = ['Нет запчастей', 'Часы не на гарантии', 'Занят мастер', 'Неверные данные']

function ServiceBookings() {
  const bookings = useBookings()
  const newCount = bookings.filter(b => b.status === 'новая').length
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [weekOffset, setWeekOffset] = useState(0) // 0 = текущая неделя

  // График открывается на текущей неделе; ◀ ▶ листают недели
  const weekStart = mondayOf(new Date())
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const list = [...bookings].sort((a, b) => (b.date + b.createdAt).localeCompare(a.date + a.createdAt))

  const confirm = (b: typeof bookings[number]) => {
    setBookingStatus(b.id, 'подтверждена')
    toast({ title: 'Запись подтверждена ✦', text: `${b.name.split(' ')[0]}, ждём вас ${b.date.split('-').reverse().join('.')} на ТО «${b.watch}». — так уведомление придёт клиенту.` })
  }

  const doReject = () => {
    if (!rejectId || !reason.trim()) return
    const b = bookings.find(x => x.id === rejectId)
    setBookingStatus(rejectId, 'отказано', reason.trim())
    toast({ title: 'Заявка отклонена', text: `${b?.name.split(' ')[0] ?? ''}: в записи на ТО отказано — ${reason.trim()}. — так уведомление придёт клиенту.` })
    setRejectId(null); setReason('')
  }

  return (
    <>
      <span className="sec-label">CRM · сервис</span>
      <h2 style={{ marginBottom: 8 }}>Записи на ТО</h2>
      <p className="muted" style={{ fontSize: '.82rem', marginBottom: 24, fontWeight: 300 }}>
        Заявки клиентов на обслуживание с сайта и из кабинета. Новых заявок: <b style={{ color: 'var(--gold2)' }}>{newCount}</b>.
      </p>

      {/* график недели */}
      <div className="panel">
        <div className="week-nav">
          <button className="week-arrow" title="Предыдущая неделя" onClick={() => setWeekOffset(o => o - 1)}>◀</button>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ marginBottom: 2 }}>График записей</h3>
            <div className="sub" style={{ marginBottom: 0 }}>
              {pad2(weekStart.getDate())}.{pad2(weekStart.getMonth() + 1)} — {pad2(days[6].getDate())}.{pad2(days[6].getMonth() + 1)}
              {weekOffset === 0 && <span style={{ color: 'var(--gold)' }}> · текущая</span>}
            </div>
          </div>
          <button className="week-arrow" title="Следующая неделя" onClick={() => setWeekOffset(o => o + 1)}>▶</button>
        </div>
        {weekOffset !== 0 && (
          <button className="reset-btn" style={{ marginBottom: 12 }} onClick={() => setWeekOffset(0)}>← к текущей неделе</button>
        )}
        <div className="week-grid">
          {days.map(d => {
            const iso = isoDate(d)
            const dayB = bookings.filter(b => b.date === iso)
            return (
              <div className="week-col" key={iso}>
                <div className="week-head">{DOW[d.getDay()]}<span>{pad2(d.getDate())}.{pad2(d.getMonth() + 1)}</span></div>
                <div className="week-body">
                  {dayB.length === 0 && <div className="week-empty">—</div>}
                  {dayB.map(b => {
                    const cls = b.status === 'новая' ? 'is-new' : b.status === 'отказано' ? 'is-rejected' : ''
                    return (
                      <div className={`week-item ${cls}`} key={b.id} title={`${b.name} · ${b.phone}${b.rejectReason ? ' · отказ: ' + b.rejectReason : ''}`}>
                        <b>{b.name.split(' ')[0]}</b>
                        <span>{b.watch}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* полный список */}
      {list.length === 0 ? (
        <div className="empty">Пока нет записей на ТО. Оформите заявку на сайте или в кабинете — она появится здесь.</div>
      ) : (
        <table className="tbl" style={{ marginTop: 22 }}>
          <thead><tr><th>Дата</th><th>Клиент</th><th>Часы · год</th><th>Статус</th><th>Действие</th></tr></thead>
          <tbody>
            {list.map(b => (
              <tr key={b.id} style={b.status === 'новая' ? { background: 'rgba(212,175,106,.04)' } : undefined}>
                <td className="muted">{b.date.split('-').reverse().join('.')}</td>
                <td>{b.name}<div className="muted" style={{ fontSize: '.7rem' }}>{b.phone}</div></td>
                <td>{b.watch}<div className="muted" style={{ fontSize: '.7rem' }}>{b.year || '—'}</div></td>
                <td>
                  <span className={`pill ${statusPill(b.status)}`}>{b.status}</span>
                  {b.status === 'отказано' && b.rejectReason && <div className="muted" style={{ fontSize: '.68rem', marginTop: 4 }}>{b.rejectReason}</div>}
                </td>
                <td>
                  {b.status === 'новая'
                    ? <div className="act-cell">
                        <button className="btn btn-gold btn-sm" onClick={() => confirm(b)}>Подтвердить</button>
                        <button className="reject-btn" title="Отказать" onClick={() => { setRejectId(b.id); setReason('') }}>✕</button>
                      </div>
                    : <span className="muted" style={{ fontSize: '.72rem' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* модалка отказа */}
      {rejectId && (
        <div className="overlay" onClick={() => setRejectId(null)}>
          <div className="reject-modal" onClick={e => e.stopPropagation()}>
            <span className="sec-label">Отказ в записи</span>
            <h3 style={{ marginBottom: 6 }}>Причина отказа</h3>
            <p className="muted" style={{ fontSize: '.8rem', fontWeight: 300, marginBottom: 16 }}>Клиент получит уведомление с указанной причиной.</p>
            <div className="chips" style={{ marginBottom: 12 }}>
              {REJECT_REASONS.map(r => (
                <button key={r} className={`chip ${reason === r ? 'on' : ''}`} onClick={() => setReason(r)}>{r}</button>
              ))}
            </div>
            <textarea className="search-inp" style={{ minHeight: 80, resize: 'vertical', marginBottom: 16 }} placeholder="Или своя причина…" value={reason} onChange={e => setReason(e.target.value)} />
            <div className="product-actions">
              <button className="btn btn-gold" style={{ opacity: reason.trim() ? 1 : 0.45 }} disabled={!reason.trim()} onClick={doReject}>Отказать</button>
              <button className="btn btn-ghost" onClick={() => { setRejectId(null); setReason('') }}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const digits = (s: string) => s.replace(/\D/g, '')

export default function Admin() {
  const [tab, setTab] = useState<Tab>('dash')
  const [sentDiscount, setSentDiscount] = useState<number[]>([])
  const [reminded, setReminded] = useState<number[]>([])
  const [sales, setSales] = useState<Sale[]>(salesMock)

  const webOrders = useOrders()
  const [extraClients, setExtraClients] = useState<Client[]>([])
  const [prefill, setPrefill] = useState<Prefill | null>(null)
  const allClients = useMemo(() => [...clients, ...extraClients], [extraClients])
  const newOrdersCount = webOrders.filter(o => o.status === 'новый').length
  const bookings = useBookings()
  const newBookingsCount = bookings.filter(b => b.status === 'новая').length

  // Клик по заказу с сайта → заполняем форму «Новый заказ»
  const processOrder = (order: OnlineOrder) => {
    let c = allClients.find(x => digits(x.phone) === digits(order.customer.phone))
    if (!c) {
      c = { id: Date.now(), name: order.customer.name, phone: order.customer.phone, level: 'Silver', points: 0, ltv: 0, lastVisit: 'сегодня' }
      setExtraClients(prev => [...prev, c!])
    }
    setPrefill({ productId: order.items[0].productId, clientId: c.id, orderId: order.id })
    setTab('neworder')
  }

  const sendDiscount = (idx: number) => {
    const it = interests[idx]
    setSentDiscount(s => [...s, idx])
    toast({
      title: 'Персональная скидка −10% ✦',
      text: `${client(it.clientId).name.split(' ')[0]}, вы ${it.views} раз смотрели «${prod(it.productId).name}». Дарим −10%, действует 48 ч. — так сообщение увидит клиент в Telegram.`,
    })
  }

  const remind = (id: number) => {
    const s = serviceDue.find(x => x.id === id)!
    setReminded(r => [...r, id])
    toast({
      title: '⌚ Пора на ТО',
      text: `${client(s.clientId).name.split(' ')[0]}, вашему ${s.model} (${s.serial}) скоро год — плановое обслуживание по гарантии бесплатно. Выберите время визита. — так уведомление придёт клиенту.`,
    })
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <button className={tab === 'dash' ? 'on' : ''} onClick={() => setTab('dash')}>▦ Дашборд · 7 дней</button>
        <button className={tab === 'products' ? 'on' : ''} onClick={() => setTab('products')}>▧ Продукты · склад</button>
        <button className={tab === 'weborders' ? 'on' : ''} onClick={() => setTab('weborders')}>
          🛒 Заказы с сайта {newOrdersCount > 0 && <span className="side-badge">{newOrdersCount}</span>}
        </button>
        <button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>
          🛠 Записи на ТО {newBookingsCount > 0 && <span className="side-badge">{newBookingsCount}</span>}
        </button>
        <button className={tab === 'neworder' ? 'on' : ''} onClick={() => setTab('neworder')}>＋ Новый заказ</button>
        <button className={tab === 'sales' ? 'on' : ''} onClick={() => setTab('sales')}>▤ Продажи</button>
        <button className={tab === 'interest' ? 'on' : ''} onClick={() => setTab('interest')}>♦ Интересы клиентов</button>
        <button className={tab === 'demand' ? 'on' : ''} onClick={() => setTab('demand')}>◈ Спрос · лист ожидания</button>
        <button className={tab === 'service' ? 'on' : ''} onClick={() => setTab('service')}>⌚ Скоро ТО</button>
        <button className={tab === 'clients' ? 'on' : ''} onClick={() => setTab('clients')}>◉ Клиенты</button>
      </aside>

      <main className="admin-main">
        {tab === 'dash' && (
          <>
            <span className="sec-label">CRM · CHASI.UZ</span>
            <h2 style={{ marginBottom: 28 }}>Аналитика за 7 дней</h2>
            <div className="kpis">
              <div className="kpi"><div className="v">1 795</div><div className="l">визитов на сайт</div><div className="d" style={{ color: 'var(--green)' }}>▲ +12% к прошлой неделе</div></div>
              <div className="kpi"><div className="v">1 536</div><div className="l">просмотров товаров</div><div className="d" style={{ color: 'var(--green)' }}>▲ +8%</div></div>
              <div className="kpi"><div className="v">41</div><div className="l">заявок в лист ожидания</div><div className="d" style={{ color: 'var(--green)' }}>▲ +5 за сегодня</div></div>
              <div className="kpi"><div className="v">4,2%</div><div className="l">конверсия в заказ</div><div className="d" style={{ color: 'var(--red)' }}>▼ −0,3%</div></div>
            </div>

            <div className="panel">
              <h3>Самые просматриваемые модели</h3>
              <div className="sub">За последние 7 дней · клики по карточкам товаров</div>
              <Bars rows={views7d.map(v => ({ name: prod(v.productId).name, value: v.views }))} />
            </div>

            <div className="panel">
              <h3>Посещаемость по дням</h3>
              <div className="sub">Уникальные посетители</div>
              <Bars rows={dailyVisits.map(d => ({ name: d.day, value: d.visits }))} />
            </div>
          </>
        )}

        {tab === 'products' && <ProductsAdmin />}

        {tab === 'weborders' && (
          <WebOrders orders={webOrders} onProcess={processOrder} />
        )}

        {tab === 'bookings' && <ServiceBookings />}

        {tab === 'neworder' && (
          <NewOrder
            onCreate={s => { setSales(prev => [s, ...prev]); setPrefill(null); setTab('sales') }}
            clientList={allClients}
            prefill={prefill}
            onProcessed={id => updateOrderStatus(id, 'оформлен')}
          />
        )}

        {tab === 'sales' && <SalesReport sales={sales} clientList={allClients} />}

        {tab === 'interest' && (
          <>
            <span className="sec-label">CRM · триггерный маркетинг</span>
            <h2 style={{ marginBottom: 8 }}>Интересы клиентов</h2>
            <p className="muted" style={{ fontSize: '.82rem', marginBottom: 26, fontWeight: 300 }}>
              Клиенты, которые смотрели один товар 3+ раза. Одна кнопка — и клиент получает персональную скидку в Telegram.
            </p>
            <table className="tbl">
              <thead><tr><th>Клиент</th><th>Товар</th><th>Просмотров</th><th>Последний раз</th><th>Действие</th></tr></thead>
              <tbody>
                {interests.map((it, i) => {
                  const done = it.discountSent || sentDiscount.includes(i)
                  return (
                    <tr key={i}>
                      <td>{client(it.clientId).name}<div className="muted" style={{ fontSize: '.7rem' }}>{client(it.clientId).phone}</div></td>
                      <td>{prod(it.productId).name}</td>
                      <td><span className="pill y">{it.views} раз</span></td>
                      <td className="muted">{it.lastSeen}</td>
                      <td>
                        {done
                          ? <span className="pill g">скидка отправлена ✓</span>
                          : <button className="btn btn-gold btn-sm" onClick={() => sendDiscount(i)}>Отправить −10%</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === 'demand' && (
          <>
            <span className="sec-label">CRM · закупки по спросу</span>
            <h2 style={{ marginBottom: 8 }}>Лист ожидания</h2>
            <p className="muted" style={{ fontSize: '.82rem', marginBottom: 26, fontWeight: 300 }}>
              Модели, которых нет в наличии, но клиенты хотят купить. Закупайте под подтверждённый спрос, а не наугад.
            </p>
            <table className="tbl">
              <thead><tr><th>Модель</th><th>В очереди</th><th>С депозитом</th><th>Средний бюджет</th><th></th></tr></thead>
              <tbody>
                {demand.map(d => (
                  <tr key={d.id}>
                    <td>{d.model}</td>
                    <td><span className="pill b">{d.queue} чел.</span></td>
                    <td>{d.deposits > 0 ? <span className="pill g">{d.deposits} · деньги внесены</span> : <span className="pill r">0</span>}</td>
                    <td style={{ color: 'var(--gold2)' }}>{d.avgBudget.toLocaleString('ru-RU')} $</td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => toast({ kind: 'gold', title: 'Поставка запланирована', text: `«${d.model}» добавлена в план закупки. При поступлении все ${d.queue} клиентов получат уведомление автоматически.` })}>Заказать поставку</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="panel" style={{ marginTop: 26 }}>
              <h3>Потенциальная выручка листа ожидания</h3>
              <div className="sub">Если привезти всё, что просят клиенты</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '2.6rem', color: 'var(--gold2)' }}>
                ≈ {demand.reduce((s, d) => s + d.queue * d.avgBudget, 0).toLocaleString('ru-RU')} $
              </div>
            </div>
          </>
        )}

        {tab === 'service' && (
          <>
            <span className="sec-label">CRM · возврат клиентов</span>
            <h2 style={{ marginBottom: 8 }}>Приближается ТО</h2>
            <p className="muted" style={{ fontSize: '.82rem', marginBottom: 26, fontWeight: 300 }}>
              Клиенты, чьим часам скоро год. Напоминание возвращает клиента в бутик — а вернувшийся клиент часто уходит с новой покупкой.
            </p>
            <table className="tbl">
              <thead><tr><th>Клиент</th><th>Часы · серийный №</th><th>Куплено</th><th>ТО</th><th>Действие</th></tr></thead>
              <tbody>
                {serviceDue.map(s => {
                  const done = s.reminded || reminded.includes(s.id)
                  return (
                    <tr key={s.id}>
                      <td>{client(s.clientId).name}<div className="muted" style={{ fontSize: '.7rem' }}>{client(s.clientId).phone}</div></td>
                      <td>{s.model}<div className="muted" style={{ fontSize: '.7rem' }}>{s.serial}</div></td>
                      <td className="muted">{s.purchased}</td>
                      <td><span className={`pill ${s.daysLeft < 30 ? 'r' : 'y'}`}>{s.due} · через {s.daysLeft} дн.</span></td>
                      <td>
                        {done
                          ? <span className="pill g">напоминание отправлено ✓</span>
                          : <button className="btn btn-gold btn-sm" onClick={() => remind(s.id)}>Отправить напоминание</button>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === 'clients' && (
          <>
            <span className="sec-label">CRM · база — актив бизнеса</span>
            <h2 style={{ marginBottom: 26 }}>Клиенты</h2>
            <table className="tbl">
              <thead><tr><th>Клиент</th><th>Уровень</th><th>Баллы</th><th>LTV</th><th>Последний визит</th></tr></thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id}>
                    <td>{c.name}<div className="muted" style={{ fontSize: '.7rem' }}>{c.phone}</div></td>
                    <td>
                      <span className={`pill ${c.level === 'Platinum' ? 'b' : c.level === 'Gold' ? 'y' : 'g'}`}>{c.level}</span>
                    </td>
                    <td>{c.points.toLocaleString('ru-RU')}</td>
                    <td style={{ color: 'var(--gold2)' }}>{c.ltv.toLocaleString('ru-RU')} $</td>
                    <td className="muted">{c.lastVisit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </div>
  )
}
