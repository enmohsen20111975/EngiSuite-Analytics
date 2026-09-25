import { Construction } from 'lucide-react';
import { Card, CardContent } from '../components/ui';

/**
 * Placeholder page for routes under development
 */
function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-up">
      <Card className="max-w-md w-full text-center">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            {title || 'Coming Soon'}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            {description || 'This page is currently under development. Check back soon for updates.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PlaceholderPage;
