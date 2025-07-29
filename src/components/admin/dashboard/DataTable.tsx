"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Column<T> {
    key: string;
    header: string;
    width?: string;
    cell?: (item: T, index: number) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    title: string;
    columns: Column<T>[];
    data: T[];
    viewAllLink?: string;
    viewAllText?: string;
    emptyStateText?: string;
    isLoading?: boolean;
    loadingRowCount?: number;
    onRowClick?: (item: T) => void;
    rowKeyField?: string;
    actionButtons?: {
        label: string;
        icon?: React.ReactNode;
        onClick: (item: T) => void;
        color?: 'blue' | 'teal' | 'indigo' | 'red' | 'amber' | 'emerald' | 'gray';
    }[];
}

// Sıralama işlevi
function getSortedData<T>(data: T[], sortKey: string, sortOrder: 'asc' | 'desc'): T[] {
    return [...data].sort((a, b) => {
        const aValue = getNestedValue(a, sortKey);
        const bValue = getNestedValue(b, sortKey);

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (aValue === bValue) return 0;

        if (sortOrder === 'asc') {
            return aValue < bValue ? -1 : 1;
        } else {
            return aValue > bValue ? -1 : 1;
        }
    });
}

// İç içe nesnelerin değerlerine ulaşma işlevi (a.b.c gibi)
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : null
    }, obj);
}

// Buton renkleri
const buttonColors = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
    teal: 'bg-teal-50 text-teal-600 hover:bg-teal-100 border-teal-200',
    indigo: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-200',
    red: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200',
    gray: 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200',
};

function DataTable<T extends Record<string, any>>({
    title,
    columns,
    data,
    viewAllLink,
    viewAllText = 'Tümünü Görüntüle',
    emptyStateText = 'Gösterilecek veri bulunamadı',
    isLoading = false,
    loadingRowCount = 5,
    onRowClick,
    rowKeyField = 'id',
    actionButtons,
}: DataTableProps<T>) {
    const [sortKey, setSortKey] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Sıralama işlemi
    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    // Verileri sırala
    const sortedData = sortKey ? getSortedData(data, sortKey, sortOrder) : data;

    if (isLoading) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm animate-pulse">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <div className="h-5 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        style={{ width: column.width }}
                                    >
                                        <div className="h-3 bg-gray-300 rounded w-16"></div>
                                    </th>
                                ))}
                                {actionButtons && <th className="px-3 sm:px-6 py-3"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Array(loadingRowCount).fill(0).map((_, rowIndex) => (
                                <tr key={rowIndex}>
                                    {columns.map((_, colIndex) => (
                                        <td key={colIndex} className="px-3 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                        </td>
                                    ))}
                                    {actionButtons && (
                                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right">
                                            <div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {viewAllLink && (
                    <div className="p-3 sm:p-4 border-t border-gray-200 text-right">
                        <div className="h-4 bg-gray-200 rounded w-24 ml-auto"></div>
                    </div>
                )}
            </div>
        );
    }

    // Veri yoksa boş durum göster
    if (data.length === 0) {
        return (
            <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                        {title}
                    </h2>
                </div>
                <div className="p-8 sm:p-12 text-center">
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
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                    </svg>
                    <p className="text-gray-600 font-medium text-base mb-2">
                        {emptyStateText}
                    </p>
                    <p className="text-gray-500 text-sm">
                        Daha sonra tekrar kontrol edin veya yeni veri ekleyin.
                    </p>
                </div>
                {viewAllLink && (
                    <div className="p-3 sm:p-4 border-t border-gray-200 text-right">
                        <Link
                            href={viewAllLink}
                            className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            {viewAllText}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                            </svg>
                        </Link>
                    </div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-base sm:text-lg font-medium text-gray-800">
                    {title}
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                                    style={{ width: column.width }}
                                    onClick={() => column.sortable ? handleSort(column.key) : null}
                                >
                                    <div className="flex items-center">
                                        {column.header}
                                        {column.sortable && (
                                            <span className="ml-1">
                                                {sortKey === column.key ? (
                                                    sortOrder === 'asc' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    )
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                            {actionButtons && (
                                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    İşlemler
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {sortedData.map((item, index) => (
                            <tr
                                key={item[rowKeyField] || index}
                                className={`bg-white hover:bg-blue-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick && onRowClick(item)}
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className="px-3 sm:px-6 py-4 whitespace-nowrap text-gray-700">
                                        {column.cell ? column.cell(item, index) : getNestedValue(item, column.key)}
                                    </td>
                                ))}
                                {actionButtons && (
                                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right space-x-1 sm:space-x-2">
                                        {actionButtons.map((button, buttonIndex) => (
                                            <button
                                                key={buttonIndex}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    button.onClick(item);
                                                }}
                                                className={`inline-flex items-center px-2 sm:px-2.5 py-1 text-xs border rounded ${buttonColors[button.color || 'gray']}`}
                                            >
                                                {button.icon && <span className="mr-1">{button.icon}</span>}
                                                {button.label}
                                            </button>
                                        ))}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {viewAllLink && (
                <div className="p-3 sm:p-4 border-t border-gray-200 text-right">
                    <Link
                        href={viewAllLink}
                        className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {viewAllText}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </motion.div>
    );
}

export default DataTable; 