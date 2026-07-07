import { Link, useNavigate, useParams } from 'react-router-dom'
import WatchVisual from '../components/WatchVisual'
import { useAuth } from '../App'
import { useCart } from '../store/cart'
import { effectivePrice, isLastOne, isLowStock, useProducts } from '../store/products'
import { catalogLink, relatedProducts } from '../store/tags'
import EarnBadge from '../components/EarnBadge'
import { useI18n } from '../i18n/engine'
import { toast } from '../toast'

const money = (n: number) => n.toLocaleString('ru-RU') + ' $'

export default function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { authed } = useAuth()
  const { add, items } = useCart()
  const { t } = useI18n()

  const shopProducts = useProducts()
  const product = shopProducts.find(p => p.id === Number(id))
  const inCart = product ? items.find(i => i.productId === product.id)?.qty ?? 0 : 0

  if (!product) {
    return (
      <section style={{ padding: '120px 4vw', textAlign: 'center' }}>
        <span className="sec-label">404</span>
        <h1 className="big" style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>{t('product.notFound')}</h1>
        <p className="muted" style={{ margin: '18px 0 28px' }}>{t('product.notFoundText')}</p>
        <Link className="btn btn-gold" to="/catalog">{t('product.toCatalog')}</Link>
      </section>
    )
  }

  const p = product
  const price = effectivePrice(p)
  const hasDiscount = p.discount > 0
  const low = isLowStock(p)
  const last = isLastOne(p)
  const tags = [
    { label: p.brand, to: catalogLink({ brand: p.brand }) },
    { label: t(`enum.cat.${p.category}`), to: catalogLink({ cat: p.category }) },
    { label: t(`enum.style.${p.style}`), to: catalogLink({ style: p.style }) },
    { label: t(`enum.movement.${p.movement}`), to: catalogLink({ movement: p.movement }) },
  ]
  const related = relatedProducts(p, shopProducts)

  const waterHint = p.water >= 200 ? ` · ${t('product.waterSwim')}` : p.water >= 100 ? ` · ${t('product.waterSplash')}` : ` · ${t('product.waterRain')}`
  // 6–8 ключевых характеристик
  const specs: [string, string][] = [
    [t('product.sBrand'), p.brand],
    [t('product.sModel'), p.name],
    [t('product.sClass'), t(`enum.cat.${p.category}`)],
    [t('product.sMovement'), t(`enum.movement.${p.movement}`)],
    [t('product.sReserve'), p.reserve > 0 ? t('product.reserveVal', { n: p.reserve }) : t('product.reserveQuartz')],
    [t('product.sWater'), `${p.water} ${t('units.m')}${waterHint}`],
    [t('product.sGlass'), t(`enum.glassFull.${p.glass}`)],
    [t('product.sDiameter'), `${p.diameter} ${t('units.mm')}`],
    [t('product.sStyle'), t(`enum.style.${p.style}`)],
    [t('product.sFor'), t(`enum.genderFull.${p.gender}`)],
    [t('product.sWarranty'), t('product.warrantyVal')],
  ]

  const addToCart = () => {
    if (!authed) {
      toast({ kind: 'gold', title: 'Нужна авторизация ✦', text: 'Корзина и цены доступны только клиентам. Нажмите «Войти» вверху справа — и добавляйте часы в корзину.' })
      return
    }
    if (!p.inStock) {
      toast({ title: 'Вы в листе ожидания ✦', text: `«${p.name}» — сообщим в Telegram в день поступления. Внесите депозит, чтобы зафиксировать цену и приоритет.` })
      return
    }
    add(p.id)
    toast({ kind: 'gold', title: 'Добавлено в корзину', text: `${p.name} — теперь в корзине. Оформите заказ с доставкой и, при желании, подарочным боксом.` })
  }

  return (
    <>
      <section style={{ padding: '40px 4vw 0' }}>
        <div className="crumbs">
          <Link to="/catalog">{t('product.crumb')}</Link> <span>/</span> <span>{p.brand}</span> <span>/</span> <b>{p.name}</b>
        </div>
      </section>

      <div className="product">
        <div className="product-media">
          <WatchVisual product={p} live />
          <div className="product-tags">
            <span className={`tag ${p.category === 'original' ? 'orig' : 'copy'}`}>{t(`enum.cat.${p.category}`)}</span>
            {p.inStock ? <span className="pill g">{t('enum.stockIn')}</span> : <span className="pill r">{t('enum.stockOrder')}</span>}
            {hasDiscount && <span className="pill y">−{p.discount}%</span>}
            {low && <span className="pill r">{t('enum.stockLeft', { n: p.stock })}</span>}
          </div>
        </div>

        <div className="product-info">
          <span className="sec-label">{p.brand}</span>
          <h1 className="big" style={{ fontSize: 'clamp(2rem,3.6vw,3.2rem)', marginBottom: 6 }}>{p.name}</h1>
          <div className="muted" style={{ fontSize: '.82rem', letterSpacing: '.06em', marginBottom: 18 }}>
            {t(`enum.style.${p.style}`)} · ⌀{p.diameter} {t('units.mm')} · {t(`enum.genderFull.${p.gender}`)}
          </div>

          <div className="tagrow">
            {tags.map(tg => (
              <Link key={tg.label} to={tg.to} className="tagchip">{tg.label}</Link>
            ))}
          </div>

          <h4 className="spec-h">{t('product.specsTitle')}</h4>
          <table className="spec-table">
            <tbody>
              {specs.map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v}</td></tr>
              ))}
            </tbody>
          </table>

          <div className={`price ${authed ? '' : 'locked'}`} style={{ fontSize: '2rem', marginTop: 10 }}>
            {hasDiscount
              ? <>
                  <s className="muted" style={{ fontSize: '1.2rem', marginRight: 12 }}>{money(p.price)}</s>
                  {money(price)}
                  <span className="save-pill">{t('common.save', { sum: money(p.price - price) })}</span>
                </>
              : money(p.price)}
          </div>
          <div className="lock-note" style={{ marginBottom: 14 }}>{t('common.priceLocked')}</div>

          <EarnBadge product={p} variant="page" />

          {p.inStock && low && (
            <div className="urgency">
              🔥 {last ? t('product.urgencyLast') : t('product.urgencyLeft', { n: p.stock })} {t('product.urgencyTail')}
            </div>
          )}

          <div className="product-actions">
            <button className="btn btn-gold" onClick={addToCart}>
              {!authed ? t('common.buyLoginFirst') : p.inStock ? (inCart ? t('common.inCart', { n: inCart }) : t('common.addToCart')) : t('common.queue')}
            </button>
            {authed && inCart > 0 && (
              <button className="btn btn-ghost" onClick={() => navigate('/cart')}>{t('common.goToCart')}</button>
            )}
          </div>

          <div className="product-note muted">
            {t('product.note')} <Link to="/gift-sets" style={{ color: 'var(--gold2)' }}>{t('product.noteLink')}</Link>.
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ padding: '10px 4vw 70px' }}>
          <div className="sec-head" style={{ marginBottom: 28 }}>
            <div><span className="sec-label">{t('product.similarLabel')}</span><h2 style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)' }}>{t('product.similarTitle')}</h2></div>
            <Link to={`/catalog?brand=${encodeURIComponent(p.brand)}`} className="btn btn-ghost btn-sm">{t('product.allBrand', { brand: p.brand })}</Link>
          </div>
          <div className="grid4">
            {related.map(r => (
              <div key={r.id} className="card" onClick={() => navigate(`/product/${r.id}`)}>
                <div className="card-corner right">
                  {!r.inStock
                    ? <span className="cbadge stock-order">{t('enum.stockOrder')}</span>
                    : isLowStock(r)
                      ? <span className="cbadge stock-low">{t('enum.stockLeft', { n: r.stock })}</span>
                      : <span className="cbadge stock-ok">{t('enum.stockIn')}</span>}
                </div>
                <div className="w"><WatchVisual product={r} /></div>
                <h3>{r.name}</h3>
                <div className="cat">{r.brand} · {t(`enum.style.${r.style}`)}</div>
                <div className={`price ${authed ? '' : 'locked'}`} style={{ marginTop: 12 }}>
                  {r.discount > 0
                    ? <><s className="muted" style={{ fontSize: '.85rem', marginRight: 8 }}>{money(r.price)}</s>{money(effectivePrice(r))}</>
                    : money(r.price)}
                </div>
                <div className="lock-note">{t('common.priceLocked')}</div>
                <EarnBadge product={r} />
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
