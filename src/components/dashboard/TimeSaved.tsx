import React from 'react';

export default function TimeSaved() {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-default dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 justify-between gap-4 sm:flex">
                <div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                        Time Saved with AI
                    </h4>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Transcription vs Manual Notes
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-white">This Week</h5>
                            <p className="text-xs text-gray-500">Since Monday</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-brand-600 dark:text-brand-400">4.7 hours</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <div>
                            <h5 className="font-semibold text-gray-800 dark:text-white">This Month</h5>
                            <p className="text-xs text-gray-500">Current Billing Cycle</p>
                        </div>
                    </div>
                    <span className="text-lg font-bold text-success-600 dark:text-success-400">19.2 hrs</span>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency Gain</span>
                    <span className="text-sm font-bold text-brand-600 dark:text-brand-400">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-brand-600 h-2.5 rounded-full" style={{ width: '87%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">87% faster than manual documentation</p>
            </div>
        </div>
    );
}
