import multer from 'multer';
import { NextFunction, Request, Response } from 'express';
export declare const upload: multer.Multer;
export declare const uploadResume: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const handleUploadError: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const validateUploadedFile: (req: Request, res: Response, next: NextFunction) => void;
export declare const cleanupUploadedFile: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=upload.d.ts.map