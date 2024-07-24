import { Piece } from "@sapphire/pieces";

export abstract class Repository<Options extends Repository.Options = Repository.Options> extends Piece<
    Options,
    "repositories"
> {}

export namespace Repository {
    export type Context = LoaderContext;
    export type LoaderContext = Piece.LoaderContext<"repositories">;
    export type Options = Piece.Options;
    export type JSON = Piece.JSON;
    export type LocationJSON = Piece.LocationJSON;
}
