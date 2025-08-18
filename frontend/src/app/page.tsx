import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Brain, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Upload, 
  Search,
  Zap,
  Users
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-primary-600" />,
      title: 'Resume Upload & Analysis',
      description: 'Upload your resume and let our AI extract your skills automatically using LLaMA models.',
    },
    {
      icon: <Search className="h-8 w-8 text-primary-600" />,
      title: 'Job Description Parsing',
      description: 'Analyze job descriptions to identify required skills and qualifications.',
    },
    {
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      title: 'AI-Powered Gap Analysis',
      description: 'Get intelligent insights into your skill gaps with LLaMA-powered analysis.',
    },
    {
      icon: <Target className="h-8 w-8 text-primary-600" />,
      title: 'Personalized Learning Paths',
      description: 'Receive customized learning recommendations based on your specific gaps.',
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary-600" />,
      title: 'Curated Learning Resources',
      description: 'Access hand-picked courses, books, and projects to close your skill gaps.',
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary-600" />,
      title: 'Progress Tracking',
      description: 'Monitor your learning progress and skill development over time.',
    },
  ];

  const stats = [
    { label: 'Skills Analyzed', value: '1000+', icon: <Brain className="h-4 w-4" /> },
    { label: 'Learning Paths', value: '500+', icon: <Target className="h-4 w-4" /> },
    { label: 'Users Helped', value: '200+', icon: <Users className="h-4 w-4" /> },
    { label: 'AI Models', value: 'LLaMA', icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600">Skill Gap Analyzer</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-24 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Bridge Your{' '}
                <span className="gradient-text">Skill Gap</span>
                <br />
                with AI-Powered Insights
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                Upload your resume, analyze job descriptions, and get personalized learning paths 
                powered by LLaMA models. Close your skill gaps and land your dream job.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/auth/signup">
                  <Button size="lg" className="btn-primary">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="btn-outline">
                    Watch Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]">
            <svg className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
              <defs>
                <pattern id="hero-pattern" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse">
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <svg x="50%" y="-1" className="overflow-visible fill-gray-50">
                <path d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z" strokeWidth="0" />
              </svg>
              <rect width="100%" height="100%" strokeWidth="0" fill="url(#hero-pattern)" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our AI-powered platform provides comprehensive skill analysis and personalized learning recommendations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="h-full hover:shadow-medium transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary-600">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your career?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of professionals who are already using AI to close their skill gaps.
          </p>
          <div className="mt-8">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Start Your Free Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Skill Gap Analyzer</h3>
            <p className="text-gray-400 mb-6">
              Powered by LLaMA models and built with modern web technologies
            </p>
            <div className="text-sm text-gray-500">
              © 2024 Skill Gap Analyzer. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
