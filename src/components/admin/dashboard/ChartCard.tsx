"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// ChartJS'i kaydet
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartCardProps {
    title: string;
    type: 'line' | 'bar';
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor?: string;
            borderColor?: string;
            fill?: boolean;
        }[];
    };
    color: 'blue' | 'teal' | 'indigo' | 'rose' | 'amber' | 'emerald';
    description?: string;
    isLoading?: boolean;
}

const colors = {
    blue: {
        gradient: ['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0)'],
        border: 'rgb(37, 99, 235)',
        light: 'rgba(59, 130, 246, 0.7)',
        dark: 'rgb(30, 64, 175)',
        text: 'text-blue-600',
    },
    teal: {
        gradient: ['rgba(20, 184, 166, 0.2)', 'rgba(13, 148, 136, 0)'],
        border: 'rgb(13, 148, 136)',
        light: 'rgba(20, 184, 166, 0.7)',
        dark: 'rgb(15, 118, 110)',
        text: 'text-teal-600',
    },
    indigo: {
        gradient: ['rgba(99, 102, 241, 0.2)', 'rgba(79, 70, 229, 0)'],
        border: 'rgb(79, 70, 229)',
        light: 'rgba(99, 102, 241, 0.7)',
        dark: 'rgb(67, 56, 202)',
        text: 'text-indigo-600',
    },
    rose: {
        gradient: ['rgba(244, 63, 94, 0.2)', 'rgba(225, 29, 72, 0)'],
        border: 'rgb(225, 29, 72)',
        light: 'rgba(244, 63, 94, 0.7)',
        dark: 'rgb(190, 18, 60)',
        text: 'text-rose-600',
    },
    amber: {
        gradient: ['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0)'],
        border: 'rgb(217, 119, 6)',
        light: 'rgba(245, 158, 11, 0.7)',
        dark: 'rgb(180, 83, 9)',
        text: 'text-amber-600',
    },
    emerald: {
        gradient: ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0)'],
        border: 'rgb(5, 150, 105)',
        light: 'rgba(16, 185, 129, 0.7)',
        dark: 'rgb(4, 120, 87)',
        text: 'text-emerald-600',
    },
};

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    type,
    data,
    color,
    description,
    isLoading = false,
}) => {
    const colorSet = colors[color];

    // Grafik verilerini ve seçeneklerini hazırla
    const chartData = {
        ...data,
        datasets: data.datasets.map((dataset, index) => ({
            ...dataset,
            backgroundColor: type === 'line'
                ? function (context: any) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return;

                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, colorSet.gradient[1]);
                    gradient.addColorStop(1, colorSet.gradient[0]);
                    return gradient;
                }
                : colorSet.light,
            borderColor: colorSet.border,
            tension: 0.3,
            fill: type === 'line' ? true : false,
            borderWidth: 2,
        })),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 10,
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: data.datasets.length > 1,
                position: 'top' as const,
                labels: {
                    boxWidth: 10,
                    usePointStyle: true,
                    font: {
                        size: 11,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#000',
                bodyColor: '#666',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                padding: 10,
                boxPadding: 5,
                usePointStyle: true,
                bodyFont: {
                    size: 11,
                },
                titleFont: {
                    size: 12,
                    weight: 'bold' as const,
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
    };

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-60 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                </div>
                {description && <div className="h-4 bg-gray-200 rounded w-2/3 mt-4"></div>}
            </div>
        );
    }

    return (
        <motion.div
            className="rounded-xl bg-white border border-gray-200 p-4 sm:p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">
                    {title}
                </h3>
                <div className={`text-xs font-medium ${colorSet.text} bg-gray-100 px-2 py-1 rounded-md`}>
                    {data.datasets[0].data.reduce((acc, val) => acc + val, 0).toLocaleString()}
                </div>
            </div>

            <div className="h-60 sm:h-72">
                {type === 'line' ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <Bar data={chartData} options={chartOptions} />
                )}
            </div>

            {description && (
                <p className="mt-4 text-xs sm:text-sm text-gray-500">
                    {description}
                </p>
            )}
        </motion.div>
    );
};

export default ChartCard; 