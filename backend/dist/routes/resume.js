"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const supabase_1 = require("../config/supabase");
const openrouter_1 = require("../config/openrouter");
const errorHandler_1 = require("../middleware/errorHandler");
const upload_1 = require("../middleware/upload");
const errorHandler_2 = require("../middleware/errorHandler");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Validation middleware
const validateResumeData = [
    (0, express_validator_1.body)('title').optional().trim().isLength({ min: 1, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ max: 500 }),
];
// Upload and parse resume
router.post('/upload', upload_1.uploadResume, upload_1.handleUploadError, upload_1.validateUploadedFile, upload_1.cleanupUploadedFile, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new errorHandler_2.CustomError('No file uploaded', 400);
    }
    const { title, description } = req.body;
    const userId = req.user.id;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    try {
        // Extract text from file based on type
        let extractedText = '';
        const fileExt = path_1.default.extname(fileName).toLowerCase();
        if (fileExt === '.pdf') {
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const pdfData = await (0, pdf_parse_1.default)(dataBuffer);
            extractedText = pdfData.text;
        }
        else if (fileExt === '.docx') {
            const result = await mammoth_1.default.extractRawText({ path: filePath });
            extractedText = result.value;
        }
        else if (fileExt === '.txt') {
            extractedText = fs_1.default.readFileSync(filePath, 'utf8');
        }
        else {
            extractedText = fs_1.default.readFileSync(filePath, 'utf8');
        }
        if (!extractedText.trim()) {
            throw new errorHandler_2.CustomError('Could not extract text from file', 400);
        }
        // Use LLaMA model to extract skills
        const skills = await extractSkillsWithAI(extractedText);
        // Upload file to Supabase Storage
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const storageFileName = `resumes/${userId}/${Date.now()}-${fileName}`;
        const { data: uploadData, error: uploadError } = await supabase_1.supabase.storage
            .from(supabase_1.STORAGE_BUCKETS.RESUMES)
            .upload(storageFileName, fileBuffer, {
            contentType: req.file.mimetype,
            upsert: false,
        });
        if (uploadError) {
            throw new errorHandler_2.CustomError('File upload to storage failed', 500);
        }
        // Get public URL
        const { data: urlData } = supabase_1.supabase.storage
            .from(supabase_1.STORAGE_BUCKETS.RESUMES)
            .getPublicUrl(storageFileName);
        // Save resume data to database
        const { data: resumeData, error: dbError } = await supabase_1.supabase
            .from('resumes')
            .insert({
            user_id: userId,
            file_name: fileName,
            file_url: urlData.publicUrl,
            storage_path: storageFileName,
            title: title || fileName,
            description: description || '',
            extracted_text: extractedText,
            extracted_skills: skills,
            uploaded_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (dbError) {
            throw new errorHandler_2.CustomError('Failed to save resume data', 500);
        }
        // Clean up local file
        fs_1.default.unlinkSync(filePath);
        res.status(201).json({
            success: true,
            message: 'Resume uploaded and parsed successfully',
            data: {
                resume: resumeData,
                extractedSkills: skills,
            },
        });
    }
    catch (error) {
        // Clean up local file on error
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
        throw error;
    }
}));
// Get user's resumes
router.get('/', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { data: resumes, error } = await supabase_1.supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
    if (error) {
        throw new errorHandler_2.CustomError('Failed to fetch resumes', 500);
    }
    res.json({
        success: true,
        data: { resumes },
    });
}));
// Get specific resume
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { data: resume, error } = await supabase_1.supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
    if (error) {
        throw new errorHandler_2.CustomError('Resume not found', 404);
    }
    res.json({
        success: true,
        data: { resume },
    });
}));
// Update resume metadata
router.put('/:id', validateResumeData, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        throw new errorHandler_2.CustomError('Validation failed', 400);
    }
    const { data: resume, error } = await supabase_1.supabase
        .from('resumes')
        .update({
        title,
        description,
        updated_at: new Date().toISOString(),
    })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
    if (error) {
        throw new errorHandler_2.CustomError('Failed to update resume', 500);
    }
    res.json({
        success: true,
        message: 'Resume updated successfully',
        data: { resume },
    });
}));
// Delete resume
router.delete('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    // Get resume to delete storage file
    const { data: resume, error: fetchError } = await supabase_1.supabase
        .from('resumes')
        .select('storage_path')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
    if (fetchError) {
        throw new errorHandler_2.CustomError('Resume not found', 404);
    }
    // Delete from storage
    if (resume.storage_path) {
        const { error: storageError } = await supabase_1.supabase.storage
            .from(supabase_1.STORAGE_BUCKETS.RESUMES)
            .remove([resume.storage_path]);
        if (storageError) {
            console.error('Storage deletion error:', storageError);
            // Continue with database deletion even if storage deletion fails
        }
    }
    // Delete from database
    const { error: dbError } = await supabase_1.supabase
        .from('resumes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
    if (dbError) {
        throw new errorHandler_2.CustomError('Failed to delete resume', 500);
    }
    res.json({
        success: true,
        message: 'Resume deleted successfully',
    });
}));
// Re-analyze resume skills
router.post('/:id/reanalyze', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    // Get resume text
    const { data: resume, error: fetchError } = await supabase_1.supabase
        .from('resumes')
        .select('extracted_text')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
    if (fetchError) {
        throw new errorHandler_2.CustomError('Resume not found', 404);
    }
    // Re-extract skills with AI
    const skills = await extractSkillsWithAI(resume.extracted_text);
    // Update resume with new skills
    const { data: updatedResume, error: updateError } = await supabase_1.supabase
        .from('resumes')
        .update({
        extracted_skills: skills,
        updated_at: new Date().toISOString(),
    })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
    if (updateError) {
        throw new errorHandler_2.CustomError('Failed to update skills', 500);
    }
    res.json({
        success: true,
        message: 'Skills re-analyzed successfully',
        data: {
            resume: updatedResume,
            extractedSkills: skills,
        },
    });
}));
// Helper function to extract skills using LLaMA model
async function extractSkillsWithAI(text) {
    try {
        const prompt = openrouter_1.PROMPT_TEMPLATES.SKILL_EXTRACTION.replace('{resumeText}', text);
        const completion = await openrouter_1.openai.chat.completions.create({
            model: openrouter_1.LLAMA_MODELS.SKILL_EXTRACTION,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert at analyzing resumes and extracting technical skills. Return only valid JSON.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            ...openrouter_1.MODEL_PARAMS,
        });
        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from AI model');
        }
        // Parse JSON response
        const skills = JSON.parse(response);
        // Validate and transform skills
        if (!Array.isArray(skills)) {
            throw new Error('Invalid skills format');
        }
        return skills.map((skill) => ({
            id: `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: skill.name || '',
            category: skill.category || 'Other',
            level: skill.level || 'beginner',
            confidence: skill.confidence || 0.8,
        }));
    }
    catch (error) {
        console.error('AI skill extraction error:', error);
        // Return empty array if AI fails, don't break the upload
        return [];
    }
}
exports.default = router;
//# sourceMappingURL=resume.js.map