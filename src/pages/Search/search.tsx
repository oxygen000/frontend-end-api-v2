import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import { motion } from 'framer-motion';
import { FaThLarge, FaList, FaFilter, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

interface User {
  id: number;
  name: string;
  phone: string;
  email: string;
}

type SortField = 'name' | 'id' | 'none';
type SortDirection = 'asc' | 'desc';

const Search: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'row'>('grid');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState({
    hasEmail: false,
    hasPhone: false,
    idRange: { min: 0, max: 1000 },
    nameStartsWith: ''
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add query parameters for server-side filtering if your API supports it
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filters.idRange.min > 0) params.append('min_id', filters.idRange.min.toString());
      if (filters.idRange.max < 1000) params.append('max_id', filters.idRange.max.toString());
      
      const url = `https://backend-fast-api-ai.fly.dev/api/users${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Ensure data is an array before setting state
      const responseData = Array.isArray(response.data) ? response.data : [];
      setData(responseData);
      setFilteredData(responseData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load users. Please try again later.');
      // Initialize with empty arrays to prevent filter errors
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters.idRange.min, filters.idRange.max]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyFilters = useCallback(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    
    let filtered = data.filter((user) => {
      // Text search filter
      const matchesSearch = 
        user.name.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        (user.id && user.id.toString().includes(term)) ||
        (user.email && user.email.toLowerCase().includes(term));
      
      // Email filter
      const matchesEmailFilter = !filters.hasEmail || !!user.email;
      
      // Phone filter
      const matchesPhoneFilter = !filters.hasPhone || (!!user.phone && user.phone.trim() !== '');
      
      // ID range filter
      const matchesIdRange = 
        user.id >= filters.idRange.min && 
        user.id <= filters.idRange.max;
      
      // Name starts with filter
      const matchesNameStartsWith = !filters.nameStartsWith || 
        user.name.toLowerCase().startsWith(filters.nameStartsWith.toLowerCase());
      
      return matchesSearch && matchesEmailFilter && matchesPhoneFilter && matchesIdRange && matchesNameStartsWith;
    });

    // Apply sorting
    if (sortField !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        
        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'id') {
          comparison = a.id - b.id;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(filtered);
  }, [data, searchTerm, filters, sortField, sortDirection]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      applyFilters();
    }
  }, [data, searchTerm, filters, sortField, sortDirection, applyFilters]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'row' : 'grid');
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFilters(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('Range')) {
      const [, field] = name.split('.');
      setFilters(prev => ({
        ...prev,
        idRange: { ...prev.idRange, [field]: parseInt(value) || 0 }
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="text-white/50" />;
    return sortDirection === 'asc' ? <FaSortUp className="text-white" /> : <FaSortDown className="text-white" />;
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={handleRefresh} 
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Search Users</h2>
        <button 
          onClick={handleRefresh}
          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search by name, phone, email, or ID"
            className="w-full p-3 pl-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <svg 
            className="absolute left-3 top-3.5 h-5 w-5 text-white/70" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={toggleFilters}
            className={`p-3 rounded-lg transition-colors duration-200 ${showFilters ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'}`}
            aria-label="Toggle filters"
          >
            <FaFilter />
          </button>
          <button 
            onClick={toggleViewMode}
            className="p-3 bg-white/20 text-white/70 rounded-lg hover:bg-white/30 transition-colors duration-200"
            aria-label={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <FaList /> : <FaThLarge />}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
        >
          <h3 className="text-white font-medium mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasEmail"
                  name="hasEmail"
                  checked={filters.hasEmail}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="hasEmail" className="text-white">Has Email</label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasPhone"
                  name="hasPhone"
                  checked={filters.hasPhone}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="hasPhone" className="text-white">Has Phone</label>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="nameStartsWith" className="text-white block">Name Starts With</label>
                <input
                  type="text"
                  id="nameStartsWith"
                  name="nameStartsWith"
                  value={filters.nameStartsWith}
                  onChange={handleFilterChange}
                  placeholder="e.g. A"
                  className="w-full p-2 bg-white/20 border border-white/30 rounded text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-white block">ID Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  name="idRange.min"
                  value={filters.idRange.min}
                  onChange={handleFilterChange}
                  placeholder="Min"
                  className="w-full p-2 bg-white/20 border border-white/30 rounded text-white"
                />
                <span className="text-white">-</span>
                <input
                  type="number"
                  name="idRange.max"
                  value={filters.idRange.max}
                  onChange={handleFilterChange}
                  placeholder="Max"
                  className="w-full p-2 bg-white/20 border border-white/30 rounded text-white"
                />
              </div>
              
              <div className="mt-4">
                <label className="text-white block mb-2">Sort By</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSort('name')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${sortField === 'name' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/70'}`}
                  >
                    Name {getSortIcon('name')}
                  </button>
                  <button
                    onClick={() => handleSort('id')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${sortField === 'id' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/70'}`}
                  >
                    ID {getSortIcon('id')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="mb-4 text-white/70">
        Found {filteredData.length} {filteredData.length === 1 ? 'user' : 'users'}
      </div>

      {/* Display filtered data */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.length > 0 ? (
            filteredData.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card user={user} />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-white">
              <svg 
                className="mx-auto h-12 w-12 text-white/50" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-xl">No results found</p>
              <p className="text-white/70">Try a different search term or adjust filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    {user.email && <p className="text-white/70 text-sm">{user.email}</p>}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-white font-medium">{user.phone}</p>
                    <p className="text-white/70 text-sm">ID: {user.id}</p>
                  </div>
                  <button className="ml-4 px-4 py-2 bg-blue-600/70 hover:bg-blue-700 text-white rounded transition-colors duration-300 flex-shrink-0">
                    View
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-white">
              <svg 
                className="mx-auto h-12 w-12 text-white/50" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-xl">No results found</p>
              <p className="text-white/70">Try a different search term or adjust filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
