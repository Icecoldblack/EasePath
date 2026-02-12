import React from 'react';
import './SearchFilters.css';

export interface Filters {
    query: string;
    location: string;
    employmentType: string;
    experienceLevel: string;
    remoteOnly: boolean;
    datePosted: string;
    salaryMin: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface SearchFiltersProps {
    filters: Filters;
    employmentTypes: FilterOption[];
    salaryOptions: FilterOption[];
    datePostedOptions: FilterOption[];
    onFilterChange: (key: keyof Filters, value: string | boolean) => void;
    onSearch: (e: React.FormEvent) => void;
    onClearFilters: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
    filters,
    employmentTypes,
    salaryOptions,
    datePostedOptions,
    onFilterChange,
    onSearch,
    onClearFilters,
}) => {
    const hasActiveFilters = filters.location || filters.employmentType || filters.salaryMin || filters.remoteOnly || filters.datePosted;

    return (
        <div className="jobs-header">
            <div className="header-top">
                <div>
                    <h1 className="header-title">Find Your Dream Job</h1>
                    <p className="header-subtitle">Browse through thousands of opportunities</p>
                </div>
                <button
                    className={`recency-toggle ${filters.datePosted === 'today' ? 'active' : ''}`}
                    onClick={() => onFilterChange('datePosted', filters.datePosted === 'today' ? 'week' : 'today')}
                    title={filters.datePosted === 'today' ? 'Showing jobs from today — click to show this week' : 'Showing jobs from this week — click to show today only'}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="recency-toggle-label">{filters.datePosted === 'today' ? "Today's Jobs" : "This Week"}</span>
                    <span className={`recency-toggle-indicator ${filters.datePosted === 'today' ? 'on' : ''}`}>
                        <span className="recency-toggle-dot" />
                    </span>
                </button>
            </div>

            {/* Search Bar */}
            <form className="search-form" onSubmit={onSearch}>
                <div className="search-bar">
                    <div className="search-input-group">
                        <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search job title, company..."
                            value={filters.query}
                            onChange={(e) => onFilterChange('query', e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <select
                        value={filters.employmentType}
                        onChange={(e) => onFilterChange('employmentType', e.target.value)}
                        className="filter-dropdown"
                    >
                        {employmentTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    <select
                        value={filters.location}
                        onChange={(e) => onFilterChange('location', e.target.value)}
                        className="filter-dropdown"
                    >
                        <option value="">All Locations</option>
                        <option value="San Francisco">San Francisco</option>
                        <option value="New York">New York</option>
                        <option value="Remote">Remote</option>
                        <option value="Austin">Austin</option>
                    </select>
                    <select
                        value={filters.salaryMin}
                        onChange={(e) => onFilterChange('salaryMin', e.target.value)}
                        className="filter-dropdown"
                    >
                        {salaryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </form>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
                <div className="filter-chips-bar">
                    {filters.location && (
                        <div className="filter-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Location: {filters.location}
                            <button onClick={() => onFilterChange('location', '')} className="chip-remove">×</button>
                        </div>
                    )}
                    {filters.employmentType && (
                        <div className="filter-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="7" width="20" height="14" rx="2" />
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                            {employmentTypes.find(t => t.value === filters.employmentType)?.label || filters.employmentType}
                            <button onClick={() => onFilterChange('employmentType', '')} className="chip-remove">×</button>
                        </div>
                    )}
                    {filters.salaryMin && (
                        <div className="filter-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="1" x2="12" y2="23" />
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                            {salaryOptions.find(s => s.value === filters.salaryMin)?.label || filters.salaryMin}
                            <button onClick={() => onFilterChange('salaryMin', '')} className="chip-remove">×</button>
                        </div>
                    )}
                    {filters.datePosted && (
                        <div className="filter-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {datePostedOptions.find(d => d.value === filters.datePosted)?.label || filters.datePosted}
                            <button onClick={() => onFilterChange('datePosted', '')} className="chip-remove">×</button>
                        </div>
                    )}
                    {filters.remoteOnly && (
                        <div className="filter-chip">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Remote Only
                            <button onClick={() => onFilterChange('remoteOnly', false)} className="chip-remove">×</button>
                        </div>
                    )}
                    <button onClick={onClearFilters} className="clear-all-btn">Clear All Filters</button>
                </div>
            )}
        </div>
    );
};

export default SearchFilters;
