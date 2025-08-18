'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Video, FileText, Play, Zap, Star, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { logError, getErrorMessage } from '@/lib/errorHandler';

interface LearningResourcesProps {
  onClose?: () => void;
}

export function LearningResources({ onClose }: LearningResourcesProps) {
  const [resources, setResources] = useState<any[]>([]);
  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    difficulty: '',
    cost: '',
    category: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, filters]);

  const fetchResources = async () => {
    try {
      const result = await api.get('/api/learning-resources');
      if (result.success) {
        setResources(result.data?.learningResources || []);
      }
    } catch (error) {
      logError(error, 'Fetch Learning Resources');
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(resource => resource.type === filters.type);
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(resource => resource.difficulty === filters.difficulty);
    }

    // Cost filter
    if (filters.cost) {
      filtered = filtered.filter(resource => resource.cost === filters.cost);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(resource => resource.category === filters.category);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <Play className="h-5 w-5 text-primary-600" />;
      // case 'book':
      //   return <Book className="h-5 w-5 text-success-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-warning-600" />;
      case 'article':
        return <FileText className="h-5 w-5 text-secondary-600" />;
      case 'project':
        return <Zap className="h-5 w-5 text-error-600" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-600" />;
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

  const getCostIcon = (cost: string) => {
    switch (cost) {
      case 'free':
        return <span className="text-success-600">Free</span>;
      case 'paid':
        return <span className="text-error-600">Paid</span>;
      case 'freemium':
        return <span className="text-warning-600">Freemium</span>;
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      type: '',
      difficulty: '',
      cost: '',
      category: '',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading learning resources...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Learning Resources</h2>
            <p className="text-gray-600">Browse curated learning materials and courses</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Type</label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="course">Course</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Difficulty</label>
                <Select
                  value={filters.difficulty}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cost</label>
                <Select
                  value={filters.cost}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, cost: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Costs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Costs</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Programming Languages">Programming Languages</SelectItem>
                    <SelectItem value="Frameworks & Libraries">Frameworks & Libraries</SelectItem>
                    <SelectItem value="Databases">Databases</SelectItem>
                    <SelectItem value="Cloud Platforms">Cloud Platforms</SelectItem>
                    <SelectItem value="DevOps & Tools">DevOps & Tools</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div> */}

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {filteredResources.length} of {resources.length} resources
                </span>
              </div>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className="flex items-start space-x-3">
                  {getResourceIcon(resource.type)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {resource.description || 'No description available'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Metadata */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge variant={getDifficultyColor(resource.difficulty) as any}>
                      {resource.difficulty}
                    </Badge>
                    <Badge variant={getCostColor(resource.cost) as any}>
                      {resource.cost}
                    </Badge>
                  </div>
                  {resource.rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-warning-500 fill-current" />
                      <span className="text-gray-600">{resource.rating}</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{resource.estimatedHours}h</span>
                  </div>
                  {resource.category && (
                    <Badge variant="outline" className="text-xs">
                      {resource.category}
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                {/* <div className="flex space-x-2">
                  <Button
                    onClick={() => window.open(resource.url, '_blank')}
                    className="flex-1"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Resource
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Add to favorites or learning path
                      toast.success('Added to learning path!');
                    }}
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div> */}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters to find more resources.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Resource Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Overview</CardTitle>
          <CardDescription>
            Summary of available learning materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">
                {resources.filter(r => r.type === 'course').length}
              </div>
              <div className="text-sm text-gray-600">Courses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success-600">
                {resources.filter(r => r.type === 'book').length}
              </div>
              <div className="text-sm text-gray-600">Books</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning-600">
                {resources.filter(r => r.type === 'video').length}
              </div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-secondary-600">
                {resources.filter(r => r.cost === 'free').length}
              </div>
              <div className="text-sm text-gray-600">Free Resources</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 