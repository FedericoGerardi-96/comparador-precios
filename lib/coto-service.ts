export async function getCotoProducts(query = "") {
  let targetUrl = "";
  if (!query) {
    const defaultSearch = "oferta";
    targetUrl = `https://ac.cnstrc.com/v1/search/${encodeURIComponent(defaultSearch)}?key=key_r6xzz4IAoTWcipni&num_results_per_page=24&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D&c=cio-fe-web-coto-3.4.2`;
  } else {
    targetUrl = `https://ac.cnstrc.com/v1/search/${encodeURIComponent(query)}?key=key_r6xzz4IAoTWcipni&num_results_per_page=24&pre_filter_expression=%7B%22name%22:%22store_availability%22,%22value%22:%22200%22%7D&c=cio-fe-web-coto-3.4.2`;
  }

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
    throw new Error(`Error en la API de Coto: ${response.statusText}`);
  }

  const data = await response.json();
  const results = data.response?.results || [];

  return results.map((item: any) => {
    const itemData = item.data || {};

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
    if (imageUrl && imageUrl.startsWith("//")) {
      imageUrl = `https:${imageUrl}`;
    } else if (imageUrl && imageUrl.startsWith("/")) {
      imageUrl = `https://api.coto.com.ar${imageUrl}`;
    }

    if (!imageUrl) {
      imageUrl = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80";
    }

    let categoryName = "Almacén";
    if (Array.isArray(itemData.groups) && itemData.groups.length > 0) {
      const group = itemData.groups[0];
      const displayNames = (group.path_list || []).map((p: any) => p.display_name)
        .concat([group.display_name || ""]);

      const hasBebida = displayNames.some((n: string) => /bebida|vino|cerveza|gaseosa|jugo/i.test(n));
      const hasLacteo = displayNames.some((n: string) => /lácteo|lacteo|queso|crema|leche|yogur|manteca|fresco|fiambr/i.test(n));

      if (hasBebida) {
        categoryName = "Bebidas";
      } else if (hasLacteo) {
        categoryName = "Lácteos";
      }
    }

    return {
      id: itemData.id || item.id || Math.random().toString(),
      name: item.value || itemData.name || "Producto sin nombre",
      brand: itemData.brand || itemData.product_brand || "Genérica",
      category: categoryName,
      image: imageUrl,
      prices: {
        Coto: finalPrice,
        Carrefour: Math.round(finalPrice * 1.07),
        Dia: Math.round(finalPrice * 0.94)
      }
    };
  });
}
