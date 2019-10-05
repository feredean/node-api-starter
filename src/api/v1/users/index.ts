import express from "express";

import * as mw from "middleware";
import * as controller from "api/v1/users/controller";

const router = express.Router();

router.get("/", mw.hasPermission("admin"), controller.index);

export default router;