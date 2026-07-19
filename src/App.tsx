import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Admin } from './pages/Admin'
import { Compare } from './pages/Compare'
import { HomeV2 } from './pages/HomeV2'
import { Methodology } from './pages/Methodology'
import { Pricing } from './pages/Pricing'
import { Projects } from './pages/Projects'
import { Report } from './pages/Report'
import { Scan } from './pages/Scan'

export default function App() {
  return (
    <BrowserRouter basename="/rust-it-up">
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomeV2 />} />
          <Route path="scan/:scanId" element={<Scan />} />
          <Route path="r/:owner/:repo" element={<Report />} />
          <Route path="projects" element={<Projects />} />
          <Route path="compare" element={<Compare />} />
          <Route path="methodology" element={<Methodology />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
