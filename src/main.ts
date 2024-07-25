import { envVariables } from "@/lib/env";

envVariables.parse(process.env);

export function main() {
    console.log("Hello, world!");
}
