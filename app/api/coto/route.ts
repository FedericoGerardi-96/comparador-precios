import { NextResponse } from "next/server";
import { getCotoProducts } from "@/lib/coto-service";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    try {
        const productosMapeados = await getCotoProducts(query);
        return NextResponse.json(productosMapeados);
    } catch (error: any) {
        console.error("Error al obtener productos desde la base de datos:", error);
        return NextResponse.json(
            { error: "Error de conexión interna con la base de datos de Supabase", details: error.message },
            { status: 500 }
        );
    }
}