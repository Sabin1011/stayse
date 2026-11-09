import type { Request, Response, NextFunction } from "express";

import type {RegisterUser} from "../../../application/use-cases/register-user.use-case.js";
import { registerUserSchema } from "../validators/register-user.validator.js";

export class RegisterUserController {
    constructor(private readonly registerUser: RegisterUser) {}

    handle = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> => {
        const validation = registerUserSchema.safeParse(req.body);

        if(!validation.success) {
            res.status(400).json({
                message:"validation failed",
                errors: validation.error.issues.map((issue)=> ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });
            return;
        }

        try{
            const user = await this.registerUser.execute(validation.data);

            res.status(201).json({
                message: "Registration successful",
                user: {
                    id: user.id,
                    fullName: user.fullName, 
                    email: user.email.getValue(),
                    status: user.status,
                    createdAt: user.createdAt,
                },
            });
        } catch (error) {
            next(error);
        };
    }
}