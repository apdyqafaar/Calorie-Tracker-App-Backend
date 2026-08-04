import jwt from "jsonwebtoken";

export class Jwt{
    generateToken(payload:{userId:string}): string {
        
        return jwt.sign(payload, process.env.JWT_SECRET_KEY as string, { expiresIn: '7d' });
    }
    // verify
    verifyToken(token: string): { userId: string} | null {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { userId: string};
            return decoded;
        } catch (error) {
            return null;
        }}
}

export const jwtService = new Jwt();