import { getCotoProducts } from "@/lib/coto-service";
import { HomeClient } from "@/components/HomeClient";

// Revalidar cada hora para mantener ofertas frescas de forma estática pero actualizada
export const revalidate = 3600;

const FALLBACK_PRODUCTS = [
  {
    id: "1",
    name: "Leche Entera La Serenísima 1L",
    brand: "La Serenísima",
    category: "Lácteos",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 1150,
      Coto: 1210,
      Dia: 1250,
    },
  },
  {
    id: "2",
    name: "Yerba Mate Playadito 1Kg",
    brand: "Playadito",
    category: "Almacén",
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 3600,
      Coto: 3450,
      Dia: 3800,
    },
  },
  {
    id: "3",
    name: "Fideos Tallarines Lucchetti 500g",
    brand: "Lucchetti",
    category: "Almacén",
    image: "https://images.unsplash.com/photo-1612966608967-302fc5e26e0e?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 1050,
      Coto: 980,
      Dia: 990,
    },
  },
  {
    id: "4",
    name: "Fernet Branca 750ml",
    brand: "Branca",
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=200&q=80",
    prices: {
      Carrefour: 8100,
      Coto: 8500,
      Dia: 7900,
    },
  },
];

export default async function HomePage() {
  let initialProducts: any[] = [];
  try {
    initialProducts = await getCotoProducts("");
  } catch (error) {
    console.error("Error al obtener ofertas de Coto en el servidor, usando fallback:", error);
    initialProducts = FALLBACK_PRODUCTS;
  }

  if (!initialProducts || initialProducts.length === 0) {
    initialProducts = FALLBACK_PRODUCTS;
  }

  return <HomeClient initialProducts={initialProducts} />;
}