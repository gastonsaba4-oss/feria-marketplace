export const PRESET_PALETTES = [
  { id: "terracota", name: "Terracota", description: "Cálida y artesanal", ink: "#2B1B14", primary: "#B4552F", accent: "#E8A35C", bg: "#FBF3EC" },
  { id: "salvia", name: "Salvia", description: "Natural y calma", ink: "#1F2A22", primary: "#4F6B4C", accent: "#9DB98F", bg: "#F3F6F0" },
  { id: "marino", name: "Marino", description: "Serio y confiable", ink: "#101826", primary: "#22456B", accent: "#5FA8D3", bg: "#EFF4F8" },
  { id: "ciruela", name: "Ciruela", description: "Elegante y moderna", ink: "#211320", primary: "#6B2B5C", accent: "#C98BB4", bg: "#F8F0F6" },
];

export function getPalette(id) {
  return PRESET_PALETTES.find((p) => p.id === id) || PRESET_PALETTES[0];
}

export function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const money = (n) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

export const STORE_TEMPLATES = [
  {
    id: "artesania",
    name: "Artesanía y hogar",
    category: "Artesanía y hogar",
    palette: "terracota",
    heroStyle: "text",
    heroTitle: "Piezas hechas a mano, para tu casa",
    heroSubtitle: "Cada producto es único, elaborado con dedicación.",
  },
  {
    id: "gastronomia",
    name: "Gastronomía",
    category: "Comida y bebidas",
    palette: "salvia",
    heroStyle: "image-bg",
    heroTitle: "Sabores que se sienten en casa",
    heroSubtitle: "Ingredientes frescos, recetas propias.",
  },
  {
    id: "moda",
    name: "Moda y accesorios",
    category: "Moda",
    palette: "ciruela",
    heroStyle: "image-side",
    heroTitle: "Estilo que te representa",
    heroSubtitle: "Colecciones pensadas para vos.",
  },
  {
    id: "servicios",
    name: "Servicios profesionales",
    category: "Servicios",
    palette: "marino",
    heroStyle: "text",
    heroTitle: "Soluciones profesionales a tu medida",
    heroSubtitle: "Atención personalizada, resultados reales.",
  },
];

export function getTemplate(id) {
  return STORE_TEMPLATES.find((t) => t.id === id) || null;
}

// Detecta si la página se está sirviendo desde un subdominio de cliente
// (ej. casa-terracota.tudominio.com) y devuelve ese slug, o null si no aplica.
export function getSubdomainSlug() {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  if (host === "localhost" || host.endsWith(".netlify.app") || host.endsWith(".netlify.com")) {
    return null;
  }
  const parts = host.split(".");
  if (parts.length < 3) return null; // dominio raíz, sin subdominio
  const sub = parts[0];
  if (sub === "www") return null;
  return sub;
}

const API = "/api/data";

export async function loadData() {
  try {
    const res = await fetch(API);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveData(data) {
  try {
    await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    // Si falla el guardado remoto, seguimos igual con el estado local
  }
}
