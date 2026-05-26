import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function syncCoto() {
  console.log("Iniciando sincronización con Coto...");
  try {
    // Primero nos aseguramos de que existe el supermercado Coto
    await prisma.supermercado.upsert({
      where: { id: "coto" },
      update: {},
      create: {
        id: "coto",
        nombre: "Coto",
        logoUrl: "https://www.coto.com.ar/logo.png"
      }
    });

    // Simularemos la sincronización trayendo la oferta por defecto
    const targetUrl = `https://ac.cnstrc.com/v1/search/oferta?key=key_r6xzz4IAoTWcipni&num_results_per_page=100&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D&c=cio-fe-web-coto-3.4.2`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    const results = data.response?.results || [];

    console.log(`Se encontraron ${results.length} productos. Guardando en la base de datos...`);

    let count = 0;
    for (const item of results) {
      const itemData = item.data || {};
      const ean = itemData.id || item.id;
      if (!ean) continue;

      const nombre = item.value || itemData.name || "Producto sin nombre";
      const marca = itemData.brand || itemData.product_brand || "Genérica";

      let finalPrice = 0;
      if (itemData.product_list_price) {
        finalPrice = typeof itemData.product_list_price === "number"
          ? itemData.product_list_price
          : parseFloat(itemData.product_list_price) || 0;
      }
      if (!finalPrice && Array.isArray(itemData.price) && itemData.price.length > 0) {
        const storePrice = itemData.price.find((p: any) => p.store === "200") || itemData.price[0];
        finalPrice = storePrice.listPrice || storePrice.formatPrice || 0;
      }

      let imageUrl = itemData.image_url || "";
      if (imageUrl && imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;
      else if (imageUrl && imageUrl.startsWith("/")) imageUrl = `https://api.coto.com.ar${imageUrl}`;

      const producto = await prisma.producto.upsert({
        where: { ean: String(ean) },
        update: {
          nombre,
          marca,
          imagenUrl: imageUrl,
        },
        create: {
          ean: String(ean),
          nombre,
          marca,
          categoria: "Almacén",
          imagenUrl: imageUrl,
        }
      });

      if (finalPrice > 0) {
        // Upsert precio
        await prisma.precio.upsert({
          where: {
            productoId_supermercadoId: {
              productoId: producto.id,
              supermercadoId: "coto"
            }
          },
          update: {
            precio: finalPrice
          },
          create: {
            productoId: producto.id,
            supermercadoId: "coto",
            precio: finalPrice
          }
        });
      }
      count++;
    }

    console.log(`Sincronización finalizada. ${count} productos procesados.`);
  } catch (error) {
    console.error("Error durante la sincronización:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncCoto();
