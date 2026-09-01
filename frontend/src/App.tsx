import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
      <Route index element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
