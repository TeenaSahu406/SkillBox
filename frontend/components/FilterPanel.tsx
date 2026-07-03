import React from 'react';
import { Filter, RotateCcw, X } from 'lucide-react';
import { CATEGORIES } from '../data/dummyData';

interface FilterPanelProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedExperience: string;
  setSelectedExperience: (exp: string) => void;
  maxSalary: number;
  setMaxSalary: (salary: number) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedTypes,
  setSelectedTypes,
  selectedCategory,
  setSelectedCategory,
  selectedExperience,
  setSelectedExperience,
  maxSalary,
  setMaxSalary,
  onReset
}) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship'];
  const experienceLevels = ['All Experience', '1+ years', '3+ years', '5+ years'];

  const handleTypeChange = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs sticky top-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-50 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs flex items-center gap-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Job Type Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Job Type</h4>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <label key={type} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeChange(type)}
                className="rounded-sm border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Category</h4>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25"
        >
          <option value="" className="dark:bg-slate-900 dark:text-gray-200">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="dark:bg-slate-900 dark:text-gray-200">
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Experience Level */}
      <div>
        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Experience Level</h4>
        <div className="space-y-2">
          {experienceLevels.map((exp) => (
            <label key={exp} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-white select-none">
              <input
                type="radio"
                name="experience"
                checked={
                  exp === 'All Experience' 
                    ? selectedExperience === '' 
                    : selectedExperience === exp
                }
                onChange={() => setSelectedExperience(exp === 'All Experience' ? '' : exp)}
                className="border-gray-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>{exp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Max Salary expectation</h4>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
            ${maxSalary.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="50000"
          max="200000"
          step="5000"
          value={maxSalary}
          onChange={(e) => setMaxSalary(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-gray-500 mt-1">
          <span>$50,000</span>
          <span>$200,000+</span>
        </div>
      </div>
    </div>
  );
};
