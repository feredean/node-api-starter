
export interface APIError {
    errors: { msg: string }[];
}
export const format = (...errors: string[]): APIError => {
    const result = [];
    for (const error of errors) {
        result.push({ msg: error });
    }
    return { errors: result };
}; 
