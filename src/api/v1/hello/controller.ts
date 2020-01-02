import { Response, Request } from "express";
import { SUCCESSFUL_RESPONSE } from "../../../util/success";

export const index = (_req: Request, res: Response): void => {
    res.status(200).json(SUCCESSFUL_RESPONSE);
};
