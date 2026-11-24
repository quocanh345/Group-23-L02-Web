import bcrypt from "bcryptjs";
import { UserRepository, type SafeUser } from "./user.repository.js";
import { EmailTakenError, InvalidCredentialsError } from "./user.errors.js";

type RegisterData = {
    email: string,
    password: string,
    fullName: string
}

type LoginData = {
    email: string,
    password: string
}

export class UserService {
    private userRepository: UserRepository
    constructor(){
        this.userRepository = new UserRepository()
    }

    //Đăng ký
    async register(data: RegisterData): Promise<SafeUser>{
        const email = data.email.trim().toLowerCase()
        const fullName = data.fullName.trim()

        //Kiểm tra email đã tồn tại
        const existingUser = await this.userRepository.findByEmail(email);
        if(existingUser){
            throw new EmailTakenError()
        }
        //Mã hóa mật khẩu
        const passwordHash = await bcrypt.hash(data.password, 12)
        //Tạo User 
        const user = await this.userRepository.create({
            email,
            passwordHash,
            fullName
        })


        return user
    }

    //Đăng nhập
    async login(data: LoginData): Promise<SafeUser>{
        const email = data.email.trim().toLocaleLowerCase()
        const user = await this.userRepository.findByEmailWithPassword(email)

        if(!user){
            throw new InvalidCredentialsError()
        }
        const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash)

        if(!isPasswordValid){
            throw new InvalidCredentialsError();
        }
        //Không trả passwordHash
        const {passwordHash, ...safeUser} = user;
        return safeUser;
    }
}

