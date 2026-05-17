import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import MeetingList from './pages/MeetingList';
import MeetingDetail from './pages/MeetingDetail';
import MeetingPrepare from './pages/MeetingPrepare';
import MeetingMinutes from './pages/MeetingMinutes';
import ActionItems from './pages/ActionItems';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/meetings" element={<MeetingList />} />
        <Route path="/meetings/:id" element={<MeetingDetail />} />
        <Route path="/meetings/:id/prepare" element={<MeetingPrepare />} />
        <Route path="/meetings/:id/minutes" element={<MeetingMinutes />} />
        <Route path="/action-items" element={<ActionItems />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
};

export default App;
