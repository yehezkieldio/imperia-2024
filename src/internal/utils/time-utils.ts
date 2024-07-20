import dayjs, { type Dayjs } from "dayjs";

export function humanizeDuration(ms: number): string {
    const duration: Dayjs = dayjs(ms);
    const hours: number = duration.get("hours");
    const minutes: number = duration.get("minutes");
    const seconds: number = duration.get("seconds");

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} hours`);
    if (minutes > 0) parts.push(`${minutes} minutes`);
    if (seconds > 0) parts.push(`${seconds} seconds`);

    return parts.length > 0 ? parts.join(", ") : "less than a second";
}
