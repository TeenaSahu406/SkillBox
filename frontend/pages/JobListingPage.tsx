import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { JobCard } from '../components/JobCard';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { Briefcase, SlidersHorizontal, Sparkles } from 'lucide-react';

export const JobListingPage: React.FC = () => {
  const { jobs } = useApp();
  const locationState = useLocation();

  // Search filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Sidebar filter states
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [maxSalary, setMaxSalary] = useState(200000);

  // Mobile layout toggler for filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Read initial redirects from Home search bar if any
  useEffect(() => {
    if (locationState.state) {
      const { query, location, category } = locationState.state as { query?: string; location?: string; category?: string };
      if (query) setSearchQuery(query);
      if (location) setSearchLocation(location);
      if (category) {
        setSearchCategory(category);
        setSelectedCategory(category);
      }
    }
  }, [locationState.state]);

  // Handle top search bar execution
  const handleTopSearch = (filters: { query: string; location: string; category: string }) => {
    setSearchQuery(filters.query);
    setSearchLocation(filters.location);
    setSearchCategory(filters.category);
    if (filters.category) {
      setSelectedCategory(filters.category);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchLocation('');
    setSearchCategory('');
    setSelectedTypes([]);
    setSelectedCategory('');
    setSelectedExperience('');
    setMaxSalary(200000);
  };

  // Run dynamic filtering
  const filteredJobs = jobs.filter((job) => {
    // 1. Keyword query (matches title, company, or skills)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = job.skillsRequired.some((skill) => skill.toLowerCase().includes(q));
      if (!matchTitle && !matchCompany && !matchSkills) {
        return false;
      }
    }

    // 2. Location search input
    if (searchLocation) {
      const loc = searchLocation.toLowerCase();
      if (!job.location.toLowerCase().includes(loc)) {
        return false;
      }
    }

    // 3. Category match (combines search bar + sidebar)
    const categoryFilter = selectedCategory || searchCategory;
    if (categoryFilter && job.category !== categoryFilter) {
      return false;
    }

    // 4. Job type checkbox selections
    if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) {
      return false;
    }

    // 5. Experience match
    if (selectedExperience && job.experience !== selectedExperience) {
      return false;
    }

    // 6. Salary calculation parser
    // E.g. "$130,000 - $160,000" or "$90,000" -> extract min salary number
    const salaryMatch = job.salary.match(/\d+/g);
    if (salaryMatch && salaryMatch.length > 0) {
      const minSalary = parseInt(salaryMatch[0].replace(/,/g, '')) * (job.salary.includes('k') || job.salary.includes('K') ? 1000 : 1);
      // Wait, let's look at numbers. If we find 130000, we check if it is above maxSalary
      // If minSalary is 130000 and maxSalary is 110000, exclude it.
      const actualMinVal = parseInt(salaryMatch[0]) > 1000 ? parseInt(salaryMatch[0]) : parseInt(salaryMatch[0]) * 1000;
      if (actualMinVal > maxSalary) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title & Search Header */}
        <div className="text-center space-y-2 mb-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center justify-center gap-2">
            <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span>Discover Opportunities</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Find, apply, and land your next role. Filter by location, salary brackets, and special categories.
          </p>

          <div className="mt-8 max-w-4xl mx-auto">
            <SearchBar
              onSearch={handleTopSearch}
              initialQuery={searchQuery}
              initialLocation={searchLocation}
              initialCategory={searchCategory}
            />
          </div>
        </div>

        {/* Layout content split: Sidebar + Cards */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Button toggler */}
          <div className="lg:hidden flex justify-end">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer shadow-xs"
            >
              <SlidersHorizontal className="h-4.5 w-4.5" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Desktop Filter Panel / Left column */}
          <div className={`lg:w-80 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <FilterPanel
              selectedTypes={selectedTypes}
              setSelectedTypes={setSelectedTypes}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchCategory(cat);
              }}
              selectedExperience={selectedExperience}
              setSelectedExperience={setSelectedExperience}
              maxSalary={maxSalary}
              setMaxSalary={setMaxSalary}
              onReset={handleResetFilters}
            />
          </div>

          {/* Right column: Results listing */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Showing <span className="text-blue-600 dark:text-blue-400">{filteredJobs.length}</span> positions available
              </p>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-100 dark:border-amber-900/40">
                  <SlidersHorizontal className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matching jobs found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try clearing some filters, expanding your location radius, or searching with simpler keywords.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
