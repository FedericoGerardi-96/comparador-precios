import { Page } from "playwright";

export interface ScrapedProduct {
  name: string;
  price: number;
  ean: string;
  image: string;
  category: string; // Categoría estandarizada en la app
}

/**
 * Realiza el recorrido completo de usuario en Coto Digital de forma ultra robusta
 */
export async function scrapeCotoProduct(page: Page, query: string): Promise<ScrapedProduct | null> {
  try {
    // --- PUENTE DE CONSOLA PARA DEPURACIÓN ---
    page.on("console", (msg) => {
      const text = msg.text();
      if (text.startsWith("[SCRAPER-DEBUG]") || msg.type() === "error") {
        console.log(`🖥️ [Navegador Coto]: ${text}`);
      }
    });

    // --- BLINDAJE SIGILOSO (STEALTH SPOOFING) ---
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });

      const mockChrome = {
        app: {
          isInstalled: false,
          InstallState: { DISABLED: "disabled", INSTALLED: "installed", NOT_INSTALLED: "not_installed" },
          RunningState: { CANNOT_RUN: "cannot_run", READY_TO_RUN: "ready_to_run", RUNNING: "running" }
        },
        runtime: {
          OnInstalledReason: { INSTALL: "install", UPDATE: "update", CHROME_UPDATE: "chrome_update", SHARED_MODULE_UPDATE: "shared_module_update" },
          OnRestartRequiredReason: { APP_UPDATE: "app_update", OS_UPDATE: "os_update", PERIODIC: "periodic" },
          PlatformArch: { ARM: "arm", ARM64: "arm64", X86_32: "x86-32", X86_64: "x86-64" },
          PlatformNaclArch: { ARM: "arm", X86_32: "x86-32", X86_64: "x86-64" },
          PlatformOs: { ANDROID: "android", CROS: "cros", LINUX: "linux", MAC: "mac", OPENBSD: "openbsd", WIN: "win" },
          RequestUpdateCheckStatus: { THROTTLED: "throttled", NO_UPDATE: "no_update", UPDATE_AVAILABLE: "update_available" }
        },
        loadTimes: function() {},
        csi: function() {}
      };
      
      Object.defineProperty(window, "chrome", { get: () => mockChrome });

      const mockPlugins = [
        { name: "PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" },
        { name: "Chrome PDF Viewer", filename: "internal-pdf-viewer", description: "Portable Document Format" }
      ];
      
      Object.defineProperty(navigator, "plugins", { get: () => mockPlugins });
      Object.defineProperty(navigator, "languages", { get: () => ["es-AR", "es", "en"] });

      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return "Google Inc. (Intel)";
        if (parameter === 37446) return "ANGLE (Intel, Intel(R) UHD Graphics (0x9BC4) Direct3D11 vs_5_0 ps_5_0, D3D11)";
        return getParameter.apply(this, [parameter]);
      };
    });

    // 1. Entrar a la Home nueva
    const response = await page.goto("https://www.cotodigital.com.ar/sitios/cdigi/nuevositio", { 
      waitUntil: "domcontentloaded",
      timeout: 30000 
    });

    if (response && response.status() >= 400) {
      console.log(`⚠️ Advertencia: Código HTTP ${response.status()} en goto.`);
    }

    // 2. Encontrar el buscador
    const inputSelector = "input[id^='cio-autocomplete-']";
    const searchInput = page.locator(inputSelector).first();
    await searchInput.waitFor({ state: "visible", timeout: 15000 });
    
    await searchInput.click();
    await searchInput.focus();
    await searchInput.fill("");
    await page.waitForTimeout(400); 
    await searchInput.pressSequentially(query, { delay: 150 }); 
    
    await page.waitForTimeout(3500);

    const dropdownItemSelector = "[id^='cio-autocomplete-'][id*='-item-']";
    const dropdownVisible = await page.locator(dropdownItemSelector).first().isVisible().catch(() => false);

    if (dropdownVisible) {
      console.log(`✨ Autocompletado detectado para "${query}". Accediendo directamente...`);
      const primeraSugerencia = page.locator(dropdownItemSelector).first();
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 25000 }),
        primeraSugerencia.click()
      ]);
    } else {
      console.log(`⚠️ Autocompletado congelado para "${query}". Ejecutando Modo Rescate por listado...`);
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 25000 }),
        searchInput.press("Enter")
      ]);

      const primerProductoGrid = page.locator(".products_grid a, .product-card a, a[href*='/p/']").first();
      await primerProductoGrid.waitFor({ state: "visible", timeout: 10000 });
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 25000 }),
        primerProductoGrid.click()
      ]);
    }

    // --- ESPERA DE HIDRATACIÓN DE ANGULAR ---
    console.log(`⏳ Esperando renderización de los detalles para "${query}"...`);
    const dynamicDetailSelector = "var.price, .product-info h1, h1.product-title, .descrip_full";
    await page.waitForSelector(dynamicDetailSelector, { state: "visible", timeout: 15000 });
    await page.waitForTimeout(1000); 

    // 3. ESTAMOS EN EL DETALLE - Extraemos los datos
    const data = await page.evaluate(() => {
      // Nombre
      let nameEl = document.querySelector(".product-info h2, h2.product-title, .descrip_full, h2.descrip_full, .product-name");
      if (!nameEl) {
        const allH2s = Array.from(document.querySelectorAll("h2"));
        nameEl = allH2s.find(h => !h.closest("header, footer, nav, #footer, #header")) || null;
      }
      const finalName = nameEl?.textContent?.trim() || "Desconocido";

      // Precio
      const priceEl = document.querySelector("var.price, .price, .product-price, .atg_store_newPrice, .precio-destacado"); 
      let priceText = priceEl?.textContent || "0";
      
      priceText = priceText.replace(/[$\s]/g, ""); 
      if (priceText.includes(",") && priceText.includes(".")) {
        priceText = priceText.replace(/\./g, "").replace(",", ".");
      } else if (priceText.includes(",")) {
        priceText = priceText.replace(",", "."); 
      }
      
      const matchPrice = priceText.match(/[\d.]+/);
      const finalPrice = matchPrice ? parseFloat(matchPrice[0]) : 0;

      // Imagen
      const imgEl = document.querySelector(".img-big-wrap img, article.gallery-wrap img.img-responsive, .product-gallery img");
      let imageUrl = imgEl?.getAttribute("src") || "";
      if (imageUrl.startsWith("//")) imageUrl = `https:${imageUrl}`;

      // EAN
      let eanLimpio = "";
      const spans = document.querySelectorAll("span");
      for (const span of spans) {
        if (span.textContent && span.textContent.includes("EAN:")) {
          const match = span.textContent.match(/EAN:\s*(\d+)/i);
          if (match && match[1]) { 
            eanLimpio = match[1]; 
            break; 
          }
        }
      }

      // --- CLASIFICACIÓN DE CATEGORÍA DE ACUERDO AL ESTÁNDAR DE LA APP ---
      let mappedCategory = "Almacén"; // Default general
      
      // Buscamos los links de las migas de pan para analizar el árbol de Coto
      const breadcrumbEls = Array.from(document.querySelectorAll("div.col-12.col a, .breadcrumb a, span.ng-star-inserted a"));
      const breadcrumbTexts = breadcrumbEls.map(el => {
        const rawText = el.textContent?.trim().toLowerCase() || "";
        // Aplicamos la normalización para eliminar tildes (ej: "lácteos" -> "lacteos")
        return rawText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      });      
      console.log(`[SCRAPER-DEBUG] Migas de pan extraídas: ${JSON.stringify(breadcrumbTexts)}`);

      // 1. Reglas Lácteos y Frescos (Lácteos de Coto, Carnes, Frutas y Verduras)
      const isLacteoFrescos = breadcrumbTexts.some(txt => 
        /lácteo|lacteo|fresco|queso|leche|yogur|crema|manteca|frescos|fiambre|salchicha|carnicería|carniceria|pollo|pescadería|pescaderia|verdulería|verduleria|fruta|fiambrería/i.test(txt)
      );

      // 2. Reglas Bebidas (Con y Sin Alcohol)
      const isBebida = breadcrumbTexts.some(txt => 
        /bebida|gaseosa|cerveza|vino|fernet|agua|jugo|aperitivo|whisky|champagne|bodega|sidra|isotonica|energizante/i.test(txt)
      );

      // 3. Reglas Limpieza (Ropa, Vajilla y Desinfección)
      const isLimpieza = breadcrumbTexts.some(txt =>
        /limpieza|detergente|jabón|jabon|desodorante|suavizante|desinfectante|lavandina|insecticida|trapo|esponja|lavavajilla|limpiador/i.test(txt)
      );

      // 4. Reglas Congelados
      const isCongelado = breadcrumbTexts.some(txt =>
        /congelado|congelados|hamburguesa|nugget|papas fritas congeladas|helado|postre congelado|supercongelado/i.test(txt)
      );

      // Aplicamos precedencias ordenadamente
      if (isLacteoFrescos) {
        mappedCategory = "Lácteos y Frescos";
      } else if (isBebida) {
        mappedCategory = "Bebidas";
      } else if (isLimpieza) {
        mappedCategory = "Limpieza";
      } else if (isCongelado) {
        mappedCategory = "Congelados";
      }

      console.log(`[SCRAPER-DEBUG] Extraído con éxito -> Nombre: "${finalName}", Precio: $${finalPrice}, EAN: ${eanLimpio}, Categoría Mapeada: ${mappedCategory}`);

      return {
        name: finalName,
        price: finalPrice,
        ean: eanLimpio,
        image: imageUrl,
        category: mappedCategory
      };
    });

    return data;

  } catch (err: any) {
    console.error(`❌ Error de navegación o lectura en "${query}":`, err.message);
    return null;
  }
}