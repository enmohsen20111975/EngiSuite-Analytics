'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Atom,
  Calculator,
  Shapes,
  Sparkles,
  Brain,
  Play,
  BookOpen,
  Users,
  Trophy,
  Target,
  TrendingUp,
  Zap,
  Layers,
  CircleDot,
  Network,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
  Globe,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LandingPageProps {
  onEnterLab: () => void;
  onBrowseCourses: () => void;
  onNavigateToCourse: (categoryId: string, courseId?: string) => void;
}

const courseCategories = [
  {
    id: 'mathematics',
    title: 'Mathematics',
    icon: Calculator,
    description: 'From algebra to advanced calculus, master the language of science',
    color: 'from-blue-500 to-cyan-500',
    courses: [
      { name: 'Linear Algebra', lessons: 45, duration: '12h', level: 'Intermediate' },
      { name: 'Probability & Statistics', lessons: 38, duration: '10h', level: 'Beginner' },
      { name: 'Differential Equations', lessons: 52, duration: '15h', level: 'Advanced' },
      { name: 'Complex Analysis', lessons: 40, duration: '11h', level: 'Advanced' },
    ]
  },
  {
    id: 'geometry',
    title: 'Geometry',
    icon: Shapes,
    description: 'Explore shapes, spaces, and transformations through visual learning',
    color: 'from-emerald-500 to-teal-500',
    courses: [
      { name: 'Euclidean Geometry', lessons: 32, duration: '8h', level: 'Beginner' },
      { name: 'Analytic Geometry', lessons: 28, duration: '7h', level: 'Intermediate' },
      { name: 'Differential Geometry', lessons: 48, duration: '14h', level: 'Advanced' },
      { name: 'Topology Fundamentals', lessons: 35, duration: '9h', level: 'Advanced' },
    ]
  },
  {
    id: 'kinetic',
    title: 'Kinetic Geometry Lab',
    icon: Target,
    description: 'Interactive 3D visualizations and physics-based motion experiments',
    color: 'from-amber-500 to-orange-500',
    courses: [
      { name: 'Parametric Curves', lessons: 24, duration: '6h', level: 'Intermediate' },
      { name: 'Surface Analysis', lessons: 30, duration: '8h', level: 'Advanced' },
      { name: 'Dynamic Systems', lessons: 36, duration: '10h', level: 'Advanced' },
      { name: 'Chaos & Fractals', lessons: 28, duration: '7h', level: 'Expert' },
    ]
  },
  {
    id: 'calculus',
    title: 'Calculus',
    icon: TrendingUp,
    description: 'Limits, derivatives, integrals and their applications',
    color: 'from-purple-500 to-pink-500',
    courses: [
      { name: 'Calculus I: Limits & Derivatives', lessons: 42, duration: '11h', level: 'Beginner' },
      { name: 'Calculus II: Integration', lessons: 48, duration: '13h', level: 'Intermediate' },
      { name: 'Multivariable Calculus', lessons: 56, duration: '15h', level: 'Advanced' },
      { name: 'Vector Calculus', lessons: 44, duration: '12h', level: 'Advanced' },
    ]
  },
];

const deepLearningCourses = [
  {
    id: 'dl-foundations',
    title: 'Deep Learning Foundations',
    icon: Brain,
    description: 'Neural networks, backpropagation, and optimization algorithms',
    lessons: 36,
    duration: '10h',
    level: 'Intermediate',
    topics: ['Neural Networks', 'Gradient Descent', 'Backpropagation', 'Regularization'],
  },
  {
    id: 'dl-cnn',
    title: 'Convolutional Neural Networks',
    icon: Layers,
    description: 'Image recognition, computer vision, and visual AI systems',
    lessons: 42,
    duration: '12h',
    level: 'Intermediate',
    topics: ['Convolution Operations', 'Pooling Layers', 'CNN Architectures', 'Transfer Learning'],
  },
  {
    id: 'dl-rnn',
    title: 'Recurrent Neural Networks',
    icon: Network,
    description: 'Sequential data, time series, and natural language processing',
    lessons: 38,
    duration: '11h',
    level: 'Advanced',
    topics: ['LSTM', 'GRU', 'Sequence Modeling', 'Attention Mechanisms'],
  },
  {
    id: 'dl-transformers',
    title: 'Transformers & Attention',
    icon: Sparkles,
    description: 'Modern NLP, GPT, BERT, and large language models',
    lessons: 48,
    duration: '14h',
    level: 'Advanced',
    topics: ['Self-Attention', 'Multi-Head Attention', 'BERT', 'GPT Architecture'],
  },
  {
    id: 'dl-gans',
    title: 'Generative Adversarial Networks',
    icon: CircleDot,
    description: 'Image generation, style transfer, and creative AI',
    lessons: 32,
    duration: '9h',
    level: 'Advanced',
    topics: ['Generator & Discriminator', 'DCGAN', 'StyleGAN', 'Image Synthesis'],
  },
  {
    id: 'dl-reinforcement',
    title: 'Reinforcement Learning',
    icon: Zap,
    description: 'Agent-based learning, game AI, and decision systems',
    lessons: 44,
    duration: '12h',
    level: 'Expert',
    topics: ['Q-Learning', 'Policy Gradients', 'DQN', 'Actor-Critic Methods'],
  },
];

const features = [
  {
    icon: Globe,
    title: 'Interactive 3D Visualizations',
    description: 'Explore mathematical concepts through stunning real-time 3D animations'
  },
  {
    icon: Brain,
    title: 'AI-Powered Learning',
    description: 'Personalized learning paths adapted to your pace and understanding'
  },
  {
    icon: Target,
    title: 'Hands-on Practice',
    description: 'Interactive exercises with immediate feedback and solutions'
  },
  {
    icon: Trophy,
    title: 'Progress Tracking',
    description: 'Monitor your advancement with detailed analytics and achievements'
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Collaborate with peers and learn from expert instructors'
  },
  {
    icon: Lock,
    title: 'Lifetime Access',
    description: 'All courses available forever with regular updates and new content'
  },
];

const stats = [
  { value: '50+', label: 'Courses' },
  { value: '500+', label: 'Interactive Lessons' },
  { value: '10K+', label: 'Active Learners' },
  { value: '98%', label: 'Satisfaction Rate' },
];

export function LandingPage({ onEnterLab, onBrowseCourses, onNavigateToCourse }: LandingPageProps) {
  const [activeCategory, setActiveCategory] = useState('mathematics');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-sm border-b border-border" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-xl">KineticGeometry</h1>
                <p className="text-xs text-muted-foreground">Learning Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button onClick={onBrowseCourses} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Courses</button>
              <a href="#deep-learning" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Deep Learning</a>
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <Button onClick={onEnterLab} className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20">
                Enter Lab
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-6 px-4 py-2 bg-amber-500/10 border-amber-500/30 text-amber-600">
              <Sparkles className="w-4 h-4 mr-2" />
              Interactive Learning Reimagined
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Master Mathematics Through
              <span className="block mt-2 bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                Visual Exploration
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              An immersive platform combining interactive 3D visualizations, 
              physics-based animations, and deep learning courses to transform 
              how you understand mathematics.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={onEnterLab}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl shadow-amber-500/20 px-8 h-12"
              >
                <Play className="w-5 h-5 mr-2" />
                Launch Interactive Lab
              </Button>
              <Button size="lg" variant="outline" onClick={onBrowseCourses} className="px-8 h-12">
                <BookOpen className="w-5 h-5 mr-2" />
                Browse Courses
              </Button>
            </div>
            
            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section id="courses" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <GraduationCap className="w-4 h-4 mr-2" />
              Course Catalog
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Comprehensive Curriculum
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From fundamental concepts to advanced topics, explore our complete 
              mathematics and geometry courses.
            </p>
          </div>
          
          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1">
              {courseCategories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
                >
                  <category.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {courseCategories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {category.courses.map((course, index) => (
                    <Card 
                      key={index} 
                      className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-amber-500/30"
                      onClick={() => onNavigateToCourse(category.id, course.name)}
                    >
                      <CardHeader className="pb-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-gradient-to-br",
                          category.color
                        )}>
                          <category.icon className="w-5 h-5 text-white" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-amber-600 transition-colors">
                          {course.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessons} lessons
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {course.duration}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          course.level === 'Beginner' && "border-emerald-500/30 text-emerald-600",
                          course.level === 'Intermediate' && "border-blue-500/30 text-blue-600",
                          course.level === 'Advanced' && "border-purple-500/30 text-purple-600",
                          course.level === 'Expert' && "border-red-500/30 text-red-600"
                        )}>
                          {course.level}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Deep Learning Section */}
      <section id="deep-learning" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1 bg-purple-500/10 border-purple-500/30 text-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              AI & Machine Learning
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Deep Learning Courses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master artificial intelligence and neural networks with our 
              comprehensive deep learning curriculum.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deepLearningCourses.map((course, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 hover:border-purple-500/30"
                onClick={() => onNavigateToCourse('deep-learning', course.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                      <course.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      course.level === 'Intermediate' && "border-blue-500/30 text-blue-600",
                      course.level === 'Advanced' && "border-purple-500/30 text-purple-600",
                      course.level === 'Expert' && "border-red-500/30 text-red-600"
                    )}>
                      {course.level}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4 group-hover:text-purple-600 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.topics.map((topic, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Kinetic Lab Highlight */}
      <section className="py-20 bg-gradient-to-b from-amber-500/5 via-orange-500/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 px-3 py-1 bg-amber-500/10 border-amber-500/30 text-amber-600">
                <Target className="w-4 h-4 mr-2" />
                Interactive Experience
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Kinetic Geometry Lab
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Step into our interactive laboratory where mathematical concepts 
                come alive through stunning 3D visualizations and physics-based 
                animations.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  '5 comprehensive learning modules',
                  '20+ interactive visualizations',
                  'Real-time parameter manipulation',
                  'Physics-based animations',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg"
                onClick={onEnterLab}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl shadow-amber-500/20"
              >
                <Play className="w-5 h-5 mr-2" />
                Enter the Lab
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 p-8 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  {[
                    { icon: Atom, label: 'Parametric Curves', color: 'from-blue-500 to-cyan-500' },
                    { icon: Layers, label: 'Surface Analysis', color: 'from-emerald-500 to-teal-500' },
                    { icon: Network, label: 'Dynamic Systems', color: 'from-purple-500 to-pink-500' },
                    { icon: Sparkles, label: 'Chaos & Fractals', color: 'from-amber-500 to-orange-500' },
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="aspect-square rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform cursor-pointer"
                      onClick={onEnterLab}
                    >
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br", item.color)}>
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-500/20 rounded-full blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              <Star className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology to provide the best 
              learning experience possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 flex items-center justify-center mb-4 group-hover:from-amber-500/20 group-hover:to-orange-500/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>
            
            <div className="relative text-center text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of students who have already discovered the 
                power of visual mathematics learning.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  onClick={onEnterLab}
                  className="bg-white text-amber-600 hover:bg-white/90 shadow-xl px-8 h-12"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Learning Now
                </Button>
                <Button size="lg" variant="outline" onClick={onBrowseCourses} className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 h-12">
                  View All Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
