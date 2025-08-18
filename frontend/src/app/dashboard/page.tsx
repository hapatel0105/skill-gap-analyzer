'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { ResumeUpload } from '@/components/ResumeUpload';
import { JobDescriptionForm } from '@/components/JobDescriptionForm';
import { SkillGapAnalysis } from '@/components/SkillGapAnalysis';
import { LearningPath } from '@/components/LearningPath';
import { ProgressTracking } from '@/components/ProgressTracking';
import { LearningResources } from '@/components/LearningResources';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    resumes: 0,
    jobDescriptions: 0,
    skillsAnalyzed: 0,
    learningPaths: 0,
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  
  // Modal states
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [showSkillAnalysis, setShowSkillAnalysis] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [showProgressTracking, setShowProgressTracking] = useState(false);
  const [showLearningResources, setShowLearningResources] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await api.get('/api/auth/me');
      if (userData.success) {
        setUser(userData.data.user);
      } else {
        // Not authenticated, redirect to signin
        router.push('/auth/signin');
        return;
      }
    } catch (error) {
      logError(error, 'Auth Check');
      console.error('Auth check failed:', error);
      router.push('/auth/signin');
      return;
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch resumes count
      const resumesData = await api.get('/api/resume');
      if (resumesData.success) {
        setStats(prev => ({ ...prev, resumes: resumesData.data?.length || 0 }));
      }

      // Fetch job descriptions count
      const jobsData = await api.get('/api/job-description');
      if (jobsData.success) {
        setStats(prev => ({ ...prev, jobDescriptions: jobsData.data?.jobDescriptions?.length || 0 }));
      }

      // Fetch skill gaps count
      const gapsData = await api.get('/api/skill-analysis');
      if (gapsData.success) {
        setStats(prev => ({ ...prev, skillsAnalyzed: gapsData.data?.length || 0 }));
      }

      // Fetch learning paths count
      const pathsData = await api.get('/api/learning-path');
      if (pathsData.success) {
        setStats(prev => ({ ...prev, learningPaths: pathsData.data?.length || 0 }));
      }
    } catch (error) {
      logError(error, 'Fetch Stats');
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.post('/api/auth/signout', {});
      router.push('/auth/signin');
    } catch (error) {
      logError(error, 'Sign Out');
      console.error('Sign out failed:', error);
      // Still redirect even if signout fails
      router.push('/auth/signin');
    }
  };

  const handleResumeUploadSuccess = (resume: any) => {
    setShowResumeUpload(false);
    fetchStats();
    toast.success('Resume uploaded successfully!');
  };

  const handleJobDescriptionSuccess = (jobDescription: any) => {
    setShowJobDescription(false);
    fetchStats();
    toast.success('Job description added successfully!');
  };

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis);
    setShowSkillAnalysis(false);
    fetchStats();
    toast.success('Skill analysis completed!');
  };

  const handleLearningPathSuccess = () => {
    setShowLearningPath(false);
    fetchStats();
    toast.success('Learning path generated successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'User'}!</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Resume Upload Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowResumeUpload(true)}>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>
                Upload your resume to analyze your current skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Upload Resume
              </Button>
            </CardContent>
          </Card>

          {/* Job Description Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowJobDescription(true)}>
            <CardHeader>
              <CardTitle>Add Job Description</CardTitle>
              <CardDescription>
                Add a job description to compare with your skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Add Job Description
              </Button>
            </CardContent>
          </Card>

          {/* Skill Analysis Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowSkillAnalysis(true)}>
            <CardHeader>
              <CardTitle>Skill Analysis</CardTitle>
              <CardDescription>
                Analyze the gap between your skills and job requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Analyze Skills
              </Button>
            </CardContent>
          </Card>

          {/* Learning Path Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowLearningPath(true)}>
            <CardHeader>
              <CardTitle>Learning Path</CardTitle>
              <CardDescription>
                Get personalized learning recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Generate Learning Path
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracking Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowProgressTracking(true)}>
            <CardHeader>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your skill development progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* Resources Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowLearningResources(true)}>
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Access curated learning materials and courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                Browse Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Overview</CardTitle>
              <CardDescription>
                Your current skill development status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">{stats.resumes}</div>
                  <div className="text-sm text-gray-600">Resumes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary-600">{stats.jobDescriptions}</div>
                  <div className="text-sm text-gray-600">Job Descriptions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-600">{stats.skillsAnalyzed}</div>
                  <div className="text-sm text-gray-600">Skills Analyzed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning-600">{stats.learningPaths}</div>
                  <div className="text-sm text-gray-600">Learning Paths</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showResumeUpload}
        onClose={() => setShowResumeUpload(false)}
        size="lg"
      >
        <ResumeUpload
          onUploadSuccess={handleResumeUploadSuccess}
          onClose={() => setShowResumeUpload(false)}
        />
      </Modal>

      <Modal
        isOpen={showJobDescription}
        onClose={() => setShowJobDescription(false)}
        size="xl"
      >
        <JobDescriptionForm
          onSuccess={handleJobDescriptionSuccess}
          onClose={() => setShowJobDescription(false)}
        />
      </Modal>

      <Modal
        isOpen={showSkillAnalysis}
        onClose={() => setShowSkillAnalysis(false)}
        size="full"
      >
        <SkillGapAnalysis
          onAnalysisComplete={handleAnalysisComplete}
          onClose={() => setShowSkillAnalysis(false)}
        />
      </Modal>

      <Modal
        isOpen={showLearningPath}
        onClose={() => setShowLearningPath(false)}
        size="full"
      >
        <LearningPath
          skillGaps={currentAnalysis?.skillGaps}
          onClose={() => setShowLearningPath(false)}
        />
      </Modal>

      <Modal
        isOpen={showProgressTracking}
        onClose={() => setShowProgressTracking(false)}
        size="full"
      >
        <ProgressTracking
          onClose={() => setShowProgressTracking(false)}
        />
      </Modal>

      <Modal
        isOpen={showLearningResources}
        onClose={() => setShowLearningResources(false)}
        size="full"
      >
        <LearningResources
          onClose={() => setShowLearningResources(false)}
        />
      </Modal>
    </div>
  );
}
