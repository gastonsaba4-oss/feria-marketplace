import { genId } from "./lib.js";

export function seedData() {
  const storeId = genId("store");
  return {
    stores: [
      {
        id: storeId,
        slug: "casa-terracota",
        name: "Casa Terracota",
        owner: "María Fernández",
        category: "Cerámica y hogar",
        palette: "terracota",
        heroStyle: "text",
        heroTitle: "Piezas hechas a mano, para tu casa",
        heroSubtitle: "Cerámica artesanal esmaltada, una por una.",
        heroImage: null,
        status: "activa",
        createdAt: new Date().toISOString(),
      },
    ],
    products: {
      [storeId]: [
        {
          id: genId("p"),
          name: "Jarrón esmaltado azul cobalto",
          price: 42000,
          stock: 6,
          status: "publicado",
          image: null,
          description: "",
        },
        {
          id: genId("p"),
          name: "Set de tazas artesanales (x4)",
          price: 68000,
          stock: 3,
          status: "publicado",
          image: null,
          description: "",
        },
      ],
    },
  };
}
