import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, User, Clock, Tag, Search, ArrowRight,
  BookOpen, MessageCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { blogService } from '../services/blogService';
import { Card, CardContent, Button, PageLoader, EmptyState } from '../components/ui';

/**
 * Blog post card component
 */
function BlogCard({ post, featured = false }) {
  return (
    <Card hover className={cn('group overflow-hidden', featured && 'md:flex')}>
      {/* Post image */}
      <div className={cn(
        'relative bg-gradient-to-br from-accent/20 to-violet-500/20 flex items-center justify-center',
        featured ? 'md:w-2/5 h-48 md:h-auto' : 'h-48'
      )}>
        <BookOpen className="w-16 h-16 text-accent/50" />
        {post.category && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-accent text-white text-xs font-medium">
            {post.category}
          </span>
        )}
      </div>
      
      <CardContent className={cn('p-6', featured && 'md:w-3/5 md:flex md:flex-col md:justify-center')}>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {post.published_at || post.created_at}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.read_time || '5 min read'}
          </span>
        </div>
        
        <h3 className={cn(
          'font-semibold text-[var(--color-text-primary)] group-hover:text-accent transition-colors',
          featured ? 'text-2xl mb-3' : 'text-lg mb-2'
        )}>
          {post.title}
        </h3>
        
        <p className="text-[var(--color-text-secondary)] line-clamp-2 mb-4">
          {post.excerpt || post.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="w-4 h-4 text-accent" />
            </div>
            <span className="text-sm text-[var(--color-text-primary)]">
              {post.author || 'EngiSuite Team'}
            </span>
          </div>
          
          <Button variant="ghost" size="sm">
            Read More
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Blog page component
 */
function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Fetch blog posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog-posts', activeCategory],
    queryFn: () => {
      if (activeCategory === 'all') {
        return blogService.getAllPosts();
      }
      return blogService.getPostsByCategory(activeCategory);
    },
    placeholderData: [
      { id: 1, title: 'Understanding Voltage Drop Calculations', excerpt: 'Learn the fundamentals of voltage drop and how to calculate it accurately for your electrical installations.', category: 'Electrical', published_at: 'Feb 28, 2026', read_time: '8 min', author: 'Ahmed Hassan' },
      { id: 2, title: 'Structural Beam Design: A Complete Guide', excerpt: 'Master the art of beam design with our comprehensive guide covering bending moments, shear forces, and deflection.', category: 'Civil', published_at: 'Feb 25, 2026', read_time: '12 min', author: 'Sarah Mohamed' },
      { id: 3, title: 'Pump Sizing for Industrial Applications', excerpt: 'Discover the key factors to consider when sizing pumps for industrial fluid systems.', category: 'Mechanical', published_at: 'Feb 22, 2026', read_time: '10 min', author: 'Omar Khalil' },
      { id: 4, title: 'Introduction to Power Factor Correction', excerpt: 'Understanding power factor and how correction can improve efficiency and reduce costs.', category: 'Electrical', published_at: 'Feb 20, 2026', read_time: '7 min', author: 'Fatima Ali' },
      { id: 5, title: 'Concrete Mix Design Principles', excerpt: 'Learn the principles behind designing the perfect concrete mix for your construction projects.', category: 'Civil', published_at: 'Feb 18, 2026', read_time: '9 min', author: 'Youssef Ibrahim' },
    ],
  });
  
  // ListFilter posts by search
  const filteredPosts = posts?.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.excerpt?.toLowerCase().includes(query) ||
      post.description?.toLowerCase().includes(query)
    );
  });
  
  const categories = ['all', 'Electrical', 'Mechanical', 'Civil', 'General'];
  
  if (isLoading) {
    return <PageLoader message="Loading articles..." />;
  }
  
  // Get featured post (first post)
  const featuredPost = filteredPosts?.[0];
  const otherPosts = filteredPosts?.slice(1) || [];
  
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Page header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
          EngiSuite Blog
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2">
          Insights, tutorials, and best practices for engineering professionals.
        </p>
      </div>
      
      {/* Search and filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-lg',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
                  'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                )}
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-lg font-medium text-sm capitalize whitespace-nowrap transition-all',
                    activeCategory === cat
                      ? 'bg-accent text-white'
                      : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Featured post */}
      {featuredPost && (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Featured Article
          </h2>
          <BlogCard post={featuredPost} featured />
        </div>
      )}
      
      {/* Other posts */}
      {otherPosts.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No articles found"
          description="No articles match your search criteria."
          action={() => { setSearchQuery(''); setActiveCategory('all'); }}
          actionLabel="Clear filters"
        />
      )}
      
      {/* Newsletter signup */}
      <Card className="bg-gradient-to-r from-accent/10 to-violet-500/10 border-accent/20">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2 max-w-md mx-auto">
            Get the latest engineering insights and tutorials delivered to your inbox.
          </p>
          <div className="flex gap-3 mt-6 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg',
                'bg-[var(--color-bg-primary)] border border-[var(--color-border)]',
                'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
                'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
              )}
            />
            <Button>
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BlogPage;
