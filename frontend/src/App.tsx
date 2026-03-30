import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Dashboard } from './features/dashboard/Dashboard'
import { Layout } from './components/Layout'
import { PlayerProvider } from './contexts/PlayerContext'

// Stub views for the new dedicated sections
const MomentsView = () => <div className="p-8 text-white"><h1 className="text-3xl font-black text-rose-500 mb-4">Critical Moments</h1><p className="text-slate-400">In-depth breakdown of match turning points.</p></div>
const HabitsView = () => <div className="p-8 text-white"><h1 className="text-3xl font-black text-cyan-500 mb-4">Core Habits</h1><p className="text-slate-400">Detailed metric analysis of your fundamental playstyle.</p></div>
const TrainingView = () => <div className="p-8 text-white"><h1 className="text-3xl font-black text-amber-500 mb-4">Training Plan</h1><p className="text-slate-400">Comprehensive coaching steps generated for your history.</p></div>

function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/moments" element={<MomentsView />} />
            <Route path="/habits" element={<HabitsView />} />
            <Route path="/training" element={<TrainingView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </PlayerProvider>
    </BrowserRouter>
  )
}

export default App
