import express from "express";

import * as mw from "middleware";
import * as controller from "api/v1/account/controller";

const router = express.Router();

router.get("/", mw.hasPermission("admin"), controller.index);
// Sliding session - also used to refresh jwt payload (such as role change)
router.get("/jwt/refresh", mw.isAuthenticated, controller.refresh);
router.post("/login", controller.login);
router.post("/register", controller.register);
router.post("/forgot", controller.forgot);
router.post("/reset/:token", controller.reset);
router.get("/profile", mw.isAuthenticated, controller.getProfile);
router.post("/profile", mw.isAuthenticated, controller.postProfile);
router.post("/password", mw.isAuthenticated, controller.password);
router.post("/delete", mw.isAuthenticated, controller.deleteAccount);

export default router;
