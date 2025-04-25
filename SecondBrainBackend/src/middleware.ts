import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ts from 'typescript';
const JWT_SECRET = "secret";
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
      interface Request {
          userId?: string;
      }
  }
}

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header = req.header('Authorization');
    const decoded = jwt.verify(header as string, 'secret') as JwtPayload;
    if(decoded) {
        req.userId = decoded.id;
        next();
    } else {
        res.status(403).json({
            message: "You are not logged in"
        })
        return;
    }
}