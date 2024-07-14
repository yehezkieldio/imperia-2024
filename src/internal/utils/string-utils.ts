export const trimString = (str: string, length: number) => {
    return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const stripHtmlTags = (str: string) => str.replace(/<[^>]*>?/gm, "").replace(/<br\/?>/gm, "\n");
