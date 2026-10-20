import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AnalyticsPage from "./pages/AnalyticsPage";
import AssistantPage from "./pages/AssistantPage";
import DashboardPage from "./pages/DashboardPage";
import EventsPage from "./pages/EventsPage";
import MyVehiclePage from "./pages/MyVehiclePage";
import NotFoundPage from "./pages/NotFoundPage";
import { VehicleProvider } from "./context/VehicleContext";

export default function App() {
  return (
    <BrowserRouter>
      <VehicleProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="my-vehicle" element={<MyVehiclePage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </VehicleProvider>
    </BrowserRouter>
  );
}
