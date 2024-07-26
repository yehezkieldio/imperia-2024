import type { commandStatus, commandType } from "@/lib/databases/postgres/schema";

export type CommandStatus = (typeof commandStatus.enumValues)[number];
export type CommandType = (typeof commandType.enumValues)[number];
