import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NotFound } from './pages/NotFound'
import { Home } from './pages/Home'
import { ListingDetail } from './pages/ListingDetail'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ListingForm } from './pages/ListingForm'
import { Profile } from './pages/Profile'
import { RequireAuth } from './components/RequireAuth'
import { Favorites } from './pages/Favorites'
import { Messages } from './pages/Messages'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="listing/new" element={<ListingForm />} />
        <Route path="listing/:id/edit" element={<ListingForm />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="favorites" element={<RequireAuth><Favorites /></RequireAuth>} />
        <Route path="messages" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="messages/:conversationId" element={<RequireAuth><Messages /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}


