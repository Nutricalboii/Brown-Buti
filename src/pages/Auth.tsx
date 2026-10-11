import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { loginCustomer, registerCustomer } from '../lib/shopify-auth';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let token;
      if (isLogin) {
        token = await loginCustomer(email, password);
      } else {
        token = await registerCustomer(email, password, firstName, lastName);
      }
      
      if (token?.accessToken) {
        setAccessToken(token.accessToken);
        navigate('/profile');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center bg-mocha-50">
      <div className="w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 border border-mocha-200"
        >
          <div className="text-center mb-10">
            <h1 className="font-cinzel text-3xl text-mocha-900 uppercase tracking-widest mb-2">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h1>
            <p className="font-lora text-sm text-mocha-500 italic">
              {isLogin ? 'Access your curated wardrobe.' : 'Begin your journey with us.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 mb-6 font-lora text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-cinzel text-[10px] tracking-widest uppercase text-mocha-500 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border-b border-mocha-300 py-2 font-lora text-mocha-900 bg-transparent focus:outline-none focus:border-mocha-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-cinzel text-[10px] tracking-widest uppercase text-mocha-500 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border-b border-mocha-300 py-2 font-lora text-mocha-900 bg-transparent focus:outline-none focus:border-mocha-900 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-cinzel text-[10px] tracking-widest uppercase text-mocha-500 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-mocha-300 py-2 font-lora text-mocha-900 bg-transparent focus:outline-none focus:border-mocha-900 transition-colors"
              />
            </div>

            <div>
              <label className="block font-cinzel text-[10px] tracking-widest uppercase text-mocha-500 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-mocha-300 py-2 font-lora text-mocha-900 bg-transparent focus:outline-none focus:border-mocha-900 transition-colors"
              />
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary-filled justify-center py-4 text-sm flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={16} strokeWidth={1.5} />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-mocha-100 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-cinzel text-xs tracking-widest uppercase text-mocha-600 hover:text-mocha-900 transition-colors"
            >
              {isLogin ? 'Create an Account instead' : 'Already have an account? Sign In'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
