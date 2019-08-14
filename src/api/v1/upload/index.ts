import multer from "multer";
import express from "express";

import * as mw from "middleware";
import * as controller from "api/v1/upload/controller";

const router = express.Router();
const upload = multer({});

router.post("/", [ mw.hasPermission("admin"), upload.any() ], controller.create);

export default router;