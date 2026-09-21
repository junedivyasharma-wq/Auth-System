import {Router} from "express";
import * as authControllers from "../controllers/auth.controller.js";

const authRouter= Router();

authRouter.post("/register",authControllers.register)
authRouter.get("/getMe",authControllers.getMe)
authRouter.get("/refresh-token", authControllers.refreshToken)
authRouter.get("/logout",authControllers.logout)
authRouter.get("/logout-all",authControllers.logoutAll)

authRouter.post("/login",authControllers.login)
authRouter.get("/verify-email",authControllers.verifyEmail)
export default authRouter;