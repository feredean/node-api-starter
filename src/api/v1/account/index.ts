import express from "express";

import * as mw from "middleware";
import * as controller from "api/v1/account/controller";

const router = express.Router();

router.get("/", mw.hasPermission("admin"), controller.index);
router.get("/jwt/refresh", mw.isAuthenticated, controller.refresh);
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/forgot", controller.forgot);
router.post("/reset/:token", controller.reset);


export default router;
