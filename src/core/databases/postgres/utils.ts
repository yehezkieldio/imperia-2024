import { commandStatus, commandType } from "@/core/databases/postgres/schema";
import { z } from "zod";

const commandStatusSchema = z.enum(commandStatus.enumValues);
export type CommandStatus = z.infer<typeof commandStatusSchema>;

const commandTypeSchema = z.enum(commandType.enumValues);
export type CommandType = z.infer<typeof commandTypeSchema>;
