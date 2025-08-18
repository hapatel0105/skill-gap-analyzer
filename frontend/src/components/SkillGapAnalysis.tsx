'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, BookOpen, CheckCircle, XCircle, AlertCircle, Zap, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface SkillGapAnalysisProps {
  onAnalysisComplete?: (analysis: any) => void;
  onClose?: () => void;
}

interface LearningPath {
  id: string;
  user_id: string;
  skill_gaps: any[];
  resources: any[];
  estimated_timeline: number;
  priority_order: string[];
  created_at: string;
}

interface LearningPathResponse {
  learningPath: LearningPath;
  aiRecommendations: {
    resources: any[];
    estimatedTimeline: number;
    priorityOrder: string[];
    learningStrategy: string;
  };
}

// Convert analysis result to learning path request format
function convertAnalysisToLearningPathRequest(analysisResult: any, preferences: any = {}) {
  const skillGaps = analysisResult.skillGaps?.map((gap: any) => ({
    skill: {
      id: gap.skill?.id || `skill_${gap.skill?.name?.toLowerCase().replace(/\s+/g, '_')}`,
      name: gap.skill?.name || '',
      category: gap.skill?.category || 'technical',
    },
    currentLevel: gap.currentLevel || 'beginner',
    requiredLevel: gap.requiredLevel || 'intermediate',
    gap: gap.gap || 'medium',
    priority: gap.priority || 'medium',
  })) || [];

  return {
    skillGaps,
    preferences,
  };
}

// API function to generate learning path
async function generateLearningPath(data: any): Promise<LearningPathResponse> {
  try {
    const result = await api.post('/api/learning-path/generate', data);
    
    if (result.success) {
      toast.success('Learning path generated successfully!');
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to generate learning path');
    }
  } catch (error) {
    logError(error, 'Generate Learning Path');
    const errorMessage = getErrorMessage(error);
    toast.error(errorMessage);
    throw error;
  }
}

export function SkillGapAnalysis({ onAnalysisComplete, onClose }: SkillGapAnalysisProps) {
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobDescriptions, setJobDescriptions] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [generatingLearningPath, setGeneratingLearningPath] = useState(false);
  const [learningPathResult, setLearningPathResult] = useState<LearningPathResponse | null>(null);

  useEffect(() => {
    fetchResumes();
    fetchJobDescriptions();
  }, []);

  const fetchResumes = async () => {
    try {
      const result = await api.get('/api/resume');
      if (result.success) {
        setResumes(result.data || []);
      }
    } catch (error) {
      logError(error, 'Fetch Resumes');
      console.error('Failed to fetch resumes:', error);
    }
  };

  const fetchJobDescriptions = async () => {
    try {
      const result = await api.get('/api/job-description');
      if (result.success) {
        setJobDescriptions(result.data?.jobDescriptions || []);
      }
    } catch (error) {
      logError(error, 'Fetch Job Descriptions');
      console.error('Failed to fetch job descriptions:', error);
    }
  };

  const handleAnalysis = async () => {
    if (!selectedResume || !selectedJob) {
      toast.error('Please select both a resume and job description');
      return;
    }

    setAnalyzing(true);
    
    try {
      const result = await api.post('/api/skill-analysis/analyze', {
        resumeId: selectedResume,
        jobDescriptionId: selectedJob,
      });
      
      if (result.success) {
        setAnalysisResult(result.data.analysis);
        toast.success('Skill gap analysis completed successfully!');
        
        // if (onAnalysisComplete) {
        //   onAnalysisComplete(result.data);
        // }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      logError(error, 'Skill Analysis');
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!analysisResult) return;

    setGeneratingLearningPath(true);
    
    try {
      const learningPathRequest = convertAnalysisToLearningPathRequest(
        analysisResult,
        {
          timeCommitment: 10, // hours per week
          learningStyle: 'mixed',
          budgetPreference: 'free',
          difficultyPreference: 'gradual'
        }
      );
      
      const result = await generateLearningPath(learningPathRequest);
      setLearningPathResult(result);
      
    } catch (error) {
      console.error('Failed to generate learning path:', error);
    } finally {
      setGeneratingLearningPath(false);
    }
  };

  const getGapColor = (gap: string) => {
    switch (gap) {
      case 'none':
        return 'success';
      case 'small':
        return 'warning';
      case 'medium':
        return 'default';
      case 'large':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getOverallGapColor = (gap: string) => {
    switch (gap) {
      case 'small':
        return 'success';
      case 'medium':
        return 'warning';
      case 'large':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const resetToAnalysis = () => {
    setLearningPathResult(null);
  };

  const resetAll = () => {
    setAnalysisResult(null);
    setLearningPathResult(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <div>
              <CardTitle>
                {learningPathResult ? 'Your Learning Path' : 'Skill Gap Analysis'}
              </CardTitle>
              <CardDescription>
                {learningPathResult 
                  ? 'Personalized learning resources based on your skill gaps'
                  : 'Compare your skills with job requirements to identify gaps'
                }
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection Form */}
        {!analysisResult && !learningPathResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Resume
                </label>
                <Select
                  value={selectedResume}
                  onChange={(e) => setSelectedResume(e.target.value)}
                >
                  <option value="">Choose a resume...</option>
                  {resumes?.map((resume) => (
                    <option key={resume.id} value={resume.id}>
                      {resume.title} ({resume.extracted_skills?.length || 0} skills)
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Job Description
                </label>
                <Select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                >
                  <option value="">Choose a job description...</option>
                  {jobDescriptions.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} at {job.company}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleAnalysis} 
                disabled={!selectedResume || !selectedJob || analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Skills'}
              </Button>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && !learningPathResult && (
          <div className="space-y-6">
            {/* Overall Summary */}
            <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResult.skillGaps?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Gaps</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary-600">
                      {analysisResult.overallGap}
                    </div>
                    <div className="text-sm text-gray-600">Overall Gap</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-600">
                      {analysisResult.estimatedTimeToClose || 0}
                    </div>
                    <div className="text-sm text-gray-600">Weeks to Close</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-600">
                      {analysisResult.recommendedFocus?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Focus Areas</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Gap Assessment */}
            <div className="text-center">
              <Badge 
                variant={getOverallGapColor(analysisResult.overallGap) as any}
                className="text-lg px-4 py-2"
              >
                Overall Gap: {analysisResult.overallGap}
              </Badge>
            </div>

            {/* Skill Gaps Details */}
            {analysisResult.skillGaps && analysisResult.skillGaps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Skill Gap Details</h3>
                <div className="space-y-3">
                  {analysisResult.skillGaps.map((gap: any, index: number) => (
                    <Card key={index} className="border-l-4 border-l-primary-500">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">{gap.skill.name}</h4>
                              <Badge variant="outline">{gap.skill.category}</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Current Level:</span>
                                <Badge variant="secondary" className="ml-2">
                                  {gap.currentLevel}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-600">Required Level:</span>
                                <Badge variant="destructive" className="ml-2">
                                  {gap.requiredLevel}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-600">Gap Size:</span>
                                <Badge variant={getGapColor(gap.gap) as any} className="ml-2">
                                  {gap.gap}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-gray-600">Priority:</span>
                                <Badge variant={getPriorityColor(gap.priority) as any} className="ml-2">
                                  {gap.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Focus Areas */}
            {analysisResult.recommendedFocus && analysisResult.recommendedFocus.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Recommended Focus Areas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysisResult.recommendedFocus.map((focus: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-secondary-50 rounded-lg">
                      <Target className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-900">{focus}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Estimate */}
            {analysisResult.estimatedTimeToClose && (
              <div className="text-center p-4 bg-warning-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="h-5 w-5 text-warning-600" />
                  <span className="font-medium text-gray-900">Estimated Timeline</span>
                </div>
                <p className="text-lg font-bold text-warning-700">
                  {analysisResult.estimatedTimeToClose} weeks to close skill gaps
                </p>
                <p className="text-sm text-gray-600">
                  This estimate assumes focused learning and practice
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button onClick={resetAll} variant="outline">
                New Analysis
              </Button>
              <Button 
                onClick={handleGenerateLearningPath}
                disabled={generatingLearningPath}
                className="bg-success-600 hover:bg-success-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                {generatingLearningPath ? 'Generating...' : 'Generate Learning Path'}
              </Button>
            </div>
          </div>
        )}

        {/* Generated Learning Path */}
        {learningPathResult && (
          <div className="space-y-6">
            {/* Learning Path Summary */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {learningPathResult.learningPath.resources?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Learning Resources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {learningPathResult.learningPath.estimated_timeline}
                    </div>
                    <div className="text-sm text-gray-600">Weeks Timeline</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">
                      {learningPathResult.learningPath.resources?.reduce((sum: number, r: any) => sum + (r.estimatedHours || 0), 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Hours</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {learningPathResult.learningPath.priority_order?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Priority Skills</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Strategy */}
            {learningPathResult.aiRecommendations.learningStrategy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Recommended Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {learningPathResult.aiRecommendations.learningStrategy}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Learning Resources */}
            {learningPathResult.learningPath.resources && learningPathResult.learningPath.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                    Learning Resources
                  </CardTitle>
                  <CardDescription>
                    Resources are ordered by priority based on your skill gaps
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {learningPathResult.learningPath.resources.map((resource: any, index: number) => (
                      <div key={resource.id} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{resource.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{resource.type}</Badge>
                              <Badge variant={resource.cost === 'free' ? 'success' : 'warning'}>
                                {resource.cost}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <span>Difficulty: {resource.difficulty}</span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {resource.estimatedHours}h
                              </span>
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Start Learning
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Priority Order */}
            {learningPathResult.learningPath.priority_order && learningPathResult.learningPath.priority_order.length > 0 && analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-red-600" />
                    Recommended Learning Order
                  </CardTitle>
                  <CardDescription>
                    Focus on these skills in the following priority order
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {learningPathResult.learningPath.priority_order.map((skillId: string, index: number) => {
                      const skill = analysisResult.skillGaps.find((gap: any) => gap.skill.id === skillId);
                      return skill ? (
                        <div key={skillId} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-xs font-bold text-gray-500 mr-2">{index + 1}</span>
                          <span className="text-sm font-medium text-gray-900">{skill.skill.name}</span>
                          <Badge variant={getPriorityColor(skill.priority) as any} className="ml-2 text-xs">
                            {skill.priority}
                          </Badge>
                        </div>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button onClick={resetToAnalysis} variant="outline">
                Back to Analysis
              </Button>
              <Button onClick={resetAll} variant="outline">
                New Analysis
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Learning Path
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}