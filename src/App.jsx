import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import DashboardLayout from './components/Layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Protocols from './pages/Protocols';
import Planner from './pages/Planner';
import { useStore } from './store';

function App() {
  const theme = useStore(state => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="insights" element={<Insights />} />
          <Route path="protocols" element={<Protocols />} />
          <Route path="planner" element={<Planner />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
