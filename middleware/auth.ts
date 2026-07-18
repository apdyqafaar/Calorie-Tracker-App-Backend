import { NextFunction,Response, Request } from "express";
import { jwtService } from "../lib/services/jwt.service";
import { authServices } from "../lib";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: any;
                email: string;
            }
        }
    }
}

export const protect = async(req: Request, res: Response, next: NextFunction) => {

    let token :string| undefined
    try {
        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer ")){
            token=req.headers.authorization.split(" ")[1]
        }
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided",
                timestamp: new Date().toISOString()
            });
        }

        // Verify token
        const decoded = jwtService.verifyToken(token);

          if(!decoded || typeof decoded === 'string') {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - Invalid token",
                timestamp: new Date().toISOString()
            });
          }

           // check if he is real user
        const user= await authServices.getUserById(decoded.userId);
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User not found",
                timestamp: new Date().toISOString()
            });
        }
        // Attach user info to request object
        req.user = {
            userId: user._id,
            email: user.email,
        };
        next();
    } catch (error) {
        // Handle different types of errors
        if (error instanceof Error) {
            if (error.message.includes("expired")) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized - Token expired",
                    timestamp: new Date().toISOString()
                });
            }
        }

        return res.status(401).json({
            success: false,
            message: "Unauthorized - Invalid token",
            timestamp: new Date().toISOString()
        });
    }
}