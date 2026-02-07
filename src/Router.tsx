import { BrowserRouter, Routes, Route } from 'react-router'
import App from './App'
import { AdminLayout } from './admin/AdminLayout'
import { AdminHome } from './admin/AdminHome'
import { AdminItems } from './admin/AdminItems'
import { AdminCategories } from './admin/AdminCategories'
import { AdminDisputes } from './admin/AdminDisputes'
import { AdminSources } from './admin/AdminSources'

export function Router() {
  return (
    <BrowserRouter basename="/hilo">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="sources" element={<AdminSources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
