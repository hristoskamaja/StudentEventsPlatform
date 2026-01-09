// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./ui/components/Header";
import HomePage from "./ui/pages/HomePage";
import EventsPage from "./ui/pages/EventsPage";
import EventDetailsPage from "./ui/pages/EventDetailsPage";
import EventEditPage from "./ui/pages/EditEventPage.jsx";
import ManagePage from "./ui/pages/ManagePage.jsx";
import EditEventPage from "./ui/pages/EditEventPage.jsx";
import CreateEventPage from "./ui/pages/CreateEventPage.jsx";
import Footer from "./ui/components/Footer";
import MyRegistrationsPage from "./ui/pages/MyRegistrationsPage";
import PaymentSuccessPage from "./ui/components/PaymentSuccessPage.jsx";
import {PaymentCancel} from "./ui/components/PaymentCanceled.jsx";
import TicketPage from "./ui/pages/TicketPage.jsx";

export default function App() {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/events/:id/edit" element={<EditEventPage />} />
                <Route path="/manage" element={<ManagePage />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailsPage />} />
                <Route path="/me/registrations" element={<MyRegistrationsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/events/:id/edit" element={<EventEditPage />} />
                <Route path="/registrations" element={<MyRegistrationsPage />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />
                <Route path="/payment/success" element={<PaymentSuccessPage />} />
                <Route path="/ticket/:registrationId" element={<TicketPage />} />
            </Routes>
            <Footer />
        </>
    );
}
