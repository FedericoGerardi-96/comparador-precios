import { NextResponse } from "next/server";
import { getCotoProducts } from "@/lib/coto-service";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    try {
        const productosMapeados = await getCotoProducts(query);
        return NextResponse.json(productosMapeados);
    } catch (error: any) {
        console.error("Error en la API de Coto:", error);
        return NextResponse.json(
            { error: "Error de conexión interna con el servidor de Coto", details: error.message },
            { status: 500 }
        );
    }
}