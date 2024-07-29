import { dragonflyClient } from "@/lib/databases/dragonfly/client";

const flags: string[] = Bun.argv.filter((arg) => arg.startsWith("--"));

async function flushAllData(): Promise<void> {
    const flushAll: boolean = flags.includes("--all");

    try {
        if (flushAll) {
            await dragonflyClient.flushall();
            console.log("Successfully flushed all data from all databases in the dragonfly data store.");
        } else {
            await dragonflyClient.flushdb();
            console.log("Successfully flushed all data in the primary database in the dragonfly data store.");
        }

        process.exit(0);
    } catch (error) {
        console.error("An error occurred while trying to flush all data from the database", error);
    }
}

void flushAllData();
