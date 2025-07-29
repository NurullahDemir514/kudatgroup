"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface ActivityItem {
    id: string | number;
    title: string;
    description?: string;
    time: string;
    icon?: React.ReactNode;
    status?: 'success' | 'warning' | 'error' | 'info' | 'pending';
    user?: {
        name: string;
        avatar?: string;
    };
}

interface ActivitySummaryProps {
    title?: string;
    activities: ActivityItem[];
    maxItems?: number;
    isLoading?: boolean;
    emptyStateText?: string;
}

const statusColors = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    error: 'bg-rose-100 text-rose-800 border-rose-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusIcons = {
    success: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
    ),
    warning: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
    ),
    error: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    info: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    pending: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

const ActivitySummary: React.FC<ActivitySummaryProps> = ({
    title = 'Aktiviteler',
    activities = [],
    maxItems = 5,
    isLoading = false,
    emptyStateText = 'Henüz aktivite bulunmuyor',
}) => {
    // Verileri son zamana göre filtrele ve sınırla
    const displayedActivities = activities
        .slice(0, maxItems);

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-6">
                    <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="space-y-4">
                    {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                            <div className="ml-3 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-6">
                    {title}
                </h3>
                <div className="py-6 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-gray-600 font-medium text-base mb-2">
                        {emptyStateText}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Yeni aktiviteler burada görüntülenecektir.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="rounded-xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-6">
                {title}
            </h3>
            <div className="space-y-4">
                {displayedActivities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        className="flex"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.status ? statusColors[activity.status] : 'bg-gray-100'}`}>
                            {activity.icon || (activity.status && statusIcons[activity.status])}
                        </div>
                        <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-800">
                                    {activity.title}
                                </h4>
                                <span className="text-xs text-gray-500">
                                    {activity.time}
                                </span>
                            </div>
                            {activity.description && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {activity.description}
                                </p>
                            )}
                            {activity.user && (
                                <div className="flex items-center mt-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 text-xs flex items-center justify-center overflow-hidden">
                                        {activity.user.avatar ? (
                                            <img
                                                src={activity.user.avatar}
                                                alt={activity.user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            activity.user.name.charAt(0)
                                        )}
                                    </div>
                                    <span className="ml-1 text-xs text-gray-600">
                                        {activity.user.name}
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
            {activities.length > maxItems && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Tümünü Görüntüle ({activities.length})
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default ActivitySummary; 