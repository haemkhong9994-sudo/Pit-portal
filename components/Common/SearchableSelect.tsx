
import React, { useState, useRef, useEffect } from 'react';
import { ICONS } from '../../constants';

interface SearchableSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Tìm kiếm...',
    error,
    disabled
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter out the "--- Chọn ---" placeholder if it exists in options
    const cleanOptions = options.filter(opt => !opt.startsWith('---'));

    const filteredOptions = cleanOptions.filter(opt =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: string) => {
        onChange(option);
        setIsOpen(false);
        setSearchTerm('');
    };

    const displayValue = value && !value.startsWith('---') ? value : '';

    return (
        <div className="flex flex-col relative" ref={containerRef}>
            <label className={`text-[10px] font-bold uppercase tracking-widest min-h-[44px] flex items-end pb-1.5 ${error ? 'text-rose-500' : 'text-slate-400'}`}>
                {label}
            </label>

            <div
                className={`relative w-full px-4 py-2.5 bg-white border rounded-xl focus-within:ring-2 transition-all text-sm font-medium cursor-pointer flex items-center justify-between ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''
                    } ${error ? 'border-rose-300 focus-within:ring-rose-500 focus-within:border-rose-500' : 'border-slate-200 focus-within:ring-indigo-500 focus-within:border-indigo-500'
                    }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={displayValue ? 'text-slate-900' : 'text-slate-400 italic font-normal'}>
                    {displayValue || (options[0]?.startsWith('---') ? options[0].replace(/---/g, '').trim() : placeholder)}
                </span>
                <div className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke={error ? "#f43f5e" : "#64748b"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {isOpen && (
                <div className="absolute top-[100%] left-0 right-0 z-50 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500 transition-all"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-2 text-sm cursor-pointer transition-colors ${value === option ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option);
                                    }}
                                >
                                    {option}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-slate-400 italic text-center">
                                Không tìm thấy kết quả
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
