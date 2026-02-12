import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../utils/apiClient';
import { Sidebar } from '../../components/Sidebar';
import {
  JobCard,
  JobDetailsPanel,
  SearchFilters,
  ApplicationTrackingModal,
  Job,
  Filters,
} from './components';
import './JobsPage.css';
import epIcon from '../../../EPlogosmall.png';

const EMPLOYMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'FULLTIME', label: 'Full-time' },
  { value: 'PARTTIME', label: 'Part-time' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'CONTRACTOR', label: 'Contract' },
];

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'under_3_years_experience', label: 'Entry Level (0-3 years)' },
  { value: 'more_than_3_years_experience', label: 'Mid Level (3+ years)' },
  { value: 'no_experience', label: 'No Experience Required' },
];

const DATE_POSTED_OPTIONS = [
  { value: '', label: 'Any Time' },
  { value: 'today', label: 'Last 24 hours' },
  { value: '3days', label: 'Last 3 days' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
];

const SALARY_OPTIONS = [
  { value: '', label: 'Any Salary' },
  { value: '50000', label: '$50k+' },
  { value: '75000', label: '$75k+' },
  { value: '100000', label: '$100k+' },
  { value: '150000', label: '$150k+' },
  { value: '200000', label: '$200k+' },
];

const JobsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeNav, setActiveNav] = useState('jobs');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Application tracking state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [pendingTrackJob, setPendingTrackJob] = useState<Job | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('appliedJobIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Load saved filters from localStorage on mount
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem('jobFilters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          query: '',
          location: '',
          employmentType: '',
          experienceLevel: '',
          remoteOnly: false,
          datePosted: 'week',
          salaryMin: '',
        };
      }
    }
    return {
      query: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      remoteOnly: false,
      datePosted: 'week',
      salaryMin: '',
    };
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('jobFilters', JSON.stringify(filters));
  }, [filters]);

  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

  // Fetch jobs from JSearch API (RapidAPI)
  const fetchJobs = useCallback(async (searchFilters: Filters, pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // Build the search query
      let searchQuery = searchFilters.query || 'software engineer';
      if (searchFilters.location) {
        searchQuery = `${searchQuery} in ${searchFilters.location}`;
      }

      const params = new URLSearchParams({
        query: searchQuery,
        page: pageNum.toString(),
        num_pages: '1',
      });

      // Add location to query if selected (parsed by backend)
      if (searchFilters.location && searchFilters.location !== 'Remote') {
        params.set('query', `${searchFilters.query || 'software engineer'} in ${searchFilters.location}`);
      }

      if (searchFilters.employmentType) {
        params.append('employment_types', searchFilters.employmentType);
      }

      if (searchFilters.datePosted) {
        params.append('date_posted', searchFilters.datePosted);
      }

      if (searchFilters.remoteOnly) {
        params.append('remote_jobs_only', 'true');
      }

      if (searchFilters.experienceLevel) {
        params.append('job_requirements', searchFilters.experienceLevel);
      }

      console.log('Fetching jobs with params:', params.toString());

      // Using apiRequest for automatic 401 handling
      const response = await apiRequest(`/api/jobs/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Failed to fetch jobs: ${response.status}`);
      }

      const data = await response.json();
      console.log('Jobs API response:', data);

      if (data.data && data.data.length > 0) {
        // Client-side filtering for salary (TheirStack doesn't have salary filter)
        let filteredJobs = data.data;
        console.log('Jobs before filtering:', filteredJobs.length);

        if (searchFilters.salaryMin) {
          const minSalary = parseInt(searchFilters.salaryMin, 10);
          filteredJobs = filteredJobs.filter((job: Job) => {
            // If no salary info, include the job (don't filter it out)
            if (!job.job_min_salary && !job.job_max_salary) return true;
            // Check if job meets minimum salary
            const jobSalary = job.job_max_salary || job.job_min_salary || 0;
            // Handle hourly rates (assume 2080 hours/year)
            const annualSalary = job.job_salary_period === 'HOUR' ? jobSalary * 2080 : jobSalary;
            return annualSalary >= minSalary;
          });
        }

        // Note: Employment type filtering is now done by the backend API
        console.log('Jobs after filtering:', filteredJobs.length);

        setJobs(pageNum === 1 ? filteredJobs : [...jobs, ...filteredJobs]);
        setTotalJobs(filteredJobs.length > 0 ? (filteredJobs.length * 10) : 0); // Estimated total
        if (filteredJobs.length > 0 && !selectedJob) {
          setSelectedJob(filteredJobs[0]);
        }
      } else {
        console.log('No jobs in response. Response:', data);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Unable to fetch jobs. Please check your API key or try again later.');
      // Load demo data for preview
      loadDemoData();
    } finally {
      setLoading(false);
    }
  }, [jobs, selectedJob]);

  const loadDemoData = () => {
    const demoJobs: Job[] = [
      {
        job_id: '1',
        job_title: 'Software Engineer Intern',
        employer_name: 'TransPerfect',
        employer_logo: null,
        job_city: 'New York',
        job_state: 'NY',
        job_country: 'USA',
        job_employment_type: 'INTERN',
        job_posted_at_datetime_utc: '2025-11-30T00:00:00.000Z',
        job_description: 'AI-powered multilingual translation and content management company seeking Software Engineer Intern.',
        job_apply_link: 'https://example.com/apply',
        job_min_salary: null,
        job_max_salary: null,
        job_salary_currency: null,
        job_salary_period: null,
        job_is_remote: false,
        job_required_skills: ['Git', 'REST API', 'C#', 'Database', 'Backend Development'],
        job_required_experience: { no_experience_required: false, required_experience_in_months: 24 },
      },
      {
        job_id: '2',
        job_title: 'Software Engineer Intern',
        employer_name: 'IXL Learning',
        employer_logo: null,
        job_city: 'San Mateo',
        job_state: 'CA',
        job_country: 'USA',
        job_employment_type: 'INTERN',
        job_posted_at_datetime_utc: '2025-11-28T00:00:00.000Z',
        job_description: 'Join our education technology company as a Software Engineer Intern.',
        job_apply_link: 'https://example.com/apply',
        job_min_salary: 29,
        job_max_salary: 46,
        job_salary_currency: 'USD',
        job_salary_period: 'HOUR',
        job_is_remote: false,
        job_required_skills: ['JavaScript', 'Python', 'SQL'],
        job_required_experience: { no_experience_required: true, required_experience_in_months: 0 },
      },
    ];
    setJobs(demoJobs);
    setTotalJobs(demoJobs.length);
    setSelectedJob(demoJobs[0]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Require minimum 3 characters for search query
    const query = filters.query.trim();
    if (query.length > 0 && query.length < 3) {
      setError('Please enter at least 3 characters to search');
      return;
    }
    setPage(1);
    fetchJobs(filters, 1);
  };

  // Debounce timer ref for search
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFilterChange = (key: keyof Filters, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Clear any pending search
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // Auto-search when filter changes (except for query which needs enter/submit)
    if (key !== 'query') {
      // Only auto-search if query is empty or has 3+ characters
      const query = newFilters.query.trim();
      if (query.length === 0 || query.length >= 3) {
        // Debounce: wait 500ms before searching
        searchDebounceRef.current = setTimeout(() => {
          setPage(1);
          fetchJobs(newFilters, 1);
        }, 500);
      }
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      query: '',
      location: '',
      employmentType: '',
      experienceLevel: '',
      remoteOnly: false,
      datePosted: 'week',
      salaryMin: '',
    };
    setFilters(emptyFilters);
    setPage(1);
    fetchJobs(emptyFilters, 1);
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Reveal full job details and open apply link
  const handleApply = async (job: Job) => {
    // Open the job link first
    if (job.job_apply_link && !job.job_apply_link.includes('blurred')) {
      window.open(job.job_apply_link, '_blank');
      // Show the tracking modal after opening the link
      setPendingTrackJob(job);
      setShowApplyModal(true);
      return;
    }

    // Otherwise, reveal full job details first
    try {
      const response = await apiRequest(`/api/jobs/reveal?job_id=${job.job_id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const revealedJob = data.data[0];
          // Update the job in state with revealed data
          setJobs(prev => prev.map(j =>
            j.job_id === job.job_id ? { ...j, ...revealedJob } : j
          ));
          setSelectedJob(prev => prev?.job_id === job.job_id ? { ...prev, ...revealedJob } : prev);
          // Open the apply link
          if (revealedJob.job_apply_link) {
            window.open(revealedJob.job_apply_link, '_blank');
            // Show the tracking modal after opening the link
            setPendingTrackJob({ ...job, ...revealedJob });
            setShowApplyModal(true);
          }
        }
      } else {
        // If reveal fails, try opening current link anyway
        if (job.job_apply_link) {
          window.open(job.job_apply_link, '_blank');
          setPendingTrackJob(job);
          setShowApplyModal(true);
        }
      }
    } catch (error) {
      console.error('Error revealing job:', error);
      // Fallback: try opening current link
      if (job.job_apply_link) {
        window.open(job.job_apply_link, '_blank');
        setPendingTrackJob(job);
        setShowApplyModal(true);
      }
    }
  };

  // Track application in backend
  const handleTrackApplication = async () => {
    if (!pendingTrackJob) return;

    setTrackingLoading(true);
    try {
      const response = await apiRequest('/api/apply/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: pendingTrackJob.job_title,
          companyName: pendingTrackJob.employer_name,
          jobUrl: pendingTrackJob.job_apply_link,
          status: 'applied'
        })
      });

      if (response.ok) {
        // Mark job as applied
        const newAppliedIds = new Set(appliedJobIds);
        newAppliedIds.add(pendingTrackJob.job_id);
        setAppliedJobIds(newAppliedIds);
        localStorage.setItem('appliedJobIds', JSON.stringify([...newAppliedIds]));
      }
    } catch (error) {
      console.error('Error tracking application:', error);
    } finally {
      setTrackingLoading(false);
      setShowApplyModal(false);
      setPendingTrackJob(null);
    }
  };

  // Close modal without tracking
  const handleSkipTracking = () => {
    setShowApplyModal(false);
    setPendingTrackJob(null);
  };

  const formatSalary = (job: Job) => {
    if (!job.job_min_salary && !job.job_max_salary) return 'No salary listed';

    const currency = job.job_salary_currency || 'USD';
    const period = job.job_salary_period || 'YEAR';
    const periodLabel = period === 'HOUR' ? '/hr' : period === 'MONTH' ? '/mo' : '/yr';

    if (job.job_min_salary && job.job_max_salary) {
      return `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}${periodLabel}`;
    }
    return `$${(job.job_min_salary || job.job_max_salary)?.toLocaleString()}${periodLabel}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'FULLTIME': 'Full-time',
      'PARTTIME': 'Part-time',
      'INTERN': 'Internship',
      'CONTRACTOR': 'Contract',
    };
    return labels[type] || type;
  };

  const handleNavClick = (nav: string, path: string) => {
    setActiveNav(nav);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Load jobs on page load
  useEffect(() => {
    // Fetch real jobs from API on initial load
    fetchJobs({ ...filters, query: 'software engineer' }, 1);
  }, []);

  return (
    <div className={`jobs-container ${theme} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        activeNav={activeNav}
        user={user}
        logoIcon={epIcon}
        onNavClick={handleNavClick}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className={`jobs-main ${sidebarCollapsed ? 'expanded' : ''}`}>
        {/* Top Bar */}
        <div className="top-bar"></div>

        {/* Search and Filters */}
        <SearchFilters
          filters={filters}
          employmentTypes={EMPLOYMENT_TYPES}
          salaryOptions={SALARY_OPTIONS}
          datePostedOptions={DATE_POSTED_OPTIONS}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onClearFilters={clearFilters}
        />

        {/* Results Section */}
        <div className="jobs-content">
          <div className="jobs-layout">
            {/* Job Listings */}
            <div className="jobs-list">
              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Searching for jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                  </div>
                  <h3>No jobs found</h3>
                  <p>Try adjusting your search or filters to find more opportunities</p>
                </div>
              ) : (
                <AnimatePresence>
                  {jobs.map((job, index) => (
                    <JobCard
                      key={job.job_id}
                      job={job}
                      isSelected={selectedJob?.job_id === job.job_id}
                      isSaved={savedJobs.has(job.job_id)}
                      index={index}
                      onSelect={setSelectedJob}
                      onToggleSave={toggleSaveJob}
                      formatDate={formatDate}
                      formatSalary={formatSalary}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Job Details Panel */}
            {selectedJob && (
              <JobDetailsPanel
                job={selectedJob}
                isSaved={savedJobs.has(selectedJob.job_id)}
                isApplied={appliedJobIds.has(selectedJob.job_id)}
                onSave={toggleSaveJob}
                onApply={handleApply}
                formatSalary={formatSalary}
                formatDate={formatDate}
                getEmploymentTypeLabel={getEmploymentTypeLabel}
              />
            )}
          </div>
        </div>
      </main>

      {/* Application Tracking Modal */}
      <ApplicationTrackingModal
        job={pendingTrackJob}
        isOpen={showApplyModal}
        isLoading={trackingLoading}
        onTrack={handleTrackApplication}
        onSkip={handleSkipTracking}
      />
    </div>
  );
};

export default JobsPage;
