import { Router } from "express";
import { register, login } from "./auth.controller.js";

const authRouter = Router();

//API đăng ký
authRouter.post('/register', register);
//API đăng nhập
authRouter.post('/login', login);

export default authRouter;