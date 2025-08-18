'use client';

import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { apiUpload } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface ResumeUploadProps {
  onUploadSuccess?: (resume: any) => void;
  onClose?: () => void;
}

export function ResumeUpload({ onUploadSuccess, onClose }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedSkills, setExtractedSkills] = useState<any[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      handleFileUpload(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
  
    try {
      // 1️⃣ Create FormData and append file + metadata
      const formData = new FormData();
      formData.append('resume', file, file.name);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('description', 'Resume uploaded for skill analysis');
  
      // 2️⃣ Safe FormData logging (ES5-compatible)
      console.log('🚀 FormData contents:');
      
  
      // 3️⃣ Upload using your apiUpload function
      const result = await apiUpload('/api/resume/upload', formData);
  
      // 4️⃣ Handle success
      if (result.success) {
        setExtractedSkills(result.data.extractedSkills || []);
        setAnalysisComplete(true);
        toast.success('Resume uploaded and analyzed successfully!');
  
        if (onUploadSuccess) {
          onUploadSuccess(result.data);
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      // 5️⃣ Handle error
      logError(error, 'Resume Upload');
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedSkills([]);
    setAnalysisComplete(false);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-error-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-8 w-8 text-primary-500" />;
      case 'txt':
        return <FileText className="h-8 w-8 text-secondary-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'default';
      case 'expert':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume to extract and analyze your skills
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-secondary-300 hover:border-primary-400 hover:bg-primary-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your resume, or click to browse
            </p>
            <p className="text-xs text-gray-500">
              Supports PDF, DOC, DOCX, and TXT files (max 5MB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(uploadedFile.name)}
                <div>
                  <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Analyzing resume and extracting skills...</p>
              </div>
            )}

            {/* Analysis Results */}
            {analysisComplete && extractedSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-success-500" />
                  <h4 className="font-medium text-gray-900">Skills Extracted</h4>
                  <Badge variant="success">{extractedSkills.length} skills found</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {extractedSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <Badge variant={getSkillLevelColor(skill.level) as any}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisComplete && extractedSkills.length === 0 && (
              <div className="text-center py-4">
                <Brain className="h-8 w-8 text-warning-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No skills were extracted from the resume</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 