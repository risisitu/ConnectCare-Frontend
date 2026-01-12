import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';



export default function KeyMetrics() {
    const [metrics, setMetrics] = useState({
        followUpRate: "0%",
        dailyCapacity: "12 patients/day",
        avgTime: "15 mins",
        satisfaction: "4.8/5"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch("http://localhost:3000/api/doctors/appointments", {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && Array.isArray(result.data)) {
                        const appointments: any[] = result.data;

                        // Calculate Follow-up Rate
                        // Patients with > 1 appointment / Total Unique Patients
                        const patientCounts: Record<string, number> = {};
                        appointments.forEach(app => {
                            if (app.patient_id) {
                                patientCounts[app.patient_id] = (patientCounts[app.patient_id] || 0) + 1;
                            }
                        });

                        const uniquePatients = Object.keys(patientCounts).length;
                        const returningPatients = Object.values(patientCounts).filter(count => count > 1).length;

                        let rate = 0;
                        if (uniquePatients > 0) {
                            rate = Math.round((returningPatients / uniquePatients) * 100);
                        }

                        setMetrics(prev => ({
                            ...prev,
                            followUpRate: `${rate}%`
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching metrics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
                title="Total Capacity"
                value={metrics.dailyCapacity}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                }
            />
            <MetricCard
                title="Avg. Consultation Time"
                value={metrics.avgTime}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
            />
            <MetricCard
                title="Patient Satisfaction"
                value={metrics.satisfaction}
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                }
            />
            <MetricCard
                title="Follow-up Rate"
                value={metrics.followUpRate}
                subtitle="Returning patients"
                icon={
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                }
            />
        </div>
    );
}
