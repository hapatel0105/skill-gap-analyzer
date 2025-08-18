import { NextResponse } from 'next/server';

// Mock progress data
const mockProgressData = {
  totalSkills: 12,
  completedSkills: 4,
  inProgressSkills: 5,
  overallProgress: 33,
  categoryProgress: {
    'Programming Languages': {
      completed: 2,
      total: 4,
      inProgress: 1,
      percentage: 50,
    },
    'Frameworks & Libraries': {
      completed: 1,
      total: 3,
      inProgress: 2,
      percentage: 33,
    },
    'Databases': {
      completed: 1,
      total: 2,
      inProgress: 1,
      percentage: 50,
    },
    'Cloud Platforms': {
      completed: 0,
      total: 3,
      inProgress: 1,
      percentage: 0,
    },
  },
  recentAchievements: [
    {
      skillName: 'JavaScript',
      fromLevel: 'beginner',
      toLevel: 'intermediate',
      date: '2024-01-15',
    },
    {
      skillName: 'React',
      fromLevel: 'beginner',
      toLevel: 'intermediate',
      date: '2024-01-10',
    },
  ],
  learningStreak: {
    currentStreak: 7,
    bestStreak: 12,
    target: 30,
  },
  timeSpent: {
    thisWeek: 12,
    thisMonth: 45,
    total: 180,
    averagePerWeek: 8,
  },
  nextGoals: [
    {
      skillName: 'Node.js',
      currentLevel: 'beginner',
      targetLevel: 'intermediate',
      priority: 'high',
    },
    {
      skillName: 'AWS',
      currentLevel: 'beginner',
      targetLevel: 'intermediate',
      priority: 'medium',
    },
  ],
};

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: mockProgressData,
      message: 'Progress data retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress data',
      },
      { status: 500 }
    );
  }
} 