import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle } from 'lucide-react';

export default function BedTicker({ availableBeds, lastUpdated }) {
    const [isStale, setIsStale] = useState(false);

    useEffect(() => {
        const checkStaleData = () => {
            // If last_updated is older than 4 hours
            const now = new Date().getTime();
            const updatedTime = new Date(lastUpdated).getTime();
            const differenceHours = (now - updatedTime) / (1000 * 60 * 60);
            setIsStale(differenceHours > 4);
        };

        checkStaleData();
        // Check every minute
        const interval = setInterval(checkStaleData, 60000);
        return () => clearInterval(interval);
    }, [lastUpdated]);

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm transition-colors ${isStale ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'}`}>
            <div className={`p-2 rounded-lg ${isStale ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-[var(--color-primary-cyan)]'}`}>
                {isStale ? <AlertTriangle className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            </div>

            <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                    ICU Beds Available
                </span>
                <div className="flex items-end gap-2">
                    <span className={`text-2xl font-bold leading-none ${isStale ? 'text-red-600' : 'text-gray-900'}`}>
                        {availableBeds}
                    </span>
                    {isStale && (
                        <span className="text-xs font-bold text-red-600 mb-0.5 px-2 py-0.5 bg-red-100 rounded-full animate-pulse">
                            Data Stale
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
