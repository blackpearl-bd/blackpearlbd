import { PackageBuilderForm } from '@/components/package-builder/PackageBuilderForm';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignIn } from '@/components/auth/GoogleSignIn';
import { Card, CardContent } from '@/components/ui/card';

export default function BuildPackage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-24">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">
              Sign in to Build Your Package
            </h2>
            <p className="text-slate-600 mb-6">
              Create your custom travel package by signing in with Google
            </p>
            <GoogleSignIn />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Build Your Package</h1>
        <p className="text-slate-600">Create a custom travel package tailored to your preferences</p>
      </div>
      <PackageBuilderForm />
    </div>
  );
}
