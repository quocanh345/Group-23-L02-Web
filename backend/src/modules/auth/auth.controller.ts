import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";
import { error } from "node:console";

//chuẩn hóa Email
const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase()
}
//kiểm tra Email
const isValidEmail = (email: string) => {
    const emaiRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emaiRegex.test(email);
}

//Hàm trả lỗi chung
type ValidationDetail = {
    field: string
    message: string
}
const sendError = (
    res: Response,
    status: number,
    code: string,
    message: string,
    details?: ValidationDetail[],
) =>{
    const errorData = {
        code,
        message,
        details,
    };
    return res.status(status).json({
        error: errorData,
    })
}
