import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAdmin, RequireStudent } from './components/RequireAuth'
import { Admin } from './pages/Admin'
import { Checkout } from './pages/Checkout'
import { Favorites } from './pages/Favorites'
import { Home } from './pages/Home'
import { ListingDetail } from './pages/ListingDetail'
import { ListingForm } from './pages/ListingForm'
import { Login } from './pages/Login'
import { Messages } from './pages/Messages'
import { NotFound } from './pages/NotFound'
import { Profile } from './pages/Profile'
import { Register } from './pages/Register'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="listing/new" element={<ListingForm />} />
        <Route path="listing/:id" element={<ListingDetail />} />
        <Route path="listing/:id/edit" element={<ListingForm />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route
          path="profile"
          element={
            <RequireStudent>
              <Profile />
            </RequireStudent>
          }
        />
        <Route
          path="favorites"
          element={
            <RequireStudent>
              <Favorites />
            </RequireStudent>
          }
        />
        <Route
          path="messages"
          element={
            <RequireStudent>
              <Messages />
            </RequireStudent>
          }
        />
        <Route
          path="messages/:conversationId"
          element={
            <RequireStudent>
              <Messages />
            </RequireStudent>
          }
        />
        <Route
          path="checkout/:listingId"
          element={
            <RequireStudent>
              <Checkout />
            </RequireStudent>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <Admin />
            </RequireAdmin>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
