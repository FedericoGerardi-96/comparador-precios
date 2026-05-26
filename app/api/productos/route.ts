import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    // Buscar en la base de datos
    const productosDB = await prisma.producto.findMany({
      where: query ? {
        OR: [
          { nombre: { contains: query, mode: "insensitive" } },
          { marca: { contains: query, mode: "insensitive" } },
        ]
      } : undefined,
      include: {
        precios: {
          include: {
            supermercado: true
          }
        }
      },
      take: 24,
    });

    // Mapear los resultados al formato esperado por el frontend
    const results = productosDB.map(prod => {
      const pricesMap: Record<string, number> = {};
      prod.precios.forEach(p => {
        pricesMap[p.supermercado.nombre] = p.precio;
      });

      return {
        id: prod.id,
        name: prod.nombre,
        brand: prod.marca,
        category: prod.categoria,
        image: prod.imagenUrl || "",
        prices: pricesMap
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
