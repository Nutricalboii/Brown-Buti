import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function formatOrderPrice(amountText: string, currencyCode: string): string {
  const amount = Number(amountText);
  if (!Number.isFinite(amount)) return `${currencyCode} —`;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currencyCode} ${amount.toFixed(2)}`;
  }
}

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen flex items-center justify-center">
        <p className="font-cinzel tracking-widest text-mocha-500 uppercase">Loading Profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const orders = user.orders?.edges?.map(({ node }) => node) || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-mocha-200 pb-10">
          <div>
            <p className="section-label mb-3">Your Account</p>
            <h1 className="font-cinzel text-4xl text-mocha-900 uppercase tracking-widest mb-2">
              Welcome, {user.firstName || 'Guest'}
            </h1>
            <p className="font-lora text-mocha-600 italic">
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-cinzel text-xs tracking-widest uppercase text-mocha-500 hover:text-mocha-900 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content: Order History */}
          <div className="lg:col-span-2">
            <h2 className="font-cinzel text-xl text-mocha-900 uppercase tracking-widest mb-8">
              Order History
            </h2>

            {orders.length === 0 ? (
              <div className="bg-mocha-50 p-10 text-center border border-mocha-100">
                <Package size={32} className="mx-auto text-mocha-300 mb-4" strokeWidth={1} />
                <p className="font-playfair text-xl text-mocha-900 mb-2">No orders yet</p>
                <p className="font-lora text-sm text-mocha-500 mb-6">Your curated collection awaits.</p>
                <button
                  onClick={() => navigate('/shop')}
                  className="font-cinzel text-xs tracking-widest uppercase border-b border-mocha-900 pb-1 hover:text-mocha-600 transition-colors inline-flex items-center gap-2"
                >
                  Start Shopping <ArrowRight size={12} />
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-mocha-200 p-6"
                  >
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-mocha-100">
                      <div>
                        <p className="font-cinzel text-xs tracking-widest uppercase text-mocha-500 mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="font-lora text-sm text-mocha-900">
                          {new Date(order.processedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-playfair text-lg text-mocha-900 mb-1">
                          {formatOrderPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                        </p>
                        <span className="inline-block px-2 py-1 bg-mocha-50 text-mocha-700 font-cinzel text-[9px] tracking-wider uppercase">
                          {order.fulfillmentStatus || 'Processing'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {order.lineItems.edges.map((itemEdge) => {
                        const item = itemEdge.node;
                        return (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-mocha-50 overflow-hidden flex-shrink-0">
                              {item.variant?.image?.url ? (
                                <img src={item.variant.image.url} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-mocha-300">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-playfair text-mocha-900">{item.title}</p>
                              <p className="font-lora text-sm text-mocha-500 italic">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-mocha-50 p-8 border border-mocha-100">
              <h3 className="font-cinzel text-sm tracking-widest uppercase text-mocha-900 mb-6">
                Account Details
              </h3>
              <div className="space-y-4 font-lora text-sm text-mocha-700">
                <div>
                  <p className="text-mocha-400 text-xs uppercase tracking-wider mb-1">Name</p>
                  <p>{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-mocha-400 text-xs uppercase tracking-wider mb-1">Email</p>
                  <p>{user.email}</p>
                </div>
                {user.phone && (
                  <div>
                    <p className="text-mocha-400 text-xs uppercase tracking-wider mb-1">Phone</p>
                    <p>{user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
