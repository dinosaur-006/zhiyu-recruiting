import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Home } from './routes/Home';
import { HrLayout } from './routes/hr/HrLayout';
import { Dashboard } from './routes/hr/Dashboard';
import { Jobs } from './routes/hr/Jobs';
import { JobNew } from './routes/hr/JobNew';
import { AvatarConfigPage } from './routes/hr/AvatarConfig';
import { Share } from './routes/hr/Share';
import { Candidates } from './routes/hr/Candidates';
import { CandidateDetail } from './routes/hr/CandidateDetail';
import { Analytics } from './routes/hr/Analytics';
import { Settings } from './routes/hr/Settings';
import { CandidateLayout } from './routes/candidate/CandidateLayout';
import { JobDetail } from './routes/candidate/JobDetail';
import { Chat } from './routes/candidate/Chat';
import { Profile } from './routes/candidate/Profile';
import { StoryPreview } from './routes/candidate/StoryPreview';
import { Success } from './routes/candidate/Success';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/hr',
    element: <HrLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'jobs', element: <Jobs /> },
      { path: 'jobs/new', element: <JobNew /> },
      { path: 'avatar/:jobId', element: <AvatarConfigPage /> },
      { path: 'share/:jobId', element: <Share /> },
      { path: 'candidates', element: <Candidates /> },
      { path: 'candidates/:candidateId', element: <CandidateDetail /> },
      { path: 'analytics', element: <Analytics /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/candidate',
    element: <CandidateLayout />,
    children: [
      { path: 'job/:jobId', element: <JobDetail /> },
      { path: 'chat/:jobId', element: <Chat /> },
      { path: 'profile/:jobId', element: <Profile /> },
      { path: 'story/:candidateId', element: <StoryPreview /> },
      { path: 'success/:candidateId', element: <Success /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
