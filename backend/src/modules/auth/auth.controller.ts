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


type ValidationDetail = {
    field: string
    message: string
}
//Hàm trả lỗi chung
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

//Register
export async function register(req: Request, res: Response) {
    const {email, password, fullName} = req.body ?? {}

    if(
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        typeof fullName !== 'string'
    ){
        return sendError(
            res,
            400,
            'VALIDATION_ERROR',
            'Dữ liệu đăng ký không hợp lệ'
        )
    }
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = fullName.trim();
    const errors: ValidationDetail[] = [];

    if(!isValidEmail(normalizedEmail) || normalizedEmail.length > 255){
        errors.push({field: 'email', message: 'Email không hợp lệ'})
    }
    if(password.length < 8 || password.length > 72 || Buffer.byteLength(password, 'utf8') > 72){
        errors.push({field: 'password', message: 'Mật khẩu từ 8-72 ký tự'})
    }
    if(normalizedName.length < 1 || normalizedName.length > 100){
        errors.push({field: 'fullName', message: 'Họ tên từ 1-100 ký tự'})
    }

    if(errors.length > 0){
        return sendError(res, 400, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', errors)
    }

    try{
        //Kiểm tra email đã tồn tại
        const existingUser = await prisma.user.findUnique({where: {email: normalizedEmail}});
        if(existingUser){
            return sendError(
                res,
                409,
                'EMAIL_TAKEN',
                'Email đã được sử dụng',
            )
        }

        //Tạo tài khoản + mã hóa mk
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {email: normalizedEmail, passwordHash, fullName: normalizedName, role: 'learner'},
            select: {id: true, email:true, fullName: true, role: true, createdAt: true},
        })

        return res.status(201).json({data : user})
    }catch (error){
        //2 request trùng email 1 lúc
        if(typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'){
            return sendError(res, 409, 'EMAIL_TAKEN', 'Email đã được sử dụng')
        }

        console.error('Register error: ', error);
        return sendError(res, 500, 'INTERNAL_ERROR', 'Đã xảy ra lỗi máy chủ')
    }
  
}

//Login