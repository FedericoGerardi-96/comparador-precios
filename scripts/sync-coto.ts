import { chromium } from "playwright";
import { prisma } from "../lib/db";
import { scrapeCotoProduct } from "@/util/scrapeCotoProduct";

async function syncCotoNavegacionReal() {
  console.log("=== INICIANDO SINCRONIZACIÓN DIARIA (Simulación de Usuario) ===");
  const startTime = Date.now();

  // Cargamos el listado de semillas guardadas por usuarios o el fallback inicial
  const semillasDb = await prisma.busquedaSemilla.findMany();

  const keywordsAProcesar = semillasDb.length > 0
    ? semillasDb.map(s => s.texto)
    : ["leche entera la serenisima 1l", "yerba playadito 1kg"];

  // Asegurar que exista la sucursal de Coto
  await prisma.supermercado.upsert({
    where: { id: "coto" },
    update: {},
    create: { id: "coto", nombre: "Coto Digital", logoUrl: "https://www.cotodigital3.com.ar/images/logo.png" }
  });

  // Lanzamos el navegador UNA sola vez
  const browser = await chromium.launch({ 
    headless: true, // Ponelo en false localmente si querés debuggear visualmente
    args: [
      "--disable-blink-features=AutomationControlled", // Evita flags de Selenium/Playwright
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  // Creamos un único contexto persistente para todo el proceso de sincronización
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires"
  });

  for (const keyword of keywordsAProcesar) {
    console.log(`\n⏳ Sincronizando catálogo para: "${keyword}"...`);
    
    // Abrimos un TAB (página) específico para esta keyword
    const page = await context.newPage();
    try {
      const data = await scrapeCotoProduct(page, keyword);

      if (!data || data.price === 0 || !data.ean) {
        console.log(`⚠️ Se salteó el producto "${keyword}" debido a falla en la recolección de datos.`);
        continue;
      }

      // Guardamos la definición general del producto
      const productoDb = await prisma.producto.upsert({
        where: { ean: data.ean },
        update: { nombre: data.name, imagenUrl: data.image },
        create: {
          ean: data.ean,
          nombre: data.name,
          marca: data.name.split(" ")[0],
          categoria: data.category,
          imagenUrl: data.image,
        }
      });

      // Insertamos el precio actual en la base de datos temporal
      await prisma.precio.create({
        data: {
          precio: data.price,
          productoId: productoDb.id,
          supermercadoId: "coto"
        }
      });

      console.log(`✅ Registro exitoso: [${data.ean}] ${data.name} -> $${data.price}`);

    } catch (err: any) {
      console.error(`❌ Ocurrió un error inesperado al procesar la keyword "${keyword}":`, err.message);
    } finally {
      // ANCLA DE SEGURIDAD: Cerramos únicamente el TAB actual para liberar memoria.
      // El navegador y el contexto siguen vivos para la próxima keyword del bucle.
      await page.close();
    }

    // Pequeño retardo cortés entre búsquedas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Cerramos todo al concluir por completo
  await context.close();
  await browser.close();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n=== PROCESO TERMINADO EN ${duration} SEGUNDOS ===`);
}

syncCotoNavegacionReal()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());