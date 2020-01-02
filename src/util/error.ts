export interface APIError {
    errors: { msg: string }[];
}
export const formatError = (...errors: string[]): APIError => {
    const result = [];
    for (const error of errors) {
        result.push({ msg: error });
    }
    return { errors: result };
};
