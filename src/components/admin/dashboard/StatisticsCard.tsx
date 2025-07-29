"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface StatisticsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        positive: boolean;
    };
    subtitle?: string;
    link?: string;
    color: 'blue' | 'teal' | 'indigo' | 'rose' | 'amber' | 'emerald';
    isLoading?: boolean;
}

const colors = {
    blue: {
        bgGradient: 'from-blue-500 to-blue-700',
        bgLight: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'text-blue-600',
        hover: 'hover:shadow-blue-100/40',
    },
    teal: {
        bgGradient: 'from-teal-500 to-teal-700',
        bgLight: 'bg-teal-50',
        border: 'border-teal-100',
        text: 'text-teal-600',
        hover: 'hover:shadow-teal-100/40',
    },
    indigo: {
        bgGradient: 'from-indigo-500 to-indigo-700',
        bgLight: 'bg-indigo-50',
        border: 'border-indigo-100',
        text: 'text-indigo-600',
        hover: 'hover:shadow-indigo-100/40',
    },
    rose: {
        bgGradient: 'from-rose-500 to-rose-700',
        bgLight: 'bg-rose-50',
        border: 'border-rose-100',
        text: 'text-rose-600',
        hover: 'hover:shadow-rose-100/40',
    },
    amber: {
        bgGradient: 'from-amber-500 to-amber-700',
        bgLight: 'bg-amber-50',
        border: 'border-amber-100',
        text: 'text-amber-600',
        hover: 'hover:shadow-amber-100/40',
    },
    emerald: {
        bgGradient: 'from-emerald-500 to-emerald-700',
        bgLight: 'bg-emerald-50',
        border: 'border-emerald-100',
        text: 'text-emerald-600',
        hover: 'hover:shadow-emerald-100/40',
    },
};

const StatisticsCard: React.FC<StatisticsCardProps> = ({
    title,
    value,
    icon,
    trend,
    subtitle,
    link,
    color,
    isLoading = false,
}) => {
    const colorClasses = colors[color];

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.bgLight} ${colorClasses.border}`}>
                            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-300 rounded" />
                        </div>
                        <div className="ml-3 h-4 bg-gray-300 rounded w-16 sm:w-24"></div>
                    </div>
                </div>
                <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
                {subtitle && <div className="h-4 bg-gray-200 rounded w-1/2"></div>}
            </div>
        );
    }

    const cardContent = (
        <>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${colorClasses.bgGradient} text-white`}>
                        {icon}
                    </div>
                    <h3 className="ml-3 text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                        {title}
                    </h3>
                </div>
                {trend && (
                    <div
                        className={`text-xs sm:text-sm flex items-center font-medium ${trend.positive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                    >
                        <span className="mr-1">
                            {trend.positive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                        </span>
                        {trend.value}%
                    </div>
                )}
            </div>
            <div className="mb-1 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                {value}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
        </>
    );

    const cardClasses = `rounded-xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm transition-all hover:shadow-lg ${colorClasses.hover} ${link ? 'cursor-pointer' : ''}`;

    return link ? (
        <Link href={link} className={cardClasses}>
            {cardContent}
        </Link>
    ) : (
        <motion.div
            className={cardClasses}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {cardContent}
        </motion.div>
    );
};

export default StatisticsCard; 