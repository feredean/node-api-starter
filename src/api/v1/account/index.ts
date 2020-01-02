import express from "express";

import {
    refresh,
    login,
    register,
    forgot,
    reset,
    getProfile,
    postProfile,
    deleteAccount,
    password
} from "./controller";
import { isAuthenticated } from "../../../middleware";

const router = express.Router();

// Sliding session - also used to refresh jwt payload (such as role change)
router.get("/jwt/refresh", isAuthenticated, refresh);
router.post("/login", login);
router.post("/register", register);
router.post("/forgot", forgot);
router.post("/reset/:token", reset);
router.get("/profile", isAuthenticated, getProfile);
router.post("/profile", isAuthenticated, postProfile);
router.post("/password", isAuthenticated, password);
router.post("/delete", isAuthenticated, deleteAccount);

export const accountRouter = router;
