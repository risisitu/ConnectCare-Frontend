import React, { useEffect, useState } from 'react';
// import { Mail } from 'lucide-react';

interface Report {
    id: string;
    doctor_first_name: string;
    doctor_last_name: string;
    diagnosis: string;
    appointment_date: string;
    prescription: string;
    notes: string;
}

const PatientRecentReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    // const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setReports(data.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                // setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <h4 className="mb-6 text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Recent Appointment Reports
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-lg dark:border-strokedark">
                        <p>No reports received yet.</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="cursor-pointer group relative flex flex-col items-center justify-center p-6 bg-white border-2 border-gray-100 rounded-lg shadow-sm hover:shadow-md hover:border-primary transition-all duration-300 dark:bg-meta-4 dark:border-strokedark dark:hover:border-primary"
                        >
                            {/* Envelope Flap Effect (Visual) */}
                            <div className="mb-4 p-4 bg-blue-50 rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>

                            <h5 className="font-semibold text-black dark:text-white mb-1">
                                Dr. {report.doctor_first_name} {report.doctor_last_name}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {formatDate(report.appointment_date)}
                            </p>
                            <span className="inline-block px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                                Medical Report
                            </span>
                        </div>
                    ))
                )}
            </div>

            {/* Modal for viewing report details */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark max-h-[90vh] overflow-y-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                Report Details
                            </h3>
                            <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4 dark:border-strokedark">
                                <div>
                                    <p className="text-sm text-gray-500">Doctor</p>
                                    <p className="font-semibold text-black dark:text-white">Dr. {selectedReport.doctor_first_name} {selectedReport.doctor_last_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-semibold text-black dark:text-white">{formatDate(selectedReport.appointment_date)}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-primary mb-2">Diagnosis</h4>
                                <div className="bg-gray-50 p-4 rounded dark:bg-meta-4">
                                    <p className="text-black dark:text-gray-300">{selectedReport.diagnosis}</p>
                                </div>
                            </div>

                            {selectedReport.prescription && (
                                <div>
                                    <h4 className="font-semibold text-primary mb-2">Prescription / Plan</h4>
                                    <div className="bg-blue-50 p-4 rounded dark:bg-blue-900/20">
                                        <p className="whitespace-pre-wrap text-black dark:text-gray-300">{selectedReport.prescription}</p>
                                    </div>
                                </div>
                            )}

                            {/* Try to parse structured notes if possible */}
                            {(() => {
                                try {
                                    const parsed = JSON.parse(selectedReport.notes);
                                    return (
                                        <div className="space-y-4">
                                            {Object.entries(parsed).map(([key, value]) => {
                                                if (key === 'diagnosis' || key === 'assessment' || key === 'treatment_plan') return null;
                                                const title = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                return (
                                                    <div key={key}>
                                                        <h4 className="font-semibold text-primary">{title}</h4>
                                                        <p className="text-sm text-black dark:text-gray-300">{String(value)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                } catch (e) {
                                    return (
                                        <div>
                                            <h4 className="font-semibold text-primary">Notes</h4>
                                            <p className="whitespace-pre-wrap text-black dark:text-gray-300">{selectedReport.notes}</p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="rounded bg-primary px-6 py-2 text-white hover:bg-opacity-90 font-medium"
                            >
                                Close Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientRecentReports;
