import { privy } from "@/lib/privy";
import { NextResponse } from "next/server";
import { odosClient } from "@/services/odos";

export async function POST(request: Request) {
    try {
        await privy.getClaims();

        const { pathId, userAddr } = await request.json();

        if (!pathId || !userAddr) {
            return NextResponse.json(
                { error: "Path ID and user address are required" },
                { status: 400 }
            );
        }

        const assembledTransaction = await odosClient.assembleTransaction(pathId, userAddr);

        if (!assembledTransaction || !assembledTransaction.simulation.isSuccess) {
            return NextResponse.json(
                { error: "Failed to assemble transaction or simulation failed" },
                { status: 500 }
            );
        }

        return NextResponse.json(assembledTransaction);

    } catch (error) {
        console.error("Error assembling transaction:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
