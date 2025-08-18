"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupUploadedFile = exports.validateUploadedFile = exports.handleUploadError = exports.uploadResume = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./errorHandler");
const constants_1 = require("../../../shared/constants");
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});
// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!constants_1.FILE_UPLOAD.ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new errorHandler_1.CustomError(`Invalid file type. Allowed types: ${constants_1.FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`, 400));
    }
    // Check file extension
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!constants_1.FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new errorHandler_1.CustomError(`Invalid file extension. Allowed extensions: ${constants_1.FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`, 400));
    }
    cb(null, true);
};
// Configure multer
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: constants_1.FILE_UPLOAD.MAX_SIZE, // 5MB
        files: 1, // Only allow 1 file per request
    }
});
// Resume upload middleware
exports.uploadResume = exports.upload.single('resume');
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return next(new errorHandler_1.CustomError('File too large. Maximum size is 5MB.', 400));
            case 'LIMIT_FILE_COUNT':
                return next(new errorHandler_1.CustomError('Too many files. Only 1 file allowed.', 400));
            case 'LIMIT_UNEXPECTED_FILE':
                return next(new errorHandler_1.CustomError('Unexpected file field.', 400));
            default:
                return next(new errorHandler_1.CustomError('File upload error.', 400));
        }
    }
    if (error) {
        return next(error);
    }
    next();
};
exports.handleUploadError = handleUploadError;
// Validate uploaded file
const validateUploadedFile = (req, res, next) => {
    if (!req.file) {
        return next(new errorHandler_1.CustomError('No file uploaded.', 400));
    }
    // Additional validation if needed
    const fileSize = req.file.size;
    if (fileSize > constants_1.FILE_UPLOAD.MAX_SIZE) {
        return next(new errorHandler_1.CustomError('File size exceeds limit.', 400));
    }
    next();
};
exports.validateUploadedFile = validateUploadedFile;
// Clean up uploaded files on error
const cleanupUploadedFile = (req, res, next) => {
    // This middleware can be used to clean up files if processing fails
    res.on('finish', () => {
        if (res.statusCode >= 400 && req.file) {
            // Delete the uploaded file if there was an error
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }
    });
    next();
};
exports.cleanupUploadedFile = cleanupUploadedFile;
//# sourceMappingURL=upload.js.map