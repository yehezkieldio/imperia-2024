import { Piece } from "@sapphire/framework";

export abstract class Utility<Options extends Utility.Options = Utility.Options> extends Piece<Options, "utilities"> {}

export namespace Utility {
    export type LoaderContext = Piece.LoaderContext<"utilities">;
    export type Options = Piece.Options;
    export type JSON = Piece.JSON;
    export type LocationJSON = Piece.LocationJSON;
}
