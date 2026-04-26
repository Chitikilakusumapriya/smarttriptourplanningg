import { Route, Routes, Navigate } from 'react-router-dom'
import OfflineBanner from './components/OfflineBanner'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DriverDashboard from './pages/DriverDashboard'
import AdminDashboard from './pages/AdminDashboard'
import TripPlanner from './pages/TripPlanner'
import TripMapView from './pages/TripMapView'
import MonitoringPage from './pages/MonitoringPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import { useLocation } from 'react-router-dom'
import PassengerPlanner from './pages/PassengerPlanner'
import TripCreatePage from './pages/TripCreatePage'
import TripDetailsPage from './pages/TripDetailsPage'
import AvailableVehiclesPage from './pages/AvailableVehiclesPage'
import AddVehiclePage from './pages/AddVehiclePage'
import TripVehicleSummaryPage from './pages/TripVehicleSummaryPage'
import TripConfirmationStatusPage from './pages/TripConfirmationStatusPage'
import AdminConfirmationsPage from './pages/AdminConfirmationsPage'
import DriverConfirmationPage from './pages/DriverConfirmationPage'
import TripConfirmationPage from './pages/TripConfirmationPage'
import DriverAssignmentsPage from './pages/DriverAssignmentsPage'
import TripSendPage from './pages/TripSendPage'
import ShareTrackingPage from './pages/ShareTrackingPage'
import AdminConfirmedTripsPage from './pages/AdminConfirmedTripsPage'
import PassengerTrackPage from './pages/PassengerTrackPage'
import DriverRoutePlanner from './pages/DriverRoutePlanner'
// BeamsBackground removed globally

function App() {
  const location = useLocation()
  const path = location.pathname || ''
  const isAuth = path.startsWith('/login') || path.startsWith('/register')

  return (
    <div className="relative min-h-screen flex flex-col">
      <OfflineBanner />
      <main className={isAuth ? 'flex-1' : 'relative z-10 flex-1 w-full'}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/passenger/plan" element={<PassengerPlanner />} />
          <Route path="/passenger/trip/create" element={<TripCreatePage />} />
          <Route path="/passenger/trip/:id" element={<TripDetailsPage />} />
          <Route path="/passenger/trip/:id/vehicles" element={<AvailableVehiclesPage />} />
          <Route path="/passenger/trip/:id/summary" element={<TripVehicleSummaryPage />} />
          <Route path="/passenger/trip/:id/confirmation" element={<TripConfirmationStatusPage />} />
          <Route path="/passenger/track" element={<PassengerTrackPage />} />
          <Route path="/admin/vehicles/add" element={<AddVehiclePage />} />
          <Route path="/admin/trips" element={<AdminConfirmationsPage />} />
          <Route path="/admin/confirmed-trips" element={<AdminConfirmedTripsPage />} />
          <Route path="/driver/confirmations" element={<DriverConfirmationPage />} />
          <Route path="/driver/trip/confirmation" element={<TripConfirmationPage />} />
          <Route path="/driver/assignments" element={<DriverAssignmentsPage />} />
          <Route path="/driver/assignments/:driverId" element={<DriverAssignmentsPage />} />
          <Route path="/driver/trip/send" element={<TripSendPage />} />
          <Route path="/driver/share" element={<ShareTrackingPage />} />
          <Route path="/driver/routing" element={<DriverRoutePlanner />} />

          <Route path="/trip/planning" element={<TripPlanner />} />
          <Route path="/trip/:id/map" element={<TripMapView />} />

          <Route path="/monitoring" element={<MonitoringPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
