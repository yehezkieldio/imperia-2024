export interface RandomCatFactQueryResult {
    fact: string;
    length: number;
}

export interface RandomDogFactQueryResult {
    facts: string[];
    success: boolean;
}

export interface RandomFactQueryResult {
    fact: string;
}