'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, Target, TrendingUp, ExternalLink, Play, Book, Video, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface LearningPathProps {
  skillGaps?: any[];
  onClose?: () => void;
}

export function LearningPath({ skillGaps, onClose }: LearningPathProps) {
  const [generating, setGenerating] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [selectedSkillGaps, setSelectedSkillGaps] = useState<any[]>([]);

  useEffect(() => {
    if (skillGaps) {
      setSelectedSkillGaps(skillGaps);
    }
  }, [skillGaps]);

  const generateLearningPath = async () => {
    if (selectedSkillGaps.length === 0) {
      toast.error('Please select skill gaps to generate a learning path');
      return;
    }

    setGenerating(true);
    
    try {
      const result = await api.post('/api/learning-path/generate', {
        skillGaps: selectedSkillGaps,
      });
      
      if (result.success) {
        setLearningPath(result.data);
        toast.success('Learning path generated successfully!');
      } else {
        throw new Error(result.error || 'Failed to generate learning path');
      }
    } catch (error) {
      logError(error, 'Learning Path Generation');
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Play className="h-4 w-4 text-primary-600" />;
      case 'book':
        return <Book className="h-4 w-4 text-success-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-warning-600" />;
      case 'article':
        return <FileText className="h-4 w-4 text-secondary-600" />;
      case 'project':
        return <Zap className="h-4 w-4 text-error-600" />;
      default:
        return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'free':
        return 'success';
      case 'paid':
        return 'destructive';
      case 'freemium':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const toggleSkillGap = (skillGap: any) => {
    setSelectedSkillGaps(prev => {
      const exists = prev.find(sg => sg.skill.id === skillGap.skill.id);
      if (exists) {
        return prev.filter(sg => sg.skill.id !== skillGap.skill.id);
      } else {
        return [...prev, skillGap];
      }
    });
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-primary-600" />
            <div>
              <CardTitle>Learning Path Generator</CardTitle>
              <CardDescription>
                Generate personalized learning paths to close your skill gaps
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
        {!learningPath ? (
          <>
            {/* Skill Gap Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Skills to Focus On</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedSkillGaps.map((skillGap, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSkillGaps.find(sg => sg.skill.id === skillGap.skill.id)
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:bg-secondary-50'
                    }`}
                    onClick={() => toggleSkillGap(skillGap)}
                  >
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{skillGap.skill.name}</h4>
                          <Badge variant="outline">{skillGap.skill.category}</Badge>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Current:</span>
                          <Badge variant="secondary">{skillGap.currentLevel}</Badge>
                          <span className="text-gray-600">→</span>
                          <Badge variant="destructive">{skillGap.requiredLevel}</Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={skillGap.gap === 'large' ? 'destructive' : skillGap.gap === 'medium' ? 'default' : 'warning'}>
                            {skillGap.gap} gap
                          </Badge>
                          <Badge variant={skillGap.priority === 'high' ? 'destructive' : skillGap.priority === 'medium' ? 'warning' : 'success'}>
                            {skillGap.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <Button 
                onClick={generateLearningPath} 
                disabled={selectedSkillGaps.length === 0 || generating}
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Learning Path...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Generate Learning Path
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Learning Path Results */
          <div className="space-y-6">
            {/* Path Overview */}
            <Card className="bg-gradient-to-r from-success-50 to-primary-50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-success-600">
                      {learningPath.resources?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Resources</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {learningPath.estimatedTimeline || 0}
                    </div>
                    <div className="text-sm text-gray-600">Weeks to Complete</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-warning-600">
                      {learningPath.skillGaps?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Skills Covered</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary-600">
                      {learningPath.priorityOrder?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Priority Order</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Order */}
            {learningPath.priorityOrder && learningPath.priorityOrder.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Learning Priority Order</h3>
                <div className="space-y-2">
                  {learningPath.priorityOrder.map((skillId: string, index: number) => {
                    const skillGap = learningPath.skillGaps?.find((sg: any) => sg.skill.id === skillId);
                    return skillGap ? (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary-600 text-white rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{skillGap.skill.name}</h4>
                          <p className="text-sm text-gray-600">
                            {skillGap.currentLevel} → {skillGap.requiredLevel}
                          </p>
                        </div>
                        <Badge variant={skillGap.priority === 'high' ? 'destructive' : skillGap.priority === 'medium' ? 'warning' : 'success'}>
                          {skillGap.priority} priority
                        </Badge>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Learning Resources */}
            {learningPath.resources && learningPath.resources.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Recommended Learning Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningPath.resources.map((resource: any, index: number) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            {getResourceIcon(resource.type)}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{resource.title}</h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant={getDifficultyColor(resource.difficulty) as any}>
                                  {resource.difficulty}
                                </Badge>
                                <Badge variant={getCostColor(resource.cost) as any}>
                                  {resource.cost}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{resource.estimatedHours}h</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(resource.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline Visualization */}
            {learningPath.estimatedTimeline && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Learning Timeline</h3>
                <div className="p-4 bg-warning-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-warning-600" />
                    <span className="font-medium text-gray-900">Estimated Completion Time</span>
                  </div>
                  <p className="text-lg font-bold text-warning-700">
                    {learningPath.estimatedTimeline} weeks to complete the learning path
                  </p>
                  <p className="text-sm text-gray-600">
                    This timeline assumes {Math.ceil(learningPath.estimatedTimeline / 4)} hours of study per week
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setLearningPath(null)} variant="outline">
                Generate New Path
              </Button>
              <Button 
                className="bg-success-600 hover:bg-success-700"
                onClick={() => {
                  toast.success('Learning path saved! You can track your progress in the dashboard.');
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 