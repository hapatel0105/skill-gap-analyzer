'use client';

import React, { useState } from 'react';
import { Briefcase, Building, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface JobDescriptionFormProps {
  onSuccess?: (jobDescription: any) => void;
  onClose?: () => void;
}

export function JobDescriptionForm({ onSuccess, onClose }: JobDescriptionFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<{
    required: any[];
    preferred: any[];
  }>({ required: [], preferred: [] });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setAnalyzing(true);
    
    try {
      // First, save the job description
      const saveResult = await api.post('/api/job-description', formData);
      
      if (saveResult.success) {
        // Now analyze the skills
        const analysisResult = await api.post('/api/job-description/analyze', {
          jobDescriptionId: saveResult.data?.jobDescription?.id,
          description: formData.description,
        });
        
        if (analysisResult.success) {
          setExtractedSkills({
            required: analysisResult.data.requiredSkills || [],
            preferred: analysisResult.data.preferredSkills || [],
          });
          setAnalysisComplete(true);
          toast.success('Job description saved and analyzed successfully!');
          
          if (onSuccess) {
            onSuccess({
              ...saveResult.data,
              extractedSkills: analysisResult.data,
            });
          }
        } else {
          throw new Error(analysisResult.error || 'Skill analysis failed');
        }
      } else {
        throw new Error(saveResult.error || 'Failed to save job description');
      }
    } catch (error) {
      logError(error, 'Job Description Processing');
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-primary-600" />
            <div>
              <CardTitle>Add Job Description</CardTitle>
              <CardDescription>
                Add a job description to analyze required skills
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium text-gray-700">
                Company *
              </label>
              <Input
                id="company"
                placeholder="e.g., Tech Corp Inc."
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Job Description *
            </label>
            <Textarea
              id="description"
              placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={8}
              required
            />
            <p className="text-xs text-gray-500">
              The more detailed the description, the better we can analyze required skills.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Job Description'}
            </Button>
          </div>
        </form>

        {/* Analysis Results */}
        {analysisComplete && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success-500" />
              <h4 className="font-medium text-gray-900">Skills Analysis Complete</h4>
            </div>

            {/* Required Skills */}
            {extractedSkills.required.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                  <span>Required Skills</span>
                  <Badge variant="destructive">{extractedSkills.required.length}</Badge>
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {extractedSkills.required.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-error-50 rounded border border-error-200">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <Badge variant={getSkillLevelColor(skill.level) as any}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {extractedSkills.preferred.length > 0 && (
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                  <span>Preferred Skills</span>
                  <Badge variant="secondary">{extractedSkills.preferred.length}</Badge>
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  {extractedSkills.preferred.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-secondary-50 rounded border border-secondary-200">
                      <span className="text-sm font-medium text-gray-900">{skill.name}</span>
                      <Badge variant={getSkillLevelColor(skill.level) as any}>
                        {skill.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedSkills.required.length === 0 && extractedSkills.preferred.length === 0 && (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-warning-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No skills were extracted from the job description</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 