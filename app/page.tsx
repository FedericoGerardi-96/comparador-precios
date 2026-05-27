import { getCotoProducts } from "@/lib/coto-service";
import { HomeClient } from "@/components/HomeClient";

// Revalidar cada hora para mantener ofertas frescas de forma estática pero actualizada
export const revalidate = 3600;

export default async function HomePage() {
  let initialProducts: any[] = [];
  try {
    initialProducts = await getCotoProducts("");
  } catch (error) {
    console.error("Error al obtener ofertas de Coto en el servidor, usando fallback:", error);
  }

  return <HomeClient initialProducts={initialProducts} />;
}