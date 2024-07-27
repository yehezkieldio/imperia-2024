import type { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaEmbedBuilder } from "@/lib/extensions/embed-builder";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { ImperiaSubcommand } from "@/lib/extensions/subcommand";
import { type Args, CommandOptionsRunTypeEnum, type ResultType, UserError } from "@sapphire/framework";
import type { Message, User } from "discord.js";

export class UserBlacklistCommand extends ImperiaSubcommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Manage the user blacklist.",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            preconditions: ["DeveloperOnly"],
            subcommands: [
                {
                    name: "list",
                    messageRun: "messageUserList",
                    default: true,
                },
                {
                    name: "add",
                    messageRun: "messageUserAdd",
                },
                {
                    name: "remove",
                    messageRun: "messageUserRemove",
                },
            ],
        });
    }

    public async messageUserList(message: Message): Promise<Message> {
        const blacklistedUsers: string[] = await this.container.services.blacklist.getUsers();

        if (blacklistedUsers.length === 0) {
            return await message.channel.send({
                content: "(゜-゜) There are no blacklisted users. Good for them!",
            });
        }

        const usernames: string[] = blacklistedUsers.map((userId: string) => {
            const user = this.container.client.users.cache.get(userId);
            return user ? `${user.tag} (${user.id})` : userId;
        });

        const embed: ImperiaEmbedBuilder = new ImperiaEmbedBuilder().setColorScheme("info");

        embed.setFields([
            {
                name: "— Blacklisted Users",
                value: usernames.join("\n"),
            },
        ]);

        return await message.reply({ embeds: [embed] });
    }

    #noUser = "(゜-゜) You didn't provide any user to blacklist, how am I supposed to do that? Blacklist yourself?";

    public async messageUserAdd(message: Message, args: Args): Promise<Message> {
        const userArgument: ResultType<User> = await args.pickResult("user");

        if (userArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: this.#noUser,
            });
        }

        const user = userArgument.unwrap();

        if (user.id === this.container.client.user?.id) {
            return await message.reply({
                content: "(゜-゜) You can't blacklist me!",
            });
        }

        if (user.id === message.author.id) {
            return await message.reply({
                content: "(゜-゜) What are you trying to do? Blacklist yourself?",
            });
        }

        const isBlacklisted: boolean = await this.container.services.blacklist.isUserBlacklisted(user.id);

        if (isBlacklisted) {
            return await message.reply({
                content: "(゜-゜) This user is already blacklisted!",
            });
        }

        await this.container.services.blacklist.blacklistUser(user.id);

        return await message.reply({
            content: "(๑>ᗜºั) Successfully blacklisted this user!",
        });
    }

    public async messageUserRemove(message: Message, args: Args): Promise<Message> {
        const userArgument: ResultType<User> = await args.pickResult("user");

        if (userArgument.isErr()) {
            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: this.#noUser,
            });
        }

        const user = userArgument.unwrap();

        const isBlacklisted: boolean = await this.container.services.blacklist.isUserBlacklisted(user.id);

        if (!isBlacklisted) {
            return await message.reply({
                content: "(゜-゜) This user is not blacklisted!",
            });
        }

        await this.container.services.blacklist.unblacklistUser(user.id);

        return await message.reply({
            content: "(๑>ᗜºั) Successfully unblacklisted this user!",
        });
    }
}
