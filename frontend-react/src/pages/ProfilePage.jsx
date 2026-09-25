import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  User, Mail, Building, MapPin, Phone, Camera,
  Save, Shield, Bell, Globe, Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';

/**
 * Profile page component
 */
function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
  };
  
  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
          Profile Settings
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Manage your account information and preferences.
        </p>
      </div>
      
      {/* Profile picture section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-accent">
                  {formData.name?.charAt(0) || formData.email?.charAt(0) || 'U'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-accent text-white shadow-lg hover:bg-accent-hover transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                {formData.name || 'User'}
              </h2>
              <p className="text-[var(--color-text-secondary)]">{formData.email}</p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Member since {user?.created_at || 'February 2026'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Profile form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                disabled
              />
              <Input
                label="Company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company"
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
              />
              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
                className={cn(
                  'w-full px-4 py-2.5 rounded-lg resize-none',
                  'bg-[var(--color-bg-secondary)] border border-[var(--color-border)]',
                  'text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]',
                  'focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none'
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button type="button" variant="secondary">
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>
      </form>
      
      {/* Security section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-4">
              <Key className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Password</p>
                <p className="text-sm text-[var(--color-text-muted)]">Last changed 30 days ago</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Change Password
            </Button>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 text-[var(--color-text-muted)]" />
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">Two-Factor Authentication</p>
                <p className="text-sm text-[var(--color-text-muted)]">Add an extra layer of security</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProfilePage;
