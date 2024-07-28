import { ImperiaCommand } from "@/lib/extensions/command";
import { ImperiaIdentifiers } from "@/lib/extensions/identifiers";
import { effectAvailable } from "@/lib/resolvers";
import { FetchResultTypes, fetch } from "@sapphire/fetch";
import {
    type Args,
    type ArgumentError,
    CommandOptionsRunTypeEnum,
    type ResultType,
    UserError,
} from "@sapphire/framework";
import * as phonton from "@silvia-odwyer/photon-node";
import { type Attachment, AttachmentBuilder, type Message, SlashCommandBuilder } from "discord.js";

export class EffectImageCommand extends ImperiaCommand {
    public constructor(context: ImperiaCommand.Context, options: ImperiaCommand.Options) {
        super(context, {
            ...options,
            description: "Apply a special effect to an image.",
            tags: ["image", "image-processing"],
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
                    .setName("effect")
                    .setDescription("The effect to apply to the image.")
                    .setRequired(true)
                    .addChoices([...effectAvailable.map(({ name, value }) => ({ name, value }))]),
            );

        void registry.registerChatInputCommand(command);
    }

    #reply = "˖ ݁𖥔 ݁˖ Here's what I made for you~";
    #invalidExtension = "( •́ ⍨ •̀) Make sure to provide an image with a valid file extension (jpg, jpeg, png).";

    public async chatInputRun(interaction: ImperiaCommand.ChatInputCommandInteraction): Promise<Message> {
        await interaction.deferReply();
        const image: Attachment = interaction.options.getAttachment("image", true);

        if (!this.container.utilities.toolbox.isValidAttachment(image)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: this.#invalidExtension,
            });
        }

        const effect: string = interaction.options.getString("effect", true);
        const effectedImage: AttachmentBuilder = await this.applyEffectToImage(image, effect);

        return interaction.editReply({
            files: [effectedImage],
            content: `${this.#reply}\n\nApplied filter: ${this.container.utilities.string.convertToSpaced(effect)}`,
        });
    }

    public async messageRun(message: Message, args: Args): Promise<Message> {
        const effectArgument: ResultType<string> = await args.pickResult("imageEffect");

        if (effectArgument.isErr()) {
            const error: UserError | ArgumentError<string> = effectArgument.unwrapErr();

            if (error.identifier === ImperiaIdentifiers.ArgumentEffectImageError) {
                throw new UserError({
                    identifier: ImperiaIdentifiers.CommandServiceError,
                    message: error.message,
                });
            }

            throw new UserError({
                identifier: ImperiaIdentifiers.ArgsMissing,
                message: "(?_?) Please provide a effect to apply to the image!",
            });
        }

        if (message.attachments.size === 0) {
            throw new UserError({
                identifier: ImperiaIdentifiers.InvalidArgumentProvided,
                message: "(o_O)? You didn't attach an image for me to effect! Please attach an image and try again.",
            });
        }

        const image: Attachment | undefined = message.attachments.first();
        if (!image) {
            throw new UserError({
                identifier: ImperiaIdentifiers.InvalidArgumentProvided,
                message: "(o_O)? Did Discord eat the image you attached? I can't find it.",
            });
        }

        if (!this.container.utilities.toolbox.isValidAttachment(image)) {
            throw new UserError({
                identifier: ImperiaIdentifiers.CommandServiceError,
                message: this.#invalidExtension,
            });
        }

        const effect: string = effectArgument.unwrap();
        const effectedImage: AttachmentBuilder = await this.applyEffectToImage(image, effect);

        return message.reply({
            files: [effectedImage],
            content: `${this.#reply}\n\nApplied filter: ${this.container.utilities.string.convertToSpaced(effect)}`,
        });
    }

    private async applyEffectToImage(image: Attachment, filter: string): Promise<AttachmentBuilder> {
        const base64Image: string = await this.convertImagetoBase64(image.url);
        const phontonImage: phonton.PhotonImage = phonton.PhotonImage.new_from_base64(base64Image);
        const effectValues: string[] = effectAvailable.map((effect) => effect.value);

        switch (filter) {
            case effectValues[0]:
                phonton.oil(phontonImage, 4, 55);
                break;
            case effectValues[1]:
                phonton.solarize(phontonImage);
                break;
            case effectValues[2]:
                phonton.offset_red(phontonImage, 30);
                break;
            case effectValues[3]:
                phonton.offset_blue(phontonImage, 30);
                break;
            case effectValues[4]:
                phonton.offset_green(phontonImage, 30);
                break;
        }

        const uint8Array: Uint8Array = phontonImage.get_bytes();
        const buffer: Buffer = Buffer.from(uint8Array);

        return new AttachmentBuilder(buffer, {
            name: `${image.url}-imperia_effected.jpg`,
        });
    }

    private async convertImagetoBase64(url: string): Promise<string> {
        const response: Buffer = await fetch(url, FetchResultTypes.Buffer);

        return response.toString("base64");
    }
}
