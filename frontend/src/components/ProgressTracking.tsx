'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Award, Calendar, BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface ProgressTrackingProps {
  onClose?: () => void;
}

export function ProgressTracking({ onClose }: ProgressTrackingProps) {
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      // Fetch user's learning progress
      const result = await api.get('/api/learning-path/progress');
      if (result.success) {
        setProgressData(result.data);
      }
    } catch (error) {
      logError(error, 'Fetch Progress Data');
      console.error('Failed to fetch progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'default';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading progress data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Progress Tracking</h2>
            <p className="text-gray-600">Monitor your skill development journey</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Overall Progress Summary */}
      <Card className="bg-gradient-to-r from-primary-50 to-secondary-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {progressData?.totalSkills || 0}
              </div>
              <div className="text-sm text-gray-600">Total Skills</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-600">
                {progressData?.completedSkills || 0}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-600">
                {progressData?.inProgressSkills || 0}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-600">
                {progressData?.overallProgress || 0}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress by Category */}
      {progressData?.categoryProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Progress by Skill Category</CardTitle>
            <CardDescription>
              Track your progress across different skill areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(progressData.categoryProgress).map(([category, data]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{category}</span>
                    <Badge variant={getProgressColor(data.percentage) as any}>
                      {data.percentage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        data.percentage >= 80
                          ? 'bg-success-500'
                          : data.percentage >= 60
                          ? 'bg-warning-500'
                          : data.percentage >= 40
                          ? 'bg-primary-500'
                          : 'bg-error-500'
                      }`}
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{data.completed} of {data.total} skills completed</span>
                    <span>{data.inProgress} in progress</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Achievements */}
      {progressData?.recentAchievements && progressData.recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
            <CardDescription>
              Celebrate your latest skill milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.recentAchievements.map((achievement: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg border border-success-200">
                  <CheckCircle className="h-5 w-5 text-success-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{achievement.skillName}</h4>
                    <p className="text-sm text-gray-600">
                      Leveled up from {achievement.fromLevel} to {achievement.toLevel}
                    </p>
                  </div>
                  <Badge variant="success">{achievement.date}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Streak */}
      {progressData?.learningStreak && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Streak</CardTitle>
            <CardDescription>
              Maintain consistency in your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {progressData.learningStreak.currentStreak}
              </div>
              <p className="text-gray-600 mb-4">days of consistent learning</p>
              
              {progressData.learningStreak.bestStreak > progressData.learningStreak.currentStreak && (
                <div className="text-sm text-gray-500">
                  Best streak: {progressData.learningStreak.bestStreak} days
                </div>
              )}
              
              <div className="mt-4 p-3 bg-warning-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 text-warning-700">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Target: {progressData.learningStreak.target} days
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Time Spent Learning */}
      {progressData?.timeSpent && (
        <Card>
          <CardHeader>
            <CardTitle>Time Spent Learning</CardTitle>
            <CardDescription>
              Track your learning hours and consistency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">
                  {progressData.timeSpent.thisWeek}
                </div>
                <div className="text-sm text-gray-600">Hours this week</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary-600">
                  {progressData.timeSpent.thisMonth}
                </div>
                <div className="text-sm text-gray-600">Hours this month</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-success-600">
                  {progressData.timeSpent.total}
                </div>
                <div className="text-sm text-gray-600">Total hours</div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-secondary-50 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-secondary-700">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Average: {progressData.timeSpent.averagePerWeek} hours per week
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Goals */}
      {progressData?.nextGoals && progressData.nextGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Next Learning Goals</CardTitle>
            <CardDescription>
              Skills to focus on next
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progressData.nextGoals.map((goal: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="h-4 w-4 text-primary-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{goal.skillName}</h4>
                      <p className="text-sm text-gray-600">
                        Current: {goal.currentLevel} → Target: {goal.targetLevel}
                      </p>
                    </div>
                  </div>
                  <Badge variant={goal.priority === 'high' ? 'destructive' : goal.priority === 'medium' ? 'warning' : 'success'}>
                    {goal.priority} priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-3">
        <Button onClick={fetchProgressData} variant="outline">
          Refresh Progress
        </Button>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Detailed Report
        </Button>
      </div>
    </div>
  );
} 