/**
 * Login page for member authentication
 * - Adds an invisible "Quick Demo Login" button that only appears while holding Alt/Option
 * - Shows a compact toast after quick demo login, then navigates to /dashboard
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

/**
 * Login component
 * - Handles credential sign-in
 * - Provides a dev-only quick-login button using demo credentials (Alt/Option reveal)
 */
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /** Whether Alt/Option is currently held (reveals the invisible quick-login area) */
  const [altActive, setAltActive] = useState(false);

  const { login } = useAuthStore();
  const navigate = useNavigate();

  /**
   * Submit handler for normal login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please use demo@clinicalrxq.com / password');
      }
    } catch (_err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Invisible quick login with demo credentials for development convenience
   * - Uses auth store login and navigates to /dashboard on success
   * - Emits a toast on success
   */
  const handleQuickLogin = async () => {
    if (isLoading) return;
    setError('');
    setIsLoading(true);
    try {
      const success = await login('demo@clinicalrxq.com', 'password');
      if (success) {
        toast.success('Signed in to demo account');
        navigate('/dashboard');
      } else {
        setError('Quick login failed. Demo credentials may be unavailable.');
      }
    } catch (_err) {
      setError('An error occurred during quick login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Detect Alt/Option pressed to conditionally reveal the quick-login button.
   * - Keydown: if Alt is held, mark active
   * - Keyup: on releasing Alt, deactivate
   * - Blur: ensure deactivation when window loses focus
   */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) setAltActive(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setAltActive(false);
    };
    const onBlur = () => setAltActive(false);

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <p className="text-gray-600">Sign in to your ClinicalRxQ account</p>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-6" variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{' '}
                  <a href="#/enroll" className="text-blue-600 hover:underline">
                    Sign up here
                  </a>
                </p>
              </div>

              {/* Invisible Quick Demo Login button (Alt/Option reveal)
                 - When Alt is held, opacity becomes 100% (but still white-on-white), otherwise it's non-interactive.
                 - Disabled while loading. */}
              <div className={`mt-6 transition-opacity ${altActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button
                  type="button"
                  onClick={handleQuickLogin}
                  disabled={isLoading}
                  aria-label="Quick demo login"
                  aria-hidden={!altActive}
                  className="w-full h-10 rounded-md bg-white text-white border-0 p-0 m-0 focus:outline-none focus:ring-0 select-none"
                >
                  {/* Intentionally empty for invisibility */}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
