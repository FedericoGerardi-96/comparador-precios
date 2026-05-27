import { NextResponse } from "next/server";
import { chromium } from "playwright";
import { prisma } from "@/lib/db"; // Ajustá la ruta a tu cliente de Prisma

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.toLowerCase().trim() || "";

    if (!query) {
        return NextResponse.json({ error: "Query vacío" }, { status: 400 });
    }

    try {
        // === PASO 1: BUSCAR EN NUESTRA BASE DE DATOS ===
        const productosEnDb = await prisma.producto.findMany({
            where: {
                OR: [
                    { nombre: { contains: query, mode: "insensitive" } },
                    { marca: { contains: query, mode: "insensitive" } } // Corregido: brand -> marca
                ]
            },
            include: {
                precios: {
                    orderBy: { fecha: "desc" },
                    take: 3 // Traemos los últimos precios registrados
                }
            }
        });

        // Si encontramos productos en Supabase, los devolvemos volando
        if (productosEnDb.length > 0) {
            console.log(`⚡ Resultados obtenidos desde Supabase para: "${query}"`);
            return NextResponse.json(productosEnDb);
        }

        // === PASO 2: SCRAPING ON-DEMAND (Si la DB está vacía para esta búsqueda) ===
        console.log(`🚑 Modo Rescate: Buscando "${query}" en vivo mediante Playwright...`);

        // Lanzamos Playwright en modo headless (invisible y rápido)
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        });
        const page = await context.newPage();

        // Vamos directo a la Home de Coto, buscamos y entramos al primer item
        await page.goto("https://www.cotodigital.com.ar/sitios/cdigi/nuevositio", { waitUntil: "domcontentloaded" });

        const inputSelector = "input[id^='cio-autocomplete-']";
        await page.waitForSelector(inputSelector, { timeout: 5000 });
        await page.locator(inputSelector).first().fill("");
        await page.locator(inputSelector).first().pressSequentially(query, { delay: 50 });

        const dropdownItemSelector = "[id^='cio-autocomplete-'][id*='-item-']";
        await page.waitForSelector(dropdownItemSelector, { timeout: 4000 });
        const primeraSugerencia = page.locator(dropdownItemSelector).first();

        await Promise.all([
            page.waitForNavigation({ waitUntil: "domcontentloaded" }),
            primeraSugerencia.click()
        ]);

        // Extraemos la data del HTML del detalle
        const scrapedData = await page.evaluate(() => {
            const nameEl = document.querySelector("h1, .product-title, .descrip_full");
            const priceEl = document.querySelector(".atg_store_newPrice, .precio-destacado, .price, .product-price");
            const imgEl = document.querySelector(".img-big-wrap img, article.gallery-wrap img.img-responsive");

            let priceText = priceEl?.textContent || "0";
            priceText = priceText.replace(/[^0-9,]/g, "").replace(",", ".");

            let eanLimpio = "";
            const spans = document.querySelectorAll("span");
            for (const span of spans) {
                if (span.textContent && span.textContent.includes("EAN:")) {
                    const match = span.textContent.match(/EAN:\s*(\d+)/);
                    if (match && match[1]) { eanLimpio = match[1]; break; }
                }
            }

            return {
                name: nameEl?.textContent?.trim() || "",
                price: parseFloat(priceText) || 0,
                ean: eanLimpio,
                image: imgEl?.getAttribute("src") || ""
            };
        });

        await browser.close();

        // Si Coto no tenía el producto, avisamos al frontend
        if (!scrapedData.name || scrapedData.price === 0 || !scrapedData.ean) {
            return NextResponse.json([]);
        }

        // === PASO 3: EL AUTO-APRENDIZAJE (Guardar todo en Supabase) ===

        // 1. Guardamos el producto nuevo encontrado
        const nuevoProducto = await prisma.producto.upsert({
            where: { ean: scrapedData.ean },
            update: { nombre: scrapedData.name, imagenUrl: scrapedData.image },
            create: {
                ean: scrapedData.ean,
                nombre: scrapedData.name,
                marca: scrapedData.name.split(" ")[0],
                categoria: "Almacén",
                imagenUrl: scrapedData.image,
            }
        });

        // 2. Guardamos su precio actual en el historial
        await prisma.precio.create({
            data: {
                precio: scrapedData.price,
                productoId: nuevoProducto.id,
                supermercadoId: "coto"
            }
        });

        // 3. LA MAGIA: Guardamos la palabra clave original para que el Cron diario la herede 🧠
        await prisma.busquedaSemilla.upsert({
            where: { texto: query },
            update: {}, // Si ya existía por alguna razón, no hace nada
            create: { texto: query }
        });

        console.log(`🧠 Sistema alimentado: "${query}" guardado para futuras actualizaciones automáticas.`);

        // Devolvemos el producto recién creado estructurado como un array (para mantener consistencia con la UI)
        const respuestaFormateada = [{
            ...nuevoProducto,
            precios: [{ precio: scrapedData.price, supermercadoId: "coto", updatedAt: new Date() }] // Corregido: fecha -> updatedAt
        }];

        return NextResponse.json(respuestaFormateada);

    } catch (error) {
        console.error("Error en buscador híbrido:", error);
        return NextResponse.json({ error: "Error en la búsqueda en vivo" }, { status: 500 });
    }
}