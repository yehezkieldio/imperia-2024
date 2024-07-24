import { container } from "@sapphire/framework";

export async function createSearchIndex(
    indexName: string,
    prefix: string,
    schema: { [key: string]: string },
): Promise<boolean> {
    const indexes = (await container.database.dragonfly.call("FT._LIST")) as string[];

    if (!indexes.includes(indexName)) {
        const schemaArray: string[] = [];

        for (const [field, type] of Object.entries(schema)) {
            schemaArray.push(field, type);
        }

        await container.database.dragonfly.call(
            "FT.CREATE",
            indexName,
            "ON",
            "HASH",
            "PREFIX",
            "1",
            prefix,
            "SCHEMA",
            ...schemaArray,
        );

        return true;
    }

    return false;
}
