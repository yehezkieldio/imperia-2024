import { dragonflyClient } from "@/lib/databases/dragonfly/client";

async function flushAllData(): Promise<void> {
    try {
        await dragonflyClient.flushdb();
        console.log("Successfully flushed all data from the dragonfly data store");
        process.exit(0);
    } catch (error) {
        console.error("An error occurred while trying to flush all data from the database", error);
    }
}

void flushAllData();
