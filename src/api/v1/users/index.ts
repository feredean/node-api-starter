import express from "express";
import { hasPermission } from "../../../middleware";
import { index } from "./controller";

const router = express.Router();

router.get("/", hasPermission("admin"), index);

export const usersRouter = router;
