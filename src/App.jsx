import { useState, useEffect, useCallback, useRef } from 'react'
import { Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'
import {
  Store, Plus, Search, Package, ImagePlus, ArrowLeft, Palette, ExternalLink,
} from 'lucide-react'
import {
  PRESET_PALETTES, getPalette, slugify, genId, money, loadData, saveData,
  STORE_TEMPLATES, getTemplate, getSubdomainSlug,
} from './lib.js'
import { seedData } from './data.js'
import ProductForm from './ProductForm.jsx'
import './App.css'

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData().then((remote) => {
      setData(remote || seedData())
      setLoading(false)
    })
  }, [])

  const persist = useCallback((next) => {
    setData(next)
    saveData(next)
  }, [])

  if (loading) return <div className="loading-screen">Cargando...</div>

  // Si la app se sirve desde un subdominio de cliente (cliente.tudominio.com),
  // mostramos directamente esa tienda pública, sin importar la ruta.
  const subdomainSlug = getSubdomainSlug()
  if (subdomainSlug) {
    return <PublicStore data={data} slugOverride={subdomainSlug} />
  }

  return (
    <Routes>
      <Route path="/" element={<AdminHome data={data} persist={persist} />} />
      <Route path="/tienda/:storeId" element={<SellerDashboard data={data} persist={persist} />} />
      <Route path="/t/:slug" element={<PublicStore data={data} />} />
    </Routes>
  )
}

// ---------- Vista: panel general (admin) ----------

function AdminHome({ data, persist }) {
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const stores = data.stores.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))

  const handleCreate = (store) => {
    const id = genId('store')
    const newStore = { ...store, id, status: 'activa', createdAt: new Date().toISOString() }
    persist({
      ...data,
      stores: [newStore, ...data.stores],
      products: { ...data.products, [id]: [] },
    })
    setCreating(false)
    navigate(`/tienda/${id}`)
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">F</div><span>Feria</span></div>
      </header>

      <div className="view">
        <div className="view-head">
          <div>
            <h1>Tiendas de la feria</h1>
            <p className="subtitle">{data.stores.length} vendedores registrados</p>
          </div>
          <div className="view-head-actions">
            <div className="search-box">
              <Search size={16} />
              <input placeholder="Buscar tienda..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={() => setCreating(true)}>
              <Plus size={16} /> Nueva tienda
            </button>
          </div>
        </div>

        <div className="store-grid">
          {stores.map((s) => {
            const p = getPalette(s.palette)
            return (
              <Link to={`/tienda/${s.id}`} key={s.id} className="store-card" style={{ '--card-accent': p.primary }}>
                <div className="store-card-swatch">
                  <span style={{ background: p.ink }} />
                  <span style={{ background: p.primary }} />
                  <span style={{ background: p.accent }} />
                </div>
                <h3>{s.name}</h3>
                <p className="store-card-owner">{s.owner}</p>
                <p className="store-card-meta">{s.category} · {(data.products[s.id] || []).length} productos</p>
              </Link>
            )
          })}
        </div>
      </div>

      {creating && <CreateStoreModal onSave={handleCreate} onClose={() => setCreating(false)} />}
    </div>
  )
}

function CreateStoreModal({ onSave, onClose }) {
  const [step, setStep] = useState('template') // 'template' | 'details'
  const [template, setTemplate] = useState(null)
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [category, setCategory] = useState('')
  const [palette, setPalette] = useState(PRESET_PALETTES[0].id)
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  const pickTemplate = (t) => {
    setTemplate(t)
    setCategory(t.category)
    setPalette(t.palette)
    setStep('details')
  }

  const handleNameChange = (v) => {
    setName(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return
    onSave({
      name: name.trim(),
      owner: owner.trim(),
      category: category.trim(),
      slug: slugify(slug),
      palette,
      heroStyle: template?.heroStyle || 'text',
      heroTitle: template?.heroTitle || '',
      heroSubtitle: template?.heroSubtitle || '',
      heroImage: null,
    })
  }

  if (step === 'template') {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-head">
            <h2>¿Qué tipo de tienda es?</h2>
            <p className="modal-subtext">Elegí un punto de partida, después podés cambiar todo.</p>
          </div>
          <div className="template-grid">
            {STORE_TEMPLATES.map((t) => {
              const p = getPalette(t.palette)
              return (
                <button type="button" key={t.id} className="template-card" onClick={() => pickTemplate(t)}>
                  <span className="template-swatch">
                    <i style={{ background: p.ink }} /><i style={{ background: p.primary }} /><i style={{ background: p.accent }} />
                  </span>
                  <strong>{t.name}</strong>
                </button>
              )
            })}
          </div>
          <div className="modal-actions" style={{ padding: '0 22px 20px' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2>Datos de la tienda</h2></div>
        <form onSubmit={handleSubmit} className="product-form">
          <label className="field">
            <span>Nombre de la tienda</span>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ej. Casa Terracota" required />
          </label>
          <label className="field">
            <span>Subdominio</span>
            <div className="subdomain-input">
              <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} placeholder="mi-tienda" />
              <span>.tudominio.com</span>
            </div>
          </label>
          <label className="field">
            <span>Nombre del vendedor</span>
            <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Tu nombre" />
          </label>
          <label className="field">
            <span>Categoría</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej. Cerámica y hogar" />
          </label>
          <label className="field">
            <span>Paleta de colores</span>
            <div className="palette-grid">
              {PRESET_PALETTES.map((p) => (
                <button type="button" key={p.id} onClick={() => setPalette(p.id)}
                  className={`palette-option ${palette === p.id ? 'active' : ''}`}>
                  <span className="palette-swatch">
                    <i style={{ background: p.ink }} /><i style={{ background: p.primary }} /><i style={{ background: p.accent }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={() => setStep('template')}>Atrás</button>
            <div className="modal-actions-right">
              <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn-primary">Crear tienda</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------- Vista: panel del vendedor (diseño + productos) ----------

function SellerDashboard({ data, persist }) {
  const { storeId } = useParams()
  const [tab, setTab] = useState('productos')
  const store = data.stores.find((s) => s.id === storeId)
  const products = data.products[storeId] || []

  if (!store) return <div className="page"><div className="view">Tienda no encontrada.</div></div>

  const updateStore = (patch) => {
    persist({
      ...data,
      stores: data.stores.map((s) => (s.id === storeId ? { ...s, ...patch } : s)),
    })
  }

  const saveProduct = (product, deleteId) => {
    const current = data.products[storeId] || []
    let next
    if (deleteId) {
      next = current.filter((p) => p.id !== deleteId)
    } else {
      const exists = current.some((p) => p.id === product.id)
      next = exists ? current.map((p) => (p.id === product.id ? product : p)) : [product, ...current]
    }
    persist({ ...data, products: { ...data.products, [storeId]: next } })
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="back-link"><ArrowLeft size={18} /></Link>
        <div className="brand"><div className="brand-mark">F</div><span>{store.name}</span></div>
        <Link to={`/t/${store.slug}`} target="_blank" className="btn-ghost btn-sm">
          <ExternalLink size={14} /> Ver tienda pública
        </Link>
      </header>

      <nav className="tabbar">
        <button className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}>
          <Package size={16} /> Productos
        </button>
        <button className={tab === 'diseno' ? 'active' : ''} onClick={() => setTab('diseno')}>
          <Palette size={16} /> Diseño
        </button>
      </nav>

      {tab === 'productos' ? (
        <ProductsTab products={products} onSave={saveProduct} />
      ) : (
        <DesignTab store={store} onUpdate={updateStore} />
      )}
    </div>
  )
}

function ProductsTab({ products, onSave }) {
  const [editing, setEditing] = useState(undefined)

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Productos</h1>
          <p className="subtitle">{products.length} cargados</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing(null)}>
          <Plus size={16} /> Cargar producto
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <Package size={32} strokeWidth={1.5} />
          <h3>Todavía no hay productos aquí</h3>
          <p>Carga el primero para que aparezca en tu tienda.</p>
          <button className="btn-primary" onClick={() => setEditing(null)}><Plus size={16} /> Cargar producto</button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <button key={p.id} className="product-card" onClick={() => setEditing(p)}>
              <div className="product-image">
                {p.image ? <img src={p.image} alt={p.name} /> : <Package size={26} strokeWidth={1.5} />}
              </div>
              <div className="product-info">
                <span className={`pill ${p.status === 'publicado' ? 'status-live' : p.status === 'agotado' ? 'status-out' : 'status-draft'}`}>
                  {p.status}
                </span>
                <h3>{p.name}</h3>
                <div className="product-meta">
                  <span className="product-price">{money(p.price)}</span>
                  <span className="product-stock">{p.stock} disp.</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {editing !== undefined && (
        <ProductForm initial={editing} onSave={(p, del) => { onSave(p, del); setEditing(undefined) }} onClose={() => setEditing(undefined)} />
      )}
    </div>
  )
}

const HERO_STYLES = [
  { id: 'text', label: 'Solo texto' },
  { id: 'image-bg', label: 'Imagen de fondo' },
  { id: 'image-side', label: 'Imagen al costado' },
]

function DesignTab({ store, onUpdate }) {
  const [heroTitle, setHeroTitle] = useState(store.heroTitle || '')
  const [heroSubtitle, setHeroSubtitle] = useState(store.heroSubtitle || '')
  const fileRef = useRef(null)

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onUpdate({ heroImage: reader.result })
    reader.readAsDataURL(file)
  }

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1>Diseño de tu tienda</h1>
          <p className="subtitle">Así se va a ver tu página pública</p>
        </div>
      </div>

      <div className="subdomain-box">
        Tu tienda vive en: <strong>{store.slug}.tudominio.com</strong>
      </div>

      <div className="design-grid">
        <div className="design-form">
          <label className="field">
            <span>Paleta de colores</span>
            <div className="palette-grid">
              {PRESET_PALETTES.map((p) => (
                <button type="button" key={p.id} onClick={() => onUpdate({ palette: p.id })}
                  className={`palette-option ${store.palette === p.id ? 'active' : ''}`}>
                  <span className="palette-swatch">
                    <i style={{ background: p.ink }} /><i style={{ background: p.primary }} /><i style={{ background: p.accent }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span>Estilo de portada</span>
            <div className="hero-style-grid">
              {HERO_STYLES.map((s) => (
                <button type="button" key={s.id} onClick={() => onUpdate({ heroStyle: s.id })}
                  className={`hero-style-option ${store.heroStyle === s.id ? 'active' : ''}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </label>

          {store.heroStyle !== 'text' && (
            <label className="field">
              <span>Imagen de portada</span>
              <button type="button" className="image-drop" onClick={() => fileRef.current?.click()}>
                {store.heroImage ? <img src={store.heroImage} alt="Portada" /> : (
                  <><ImagePlus size={28} strokeWidth={1.5} /><span>Subir imagen</span></>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} hidden />
            </label>
          )}

          <label className="field">
            <span>Título principal</span>
            <input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)}
              onBlur={() => onUpdate({ heroTitle })} placeholder="Ej. Piezas hechas a mano, para tu casa" />
          </label>

          <label className="field">
            <span>Subtítulo</span>
            <textarea rows={2} value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)}
              onBlur={() => onUpdate({ heroSubtitle })} placeholder="Una frase corta que describa tu tienda" />
          </label>
        </div>

        <StorePreview store={{ ...store, heroTitle, heroSubtitle }} />
      </div>
    </div>
  )
}

function HeroBlock({ store, p, tag: Tag }) {
  const badge = <span className="preview-badge" style={{ background: p.primary, color: p.bg }}>{store.category || 'Tienda'}</span>
  const title = <Tag style={{ fontFamily: 'var(--font-display)' }}>{store.heroTitle || 'Título de tu tienda'}</Tag>
  const subtitle = <p>{store.heroSubtitle || 'Acá va la descripción de tu tienda.'}</p>
  const btn = <div className="preview-btn" style={{ background: p.primary, color: p.bg }}>Ver productos</div>

  if (store.heroStyle === 'image-bg' && store.heroImage) {
    return (
      <div className="hero-block hero-image-bg" style={{ backgroundImage: `url(${store.heroImage})` }}>
        <div className="hero-overlay">{badge}{title}{subtitle}{btn}</div>
      </div>
    )
  }
  if (store.heroStyle === 'image-side') {
    return (
      <div className="hero-block hero-image-side" style={{ background: p.bg, color: p.ink }}>
        <div className="hero-side-text">{badge}{title}{subtitle}{btn}</div>
        <div className="hero-side-image">
          {store.heroImage ? <img src={store.heroImage} alt="" /> : <div className="hero-side-placeholder" />}
        </div>
      </div>
    )
  }
  return (
    <div className="hero-block hero-text-only" style={{ background: p.bg, color: p.ink }}>
      {badge}{title}{subtitle}{btn}
    </div>
  )
}

function StorePreview({ store }) {
  const p = getPalette(store.palette)
  return (
    <div className="preview-frame">
      <HeroBlock store={store} p={p} tag="h2" />
    </div>
  )
}

// ---------- Vista: tienda pública ----------

function PublicStore({ data, slugOverride }) {
  const params = useParams()
  const slug = slugOverride || params.slug
  const store = data.stores.find((s) => s.slug === slug)

  if (!store) return <div className="page"><div className="view">Esta tienda no existe.</div></div>

  const products = (data.products[store.id] || []).filter((p) => p.status !== 'borrador')
  const p = getPalette(store.palette)

  return (
    <div className="public-store" style={{ '--p-bg': p.bg, '--p-ink': p.ink, '--p-primary': p.primary, '--p-accent': p.accent }}>
      <header className="public-header">
        <span className="public-brand">{store.name}</span>
      </header>

      <HeroBlock store={store} p={p} tag="h1" />

      <section className="public-products">
        {products.length === 0 ? (
          <p className="public-empty">Todavía no hay productos publicados.</p>
        ) : (
          <div className="public-grid">
            {products.map((prod) => (
              <div key={prod.id} className="public-card">
                <div className="public-card-image">
                  {prod.image ? <img src={prod.image} alt={prod.name} /> : <Package size={28} strokeWidth={1.5} />}
                </div>
                <h3>{prod.name}</h3>
                <p className="public-price">{money(prod.price)}</p>
                {prod.status === 'agotado' && <span className="public-soldout">Agotado</span>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
