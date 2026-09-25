import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { useCreditStore } from './stores/creditStore';
import { VDADataProvider } from './contexts/VDADataContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Main App component
 */
function App() {
  // Initialize auth state from cookies/localStorage on app start
  const init = useAuthStore((state) => state.init);
  const user = useAuthStore((state) => state.user);
  const setPaidStatus = useCreditStore((state) => state.setPaidStatus);

  useEffect(() => {
    init();
  }, [init]);

  // Sync paid plan status from user profile
  useEffect(() => {
    const paidPlans = ['starter', 'pro', 'enterprise'];
    const isPaid = user?.plan && paidPlans.includes(user.plan);
    setPaidStatus(!!isPaid);
  }, [user, setPaidStatus]);

  return (
    <QueryClientProvider client={queryClient}>
      <VDADataProvider>
        <RouterProvider router={router} />
      </VDADataProvider>
    </QueryClientProvider>
  );
}

export default App;
