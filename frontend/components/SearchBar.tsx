import React, { useState } from 'react';
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react';
import { CATEGORIES } from '../data/dummyData';

interface SearchBarProps {
  onSearch: (filters: { query: string; location: string; category: string }) => void;
  initialQuery?: string;
  initialLocation?: string;
  initialCategory?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = '',
  initialLocation = '',
  initialCategory = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [category, setCategory] = useState(initialCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ query, location, category });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3 shadow-md md:shadow-lg flex flex-col md:flex-row gap-2 max-w-4xl mx-auto items-stretch"
    >
      {/* Query Search */}
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800">
        <Search className="h-5 w-5 text-blue-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Job title, keywords, or company..."
          className="w-full text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-hidden"
        />
      </div>

      {/* Location Search */}
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800">
        <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or 'Remote'..."
          className="w-full text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-hidden"
        />
      </div>

      {/* Category Select */}
      <div className="flex-1 flex items-center gap-2.5 px-3 py-2 relative">
        <Briefcase className="h-5 w-5 text-blue-500 shrink-0" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-sm text-gray-700 dark:text-gray-200 bg-transparent focus:outline-hidden appearance-none cursor-pointer pr-6"
        >
          <option value="" className="dark:bg-slate-900 dark:text-gray-200">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="dark:bg-slate-900 dark:text-gray-200">
              {cat}
            </option>
          ))}
        </select>
        <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 pointer-events-none" />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-7 py-3 rounded-xl transition-all shadow-xs md:shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5"
      >
        <Search className="h-4 w-4" />
        <span>Search Jobs</span>
      </button>
    </form>
  );
};
