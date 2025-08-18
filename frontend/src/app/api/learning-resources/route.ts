import { NextResponse } from 'next/server';

// Mock data for learning resources
const mockResources = [
  {
    id: '1',
    title: 'Complete React Developer Course',
    description: 'Learn React from scratch with hands-on projects',
    type: 'course',
    url: 'https://example.com/react-course',
    difficulty: 'beginner',
    estimatedHours: 40,
    cost: 'paid',
    category: 'Frameworks & Libraries',
    rating: 4.8,
  },
  {
    id: '2',
    title: 'Node.js Best Practices',
    description: 'Advanced Node.js patterns and best practices',
    type: 'article',
    url: 'https://example.com/nodejs-best-practices',
    difficulty: 'advanced',
    estimatedHours: 2,
    cost: 'free',
    category: 'Frameworks & Libraries',
    rating: 4.5,
  },
  {
    id: '3',
    title: 'AWS Cloud Practitioner',
    description: 'Get certified in AWS fundamentals',
    type: 'course',
    url: 'https://example.com/aws-course',
    difficulty: 'intermediate',
    estimatedHours: 20,
    cost: 'freemium',
    category: 'Cloud Platforms',
    rating: 4.7,
  },
  {
    id: '4',
    title: 'Clean Code by Robert Martin',
    description: 'Learn to write clean, maintainable code',
    type: 'book',
    url: 'https://example.com/clean-code-book',
    difficulty: 'intermediate',
    estimatedHours: 15,
    cost: 'paid',
    category: 'Soft Skills',
    rating: 4.9,
  },
  {
    id: '5',
    title: 'Build a Full-Stack App',
    description: 'Hands-on project building a complete application',
    type: 'project',
    url: 'https://example.com/fullstack-project',
    difficulty: 'intermediate',
    estimatedHours: 25,
    cost: 'free',
    category: 'Web Technologies',
    rating: 4.6,
  },
  {
    id: '6',
    title: 'Docker for Beginners',
    description: 'Containerization fundamentals with Docker',
    type: 'video',
    url: 'https://example.com/docker-video',
    difficulty: 'beginner',
    estimatedHours: 8,
    cost: 'free',
    category: 'DevOps & Tools',
    rating: 4.4,
  },
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({
      success: true,
      data: mockResources,
      message: 'Learning resources retrieved successfully',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch learning resources',
      },
      { status: 500 }
    );
  }
} 