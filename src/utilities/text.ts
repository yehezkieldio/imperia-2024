import { Utility } from "@/core/stores/utilities/utility";

/**
 * A utility class with text-related methods.
 */
export class TextUtilities extends Utility {
    public constructor(context: Utility.LoaderContext, options: Utility.Options) {
        super(context, {
            ...options,
            name: "text",
        });
    }

    /**
     * Parse a html Wikipedia extract into a more readable format.
     */
    public parseExtract(html: string) {
        const replacements: [RegExp, string][] = [
            [/<p>(.*?)<\/p>/g, "$1\n"], // Replace paragraphs with their content and a newline
            [/<ul>|<\/ul>/g, ""], // Remove unordered list tags
            [/<li>(.*?)<\/li>/g, "- $1"], // Replace list items with bullet points
        ];

        const inlineReplacements: [RegExp, string][] = [
            [/<b>(.*?)<\/b>/g, "**$1**"], // Replace bold with markdown bold
            [/<i>(.*?)<\/i>/g, "*$1*"], // Replace italic with markdown italic
            [/<[^>]*>/g, ""], // Remove any remaining HTML tags
        ];

        let result = html;

        for (const [pattern, replacement] of replacements) {
            result = result.replace(pattern, replacement);
        }

        result = result
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .join("\n");

        for (const [pattern, replacement] of inlineReplacements) {
            result = result.replace(pattern, replacement);
        }

        return result.trim();
    }

    /**
     * Handle Wikipedia disambiguation results to be more Discord embed friendly.
     * Attempts to handle "most often refers to" and "may refer to" disambiguation text.
     */
    public disambiguation(text: string) {
        let newText: string = text;

        if (text.includes("most often refers to:")) {
            newText = newText.replace(/most often refers to:(\S)?/i, "most often refers to: $1");
            newText = newText.replace(/most often refers to:/i, "most often refers to:\n-");
        } else if (text.includes("may refer to")) {
            newText = newText.replace(/may refer to/i, "");
        }

        newText = newText.replace(/-\s-\s/, "- ");

        return newText.trim();
    }

    /**
     * Check if a Wikipedia extract is a disambiguation page, that has no disambiguation text.
     */
    public onlyDisambiguation(text: string) {
        const trimmedExtract = text.trim();

        const pattern = /^.+\s+may refer to:$/i;

        if (pattern.test(trimmedExtract)) {
            return false;
        }

        return true;
    }

    /**
     * Chunk text into smaller parts based on a maximum length.
     */
    public chunkText(text: string, maxLength: number): string[] {
        const sentences: string[] = text.split(". ");
        const chunks: string[] = [];

        let chunk = "";
        for (const sentence of sentences) {
            if (chunk.length + sentence.length < maxLength) {
                chunk += `${sentence}. `;
            } else {
                chunks.push(chunk);
                chunk = `${sentence}. `;
            }
        }

        if (chunk) chunks.push(chunk);

        return chunks;
    }

    /**
     * Chunk paragraphs into smaller parts based on a maximum length.
     */
    public chunkParagraphs(text: string): string[] {
        const sentences: string[] = text.split(". ");
        const chunks: string[] = [];

        let chunk = "";
        let sentenceCount = 0;

        for (const sentence of sentences) {
            if (sentenceCount < 2) {
                chunk += `${this.addDotToEnd(sentence)} `;
                sentenceCount++;
            } else {
                chunks.push(chunk.trim());
                chunk = `${this.addDotToEnd(sentence)} `;
                sentenceCount = 1;
            }
        }

        if (chunk) chunks.push(chunk.trim());

        return chunks;
    }

    /**
     * Trim or cut a string to a specific length.
     */
    public trim(str: string, length: number): string {
        return str.length > length ? `${str.substring(0, length)}` : str;
    }

    /**
     * Get the first two paragraphs of a text.
     */
    public getFirstTwoParagraphs(text: string): string {
        return this.chunkParagraphs(text).slice(0, 2).join("\n\n");
    }

    /**
     * Add a dot to the end of a string if it doesn't already have one.
     */
    public addDotToEnd(text: string): string {
        return text.endsWith(".") ? text : `${text}.`;
    }
}
