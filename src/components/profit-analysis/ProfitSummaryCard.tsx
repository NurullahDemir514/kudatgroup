import React from 'react';

type CardVariant = 'blue' | 'amber' | 'cyan' | 'emerald' | 'rose';

interface ProfitSummaryCardProps {
    title: string;
    value: string | number;
    variant?: CardVariant;
    icon: React.ReactNode;
    isValueColored?: boolean;
}

const getVariantClasses = (variant: CardVariant) => {
    switch (variant) {
        case 'blue':
            return {
                background: 'bg-blue-900/20',
                text: 'text-blue-400',
                border: 'border-blue-800/40'
            };
        case 'amber':
            return {
                background: 'bg-amber-900/20',
                text: 'text-amber-400',
                border: 'border-amber-800/40'
            };
        case 'cyan':
            return {
                background: 'bg-cyan-900/20',
                text: 'text-cyan-400',
                border: 'border-cyan-800/40'
            };
        case 'emerald':
            return {
                background: 'bg-emerald-900/20',
                text: 'text-emerald-400',
                border: 'border-emerald-800/40'
            };
        case 'rose':
            return {
                background: 'bg-rose-900/20',
                text: 'text-rose-400',
                border: 'border-rose-800/40'
            };
        default:
            return {
                background: 'bg-blue-900/20',
                text: 'text-blue-400',
                border: 'border-blue-800/40'
            };
    }
};

export default function ProfitSummaryCard({
    title,
    value,
    variant = 'blue',
    icon,
    isValueColored = false
}: ProfitSummaryCardProps) {
    const variantClasses = getVariantClasses(variant);

    return (
        <div className="rounded-xl bg-white shadow-sm p-4 border border-gray-200">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${variantClasses.background} ${variantClasses.text} border ${variantClasses.border} mr-4`}>
                    {icon}
                </div>
                <div>
                    <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</h3>
                    <p className={`text-2xl font-bold ${isValueColored ? variantClasses.text : 'text-gray-800'}`}>
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
} 