import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import { cutText, isThenable } from "@sapphire/utilities";
import { inspect } from "bun";
import { type Message, bold, codeBlock } from "discord.js";

export class EvalCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Evaluate a JavaScript code.",
            aliases: ["evalute", "ev"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const codeArgument: ResultType<string> = await args.restResult("string");

        if (codeArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(゜-゜) You didn't provide any code to evaluate, how am I supposed to do that?",
            });
        }

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("success");
        const code: string = codeArgument.unwrap();

        await message.delete();

        const result: string = (await this.processCode(code)) as string;
        embed.setFields([
            {
                name: bold("— INPUT"),
                value: codeBlock("js", this.preProcessCode(code)),
            },
            {
                name: bold("— OUTPUT"),
                value: codeBlock("js", result),
            },
        ]);

        return await message.channel.send({ embeds: [embed] });
    }

    private preProcessCode(code: string): string {
        if (code.startsWith("```") && code.endsWith("```")) {
            return code.slice(5, -3);
        }

        if (code.startsWith("`") && code.endsWith("`")) {
            return code.slice(1, -1);
        }

        return code;
    }

    private postProcessCode(result: string) {
        let content: string = result;

        if (content && content.length > 1900) {
            content = cutText(result, 1900);
        }

        if (content.includes(Bun.env.DISCORD_TOKEN)) {
            content = content.replace(Bun.env.DISCORD_TOKEN, "[REDACTED]");
        }

        return content;
    }

    private async processCode(providedCode: string) {
        const code: string = this.preProcessCode(providedCode);
        let content: unknown;

        try {
            // biome-ignore lint/security/noGlobalEval: This is an eval command, it's expected to use eval.
            let evaled = eval(code);
            if (isThenable(evaled)) evaled = await evaled;
            if (typeof evaled !== "string") evaled = inspect(evaled, { depth: 0 });
            content = this.postProcessCode(evaled);
        } catch (error) {
            content = this.postProcessCode(String(error));
        }

        return content;
    }
}
