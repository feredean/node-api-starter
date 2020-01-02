import multer from "multer";
import express from "express";

import { hasPermission } from "../../../middleware";
import { upload } from "./controller";

const router = express.Router();
const m = multer({});

router.post("/", [hasPermission("admin"), m.any()], upload);

export const uploadRouter = router;
