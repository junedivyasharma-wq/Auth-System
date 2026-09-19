import {Router} from "express";
import * as authControllers from "../controllers/auth.controller.js";

const authRouter= Router();

authRouter.post("/register",authControllers.register)
authRouter.get("/getMe",authControllers.getMe)
authRouter.get("/refresh-token", authControllers.refreshToken)
authRouter.get("/logout",authControllers.logout)
export default authRouter;