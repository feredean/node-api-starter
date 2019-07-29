import express from "express";
import * as controller from "./controller";
const router = express.Router();

// router.get("/", controller.index);
router.post("/register", controller.register);

export default router;
