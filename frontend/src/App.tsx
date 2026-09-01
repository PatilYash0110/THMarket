import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<div>Willkommen bei THMarket</div>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
