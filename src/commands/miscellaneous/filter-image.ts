import { ImperiaCommand } from "@/core/extensions/command";
import { ImperiaIdentifiers } from "@/core/extensions/identifiers";
import { filters } from "@/core/resolvers/image-filter";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import { capitalizeFirstLetter } from "@sapphire/utilities";
import * as phonton from "@silvia-odwyer/photon-node";
import { type Attachment, AttachmentBuilder, type Message, SlashCommandBuilder } from "discord.js";

export class FilterImageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            description: "Apply a filter or effect to an image.",
            tags: ["media"],
            aliases: ["filter"],
            runIn: CommandOptionsRunTypeEnum.GuildText,
        });
    }

    public override registerApplicationCommands(registry: ImperiaCommand.Registry): void {
        const command = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addAttachmentOption((option) =>
                option.setName("image").setDescription("The image to apply a filter to.").setRequired(true),
            )
            .addStringOption((option) =>
                option
                    .setName("filter")
                    .setDescription("The filter to apply to the image.")
                    .setRequired(true)
                    .addChoices([...filters.map(({ name, value }) => ({ name, value }))]),
            );

        void registry.registerChatInputCommand(command, {
            guildIds: [],
            idHints: [],
        });
    }

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply();

        const image: Attachment = interaction.options.getAttachment("image", true);

        if (!this.checkForImageFileExtension(image.url)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( •́ ⍨ •̀) Make sure to provide an image with a valid file extension (jpg, jpeg, png).",
            });
        }

        const filter: string = interaction.options.getString("filter", true);
        const filteredImage: AttachmentBuilder = await this.applyFilterToImage(image, filter);

        return interaction.editReply({
            files: [filteredImage],
            content: `( ^_^)／ Here's your filtered image!\n\nApplied filter: ${capitalizeFirstLetter(filter)}`,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const filterArgument: ResultType<string> = await args.pickResult("imageFilter");

        if (filterArgument.isErr()) {
            const error: UserError | ArgumentError<string> = filterArgument.unwrapErr();

            if (error.identifier === ImperiaIdentifiers.ArgumentFilterImageError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: error.message,
                });
            }

            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(?_?) Please provide a filter to apply to the image!",
            });
        }

        if (message.attachments.size === 0) return message.reply("(o_O)? You didn't attach an image for me to filter.");

        const image: Attachment | undefined = message.attachments.first();
        if (!image) return message.reply("(o_O)? I couldn't find the image you attached.");

        if (!this.checkForImageFileExtension(image.url)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: "( •́ ⍨ •̀) Make sure to provide an image with a valid file extension (jpg, jpeg, png).",
            });
        }

        const filter: string = filterArgument.unwrap();
        const filteredImage: AttachmentBuilder = await this.applyFilterToImage(image, filter);

        return message.reply({
            files: [filteredImage],
            content: `( ^_^)／ Here's your filtered image!\n\nApplied filter: ${capitalizeFirstLetter(filter)}`,
        });
    }

    private async applyFilterToImage(image: Attachment, filter: string): Promise<AttachmentBuilder> {
        const base64Image: string = await this.convertImagetoBase64(image.url);
        const phontonImage: phonton.PhotonImage = phonton.PhotonImage.new_from_base64(base64Image);

        phonton.filter(phontonImage, filter);

        const uint8Array: Uint8Array = phontonImage.get_bytes();
        const buffer: Buffer = Buffer.from(uint8Array);

        return new AttachmentBuilder(buffer, {
            name: "filtered-image.png",
        });
    }

    private async convertImagetoBase64(url: string): Promise<string> {
        const response: Buffer = await fetch(url, FetchResultTypes.Buffer);

        return response.toString("base64");
    }

    private checkForImageFileExtension(url: string): boolean {
        const imageExtensionPattern = /\.(jpg|jpeg|png)$/i;

        try {
            const urlObject = new URL(url);
            return imageExtensionPattern.test(urlObject.pathname);
        } catch {
            return false;
        }
    }
}
