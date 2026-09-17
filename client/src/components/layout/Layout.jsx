import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import Toast from '../ui/Toast'

export default function Layout() {
  return (
    <div className="min-h-svh bg-cream text-charcoal">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  )
}
