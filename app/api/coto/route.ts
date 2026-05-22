import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    // Si no se especifica búsqueda, podemos listar azúcar por defecto usando la categoría que encontraste
    const isCategorySearch = !query;

    // Endpoint de búsqueda por término
    const SEARCH_URL = `https://api.coto.com.ar/api/v1/ms-digital-sitio-bff-web/api/v1/products/search?key=key_r6xzz4IAoTWcipni&q=${encodeURIComponent(query)}&num_results_per_page=24&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D&c=cio-fe-web-coto-3.4.2`;

    // Endpoint de categoría (Azúcar / Endulzantes) como fallback/por defecto
    const CATEGORY_URL = `https://api.coto.com.ar/api/v1/ms-digital-sitio-bff-web/api/v1/products/categories/catv00002784?key=key_r6xzz4IAoTWcipni&num_results_per_page=24&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D&c=cio-fe-web-coto-3.4.2`;

    const targetUrl = isCategorySearch ? CATEGORY_URL : SEARCH_URL;

    try {
        const response = await fetch(targetUrl, {
            method: "GET",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept": "application/json",
                "Referer": "https://www.cotodigital3.com.ar/",
                "Origin": "https://www.cotodigital3.com.ar"
            }
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Error en la API de Coto: ${response.statusText}` },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Accedemos a la lista de resultados según la estructura de Constructor.io de Coto
        const results = data.response?.results || [];

        // Mapeamos los campos reales al modelo que usa nuestra UI
        const productosMapeados = results.map((item: any) => {
            // Extraemos información segura del nodo 'data' del producto
            const itemData = item.data || {};

            // Obtener precio regular o precio con descuento de forma segura
            const rawPrice = itemData.price || itemData.sale_price || 0;
            const finalPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(rawPrice) || 0;

            // Limpieza de URLs de imagen para asegurar que se muestren correctamente
            let imageUrl = itemData.image_url || "";
            if (imageUrl && imageUrl.startsWith("//")) {
                imageUrl = `https:${imageUrl}`;
            } else if (imageUrl && imageUrl.startsWith("/")) {
                imageUrl = `https://api.coto.com.ar${imageUrl}`;
            }

            // Si no hay imagen, asignamos un fallback descriptivo
            if (!imageUrl) {
                imageUrl = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80";
            }

            return {
                id: itemData.id || item.id || Math.random().toString(),
                name: item.value || itemData.name || "Producto sin nombre",
                brand: itemData.brand || itemData.product_brand || "Genérica",
                category: itemData.category || "Almacén",
                image: imageUrl,
                prices: {
                    // Asignamos el precio real de Coto obtenido de la API
                    Coto: finalPrice,
                    // Valores iniciales para los supermercados que agregaremos después
                    Carrefour: Math.round(finalPrice * 1.08), // Simulado temporalmente para ver la UI funcionando
                    Dia: Math.round(finalPrice * 0.95)       // Simulado temporalmente para ver la UI funcionando
                }
            };
        });

        return NextResponse.json(productosMapeados);

    } catch (error: any) {
        console.error("Error realizando scraping dinámico de Coto:", error);
        return NextResponse.json(
            { error: "Error de conexión interna con el servidor de Coto", details: error.message },
            { status: 500 }
        );
    }
}