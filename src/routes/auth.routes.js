import {Router} from "express";
import * as authControllers from "../controllers/auth.controller.js";

const authRouter= Router();

authRouter.post("/register",authControllers.register)
authRouter.get("/getMe",authControllers.getMe)
export default authRouter;