import { useState, useRef } from 'react'
import { X, ImagePlus, Trash2 } from 'lucide-react'

export default function ProductForm({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '')
  const [price, setPrice] = useState(initial?.price || '')
  const [stock, setStock] = useState(initial?.stock ?? '')
  const [description, setDescription] = useState(initial?.description || '')
  const [imagePreview, setImagePreview] = useState(initial?.image || null)
  const fileRef = useRef(null)

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !price) return
    onSave({
      id: initial?.id || `p-${Date.now()}`,
      name: name.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      description,
      image: imagePreview,
      status: Number(stock) > 0 ? 'publicado' : 'agotado',
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{initial ? 'Editar producto' : 'Cargar producto nuevo'}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <button
            type="button"
            className="image-drop"
            onClick={() => fileRef.current?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa del producto" />
            ) : (
              <>
                <ImagePlus size={28} strokeWidth={1.5} />
                <span>Subir foto del producto</span>
              </>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImage}
            hidden
          />

          <label className="field">
            <span>Nombre del producto</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Jarrón esmaltado azul cobalto"
              required
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Precio</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                required
              />
            </label>
            <label className="field">
              <span>Existencias</span>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="0"
              />
            </label>
          </div>

          <label className="field">
            <span>Descripción (opcional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Materiales, tamaño, cuidados..."
              rows={3}
            />
          </label>

          <div className="modal-actions">
            {initial && (
              <button
                type="button"
                className="btn-ghost btn-danger"
                onClick={() => onSave(null, initial.id)}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {initial ? 'Guardar cambios' : 'Publicar producto'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
