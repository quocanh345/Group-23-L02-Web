import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../../lib/prisma.js";

//chuẩn hóa Email
function normalizeEmail(email :any) {
    return email.trim().toLowerCase()
}