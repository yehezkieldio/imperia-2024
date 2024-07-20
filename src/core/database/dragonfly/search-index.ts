import { container } from "@sapphire/framework";

async function createSearchIndex(indexName: string, prefix: string, schema: { [key: string]: string }): Promise<void> {
    const indexes = (await container.df.call("FT._LIST")) as string[];
    if (!indexes.includes(indexName)) {
        const schemaArray: string[] = [];
        for (const [field, type] of Object.entries(schema)) {
            schemaArray.push(field, type);
        }
        await container.df.call("FT.CREATE", indexName, "ON", "HASH", "PREFIX", "1", prefix, "SCHEMA", ...schemaArray);
    }
}

export async function createDfSearchIndexes(): Promise<void> {
    await createSearchIndex("github_idx", "github:search_", {
        type: "TAG",
        search: "TEXT",
        data: "TEXT",
    });
}
