interface Token {
    tokenAddress: string;
    amount: string;
}

interface Transaction {
    gas: number;
    gasPrice: number;
    value: string;
    to: string;
    from: string;
    data: string;
    nonce: number;
    chainId: number;
}

interface Simulation {
    isSuccess: boolean;
    amountsOut: number[];
    gasEstimate: number;
    simulationError: null | string;
}

export interface OdosQuoteResponse {
    deprecated: null;
    traceId: string;
    blockNumber: number;
    gasEstimate: number;
    gasEstimateValue: number;
    inputTokens: Token[];
    outputTokens: Token[];
    netOutValue: number;
    outValues: string[];
    transaction: Transaction;
    pathId: string;
}

export interface OdosAssembledTransaction extends OdosQuoteResponse {
    simulation: Simulation;
}

