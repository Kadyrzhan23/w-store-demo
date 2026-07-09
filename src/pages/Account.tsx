import { useState } from 'react'
import { Link } from 'react-router-dom'
import QR from '../components/QR'
import WatchVisual from '../components/WatchVisual'
import ServiceBooking from '../components/ServiceBooking'
import { myNotifications, myPurchases, myWishlist, products } from '../data/mock'
import { useMyBookings } from '../store/bookings'
import { toast } from '../toast'

type Tab = 'watches' | 'wishlist' | 'requests' | 'notif'

export default function Account() {
  const [tab, setTab] = useState<Tab>('watches')
  const myBookings = useMyBookings()
  const newReq = myBookings.filter(b => b.status === 'новая').length

  const prod = (id: number) => products.find(p => p.id === id)!

  const demoServiceReminder = () =>
    toast({
      title: '⌚ Пора на ТО',
      text: 'Азиз, вашему Tissot Seastar 1000 (сер. TS-2508-0341) через 43 дня исполнится год. Плановое обслуживание бесплатно по гарантии. Нажмите, чтобы выбрать время визита.',
    })

  return (
    <div className="acc">
      {/* -------- сайдбар -------- */}
      <aside className="acc-side">
        <div className="acc-user">
          <div className="avatar">А</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '1.15rem' }}>Азиз Каримов</div>
          <div className="muted" style={{ fontSize: '.72rem', marginTop: 4 }}>+998 90 123 45 67</div>
          <div style={{ marginTop: 12 }}>
            <span className="pill y">Gold · 1 240 баллов</span>
          </div>
          <div className="muted" style={{ fontSize: '.66rem', marginTop: 10, lineHeight: 1.6 }}>До уровня Platinum: 2 760 баллов</div>
          <Link to="/loyalty" style={{ fontSize: '.7rem', color: 'var(--gold2)', display: 'inline-block', marginTop: 10 }}>Как работают баллы →</Link>
        </div>
        <nav>
          <button className={tab === 'watches' ? 'on' : ''} onClick={() => setTab('watches')}>Мои часы · паспорта</button>
          <button className={tab === 'wishlist' ? 'on' : ''} onClick={() => setTab('wishlist')}>Wishlist · очередь</button>
          <button className={tab === 'requests' ? 'on' : ''} onClick={() => setTab('requests')}>
            Мои запросы {newReq > 0 && <span className="side-badge">{newReq}</span>}
          </button>
          <button className={tab === 'notif' ? 'on' : ''} onClick={() => setTab('notif')}>Уведомления</button>
        </nav>
      </aside>

      {/* -------- контент -------- */}
      <div>
        {tab === 'watches' && (
          <>
            <div className="sec-head" style={{ marginBottom: 30 }}>
              <div><span className="sec-label">Личный кабинет</span><h2>Мои часы</h2></div>
              <button className="btn btn-ghost btn-sm" onClick={demoServiceReminder}>Демо: уведомление о ТО →</button>
            </div>
            {myPurchases.map(pu => {
              const p = prod(pu.productId)
              return (
                <div key={pu.id} className="passport">
                  <WatchVisual product={p} className="watch" />
                  <div>
                    <div className="pass-num">{p.name}</div>
                    <div className="pass-rows" style={{ marginTop: 10 }}>
                      Референс: <b>{pu.ref}</b> · Серийный №: <b>{pu.serial}</b><br />
                      Куплено: <b>{pu.date}</b> за <b>{pu.price.toLocaleString('ru-RU')} $</b><br />
                      Гарантия до: <b>{pu.warrantyUntil}</b><br />
                      Следующее ТО: <b style={{ color: pu.daysToService > 0 && pu.daysToService < 60 ? 'var(--gold)' : undefined }}>
                        {pu.nextService}{pu.daysToService > 0 ? ` · через ${pu.daysToService} дн.` : ' · пройдено'}
                      </b>
                    </div>
                    <div style={{ marginTop: 14 }}>
                      {pu.history.map((h, i) => (
                        <div key={i} className="muted" style={{ fontSize: '.72rem', lineHeight: 1.9 }}>◆ {h.date} — {h.what}</div>
                      ))}
                    </div>
                    {pu.daysToService > 0 && pu.daysToService < 60 && (
                      <button className="btn btn-gold btn-sm" style={{ marginTop: 14 }}
                        onClick={() => toast({ kind: 'gold', title: 'Запись подтверждена ✦', text: `${p.name}: ТО назначено. Напомним за день до визита в Telegram.` })}>
                        Записаться на ТО
                      </button>
                    )}
                  </div>
                  <Link to={`/passport/${pu.serial}`} title="Открыть паспорт часов" style={{ textAlign: 'center', textDecoration: 'none' }}>
                    <QR seed={pu.serial} />
                    <div style={{ fontSize: '.62rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 8 }}>
                      Открыть паспорт →
                    </div>
                  </Link>
                </div>
              )
            })}
            <div className="muted" style={{ fontSize: '.76rem', lineHeight: 1.7, fontWeight: 300 }}>
              ✦ Цифровой паспорт подтверждает подлинность и историю часов. QR-код на паспорте сканируется в бутике — мастер сразу видит модель, гарантию и историю обслуживания.
            </div>
            <div className="panel" style={{ marginTop: 26 }}>
              <ServiceBooking variant="card" />
            </div>
          </>
        )}

        {tab === 'wishlist' && (
          <>
            <div className="sec-head" style={{ marginBottom: 30 }}>
              <div><span className="sec-label">Личный кабинет</span><h2>Список желаний</h2></div>
            </div>
            <table className="tbl">
              <thead><tr><th>Модель</th><th>Статус</th><th>Комментарий</th><th></th></tr></thead>
              <tbody>
                {myWishlist.map(w => (
                  <tr key={w.id}>
                    <td>{w.model}</td>
                    <td>{w.inStock
                      ? <span className="pill g">в наличии</span>
                      : <span className="pill r">нет в наличии · №{w.queuePos} в очереди</span>}
                    </td>
                    <td className="muted">{w.note}</td>
                    <td>
                      {w.inStock
                        ? <button className="btn btn-gold btn-sm" onClick={() => toast({ kind: 'gold', title: 'Бронь оформлена ✦', text: `«${w.model}» отложена для вас на 72 часа в бутике на Мирабад, 12.` })}>Забронировать</button>
                        : <button className="btn btn-ghost btn-sm" onClick={() => toast({ title: 'Депозит ✦', text: `Внесите депозит через Click или Payme — получите приоритет №1 в очереди и фиксацию цены на «${w.model}».` })}>Внести депозит</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {tab === 'requests' && (
          <>
            <div className="sec-head" style={{ marginBottom: 30 }}>
              <div><span className="sec-label">Личный кабинет</span><h2>Мои запросы на ТО</h2></div>
            </div>
            {myBookings.length === 0 ? (
              <div className="empty">
                Пока нет запросов на обслуживание. Оформите заявку в разделе «Мои часы» или на главной — статус появится здесь.
              </div>
            ) : (
              <div className="req-list">
                {myBookings.map(b => (
                  <div key={b.id} className={`req-card ${b.status}`}>
                    <div className="req-top">
                      <div>
                        <b>{b.watch}</b>{b.year ? <span className="muted"> · {b.year}</span> : null}
                        <div className="muted" style={{ fontSize: '.74rem', marginTop: 3 }}>Дата визита: {b.date.split('-').reverse().join('.')}</div>
                      </div>
                      {b.status === 'новая' && <span className="pill y">на рассмотрении</span>}
                      {b.status === 'подтверждена' && <span className="pill g">подтверждена ✓</span>}
                      {b.status === 'отказано' && <span className="pill r">отказано</span>}
                    </div>
                    <div className="req-msg muted">
                      {b.status === 'новая' && 'Заявка отправлена. Ждём подтверждения мастера — уведомим вас об изменении статуса.'}
                      {b.status === 'подтверждена' && `Запись подтверждена. Ждём вас ${b.date.split('-').reverse().join('.')} в бутике на Мирабад, 12.`}
                      {b.status === 'отказано' && `К сожалению, в записи отказано${b.rejectReason ? `: ${b.rejectReason}` : ''}. Свяжитесь с нами, подберём другой вариант.`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'notif' && (
          <>
            <div className="sec-head" style={{ marginBottom: 30 }}>
              <div><span className="sec-label">Личный кабинет</span><h2>Уведомления</h2></div>
              <button className="btn btn-ghost btn-sm" onClick={demoServiceReminder}>Демо: как приходит ТО →</button>
            </div>
            {myNotifications.map(n => (
              <div key={n.id} className="notif">
                <div className="n-t">{n.title} <span className="pill y" style={{ marginLeft: 8 }}>{n.kind}</span></div>
                <div className="n-b">{n.body}</div>
                <div className="n-d">{n.date} · Telegram + SMS</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
