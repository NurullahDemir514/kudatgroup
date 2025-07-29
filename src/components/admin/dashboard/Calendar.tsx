import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Event {
    id: string;
    title: string;
    date: string;
    type: 'order' | 'meeting' | 'task' | 'delivery';
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    link?: string;
}

interface CalendarProps {
    events?: Event[];
    month?: number;
    year?: number;
    isLoading?: boolean;
}

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cts', 'Paz'];

const MONTHS = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const typeColors = {
    order: {
        light: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-500',
    },
    meeting: {
        light: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        dot: 'bg-purple-500',
    },
    task: {
        light: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
    },
    delivery: {
        light: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-500',
    },
};

export default function Calendar({
    events = [
        {
            id: 'e1',
            title: 'Sipariş #12456',
            date: '2023-05-10',
            type: 'order',
            status: 'pending',
            link: '/admin/orders/12456',
        },
        {
            id: 'e2',
            title: 'Tedarikçi Görüşmesi',
            date: '2023-05-15',
            type: 'meeting',
            status: 'confirmed',
        },
        {
            id: 'e3',
            title: 'Toplu Teslimat',
            date: '2023-05-18',
            type: 'delivery',
            status: 'pending',
        },
        {
            id: 'e4',
            title: 'Envanter Sayımı',
            date: '2023-05-22',
            type: 'task',
            status: 'pending',
        },
        {
            id: 'e5',
            title: 'Sipariş #12789',
            date: '2023-05-25',
            type: 'order',
            status: 'confirmed',
            link: '/admin/orders/12789',
        },
    ],
    month = new Date().getMonth(),
    year = new Date().getFullYear(),
    isLoading = false,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(month);
    const [currentYear, setCurrentYear] = useState(year);

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const getCalendarDays = () => {
        // İlk gün (1) o ayın hangi gününe denk geliyor? (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        // Pazar (0) ise, ilk gün Pazartesi (1) olarak ayarla (TR takvimi)
        const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

        // Ayın son günü
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Önceki ayın son günleri için gereken sayı
        const daysFromPrevMonth = adjustedFirstDay;

        // Önceki ayın son günü
        const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

        const days = [];

        // Önceki ayın son günlerini ekle
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            days.push({
                date: new Date(currentYear, currentMonth - 1, lastDayOfPrevMonth - i),
                isCurrentMonth: false,
            });
        }

        // Mevcut ayın günlerini ekle
        for (let i = 1; i <= lastDayOfMonth; i++) {
            days.push({
                date: new Date(currentYear, currentMonth, i),
                isCurrentMonth: true,
            });
        }

        // Sonraki aydan gerekli günleri ekle (42 güne tamamla - 6 hafta)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(currentYear, currentMonth + 1, i),
                isCurrentMonth: false,
            });
        }

        return days;
    };

    const days = getCalendarDays();

    const getEventsForDate = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        return events.filter(event => event.date === dateString);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="animate-pulse flex justify-between items-center mb-6">
                    <div className="h-6 w-40 bg-gray-200 rounded"></div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-200">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-8 bg-gray-100 p-2"></div>
                    ))}
                    {[...Array(35)].map((_, i) => (
                        <div key={i + 7} className="h-24 bg-gray-100 p-2">
                            <div className="h-4 w-4 bg-gray-200 rounded mb-2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">
                    {MONTHS[currentMonth]} {currentYear}
                </h3>
                <div className="flex space-x-2">
                    <motion.button
                        onClick={goToPreviousMonth}
                        className="p-1.5 rounded-md hover:bg-gray-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </motion.button>
                    <motion.button
                        onClick={goToNextMonth}
                        className="p-1.5 rounded-md hover:bg-gray-100"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {/* Hafta başlıkları */}
                {DAYS.map((day, index) => (
                    <div key={index} className="py-2 text-center bg-gray-100 text-xs font-medium text-gray-700">
                        {day}
                    </div>
                ))}

                {/* Takvim günleri */}
                {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day.date);
                    const isToday = day.date.toDateString() === new Date().toDateString();

                    return (
                        <div
                            key={index}
                            className={`min-h-[80px] p-1 ${day.isCurrentMonth
                                    ? isToday
                                        ? 'bg-blue-50'
                                        : 'bg-white'
                                    : 'bg-gray-50 text-gray-400'
                                }`}
                        >
                            <div className={`flex items-center justify-center h-6 w-6 ${isToday
                                    ? 'bg-blue-600 text-white rounded-full'
                                    : 'text-gray-700'
                                } text-sm font-medium ${!day.isCurrentMonth && 'text-gray-400'}`}>
                                {day.date.getDate()}
                            </div>

                            <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                                {dayEvents.map((event) => (
                                    <motion.div
                                        key={event.id}
                                        className={`px-1.5 py-0.5 text-xs rounded ${typeColors[event.type].light} ${typeColors[event.type].border} ${typeColors[event.type].text}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {event.link ? (
                                            <Link href={event.link} className="font-medium truncate block">
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${typeColors[event.type].dot} mr-1`}></span>
                                                {event.title.length > 14 ? event.title.substring(0, 12) + '...' : event.title}
                                            </Link>
                                        ) : (
                                            <div className="font-medium truncate">
                                                <span className={`inline-block w-1.5 h-1.5 rounded-full ${typeColors[event.type].dot} mr-1`}></span>
                                                {event.title.length > 14 ? event.title.substring(0, 12) + '...' : event.title}
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
                    <span className="text-gray-600">Sipariş</span>
                </div>
                <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
                    <span className="text-gray-600">Toplantı</span>
                </div>
                <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                    <span className="text-gray-600">Görev</span>
                </div>
                <div className="flex items-center text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                    <span className="text-gray-600">Teslimat</span>
                </div>
            </div>
        </motion.div>
    );
} 