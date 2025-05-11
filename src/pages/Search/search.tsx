import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from '../../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaThLarge,
  FaList,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBuilding,
  FaUserTag,
} from 'react-icons/fa';

const API_URL = 'https://backend-fast-api-ai.fly.dev/api/users';

interface User {
  id: string;
  name: string;
  employee_id?: string;
  department?: string;
  role?: string;
  image_path?: string;
  image_url?: string;
  created_at?: string;
  form_type?: string;
  category?: string;
  phone_number?: string;
  national_id?: string;
  address?: string;
  dob?: string;
}

type SortField = 'name' | 'created_at' | 'none';
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
    hasPhone: false,
    hasNationalId: false,
    category: '',
    formType: '',
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(API_URL);

      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
        setFilteredData(response.data);
      } else if (
        response.data &&
        response.data.users &&
        Array.isArray(response.data.users)
      ) {
        setData(response.data.users);
        setFilteredData(response.data.users);
      } else {
        setError('Invalid response format from server');
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load users. Please try again later.');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
        (user.phone_number && user.phone_number.toLowerCase().includes(term)) ||
        (user.national_id && user.national_id.toLowerCase().includes(term)) ||
        (user.employee_id && user.employee_id.toLowerCase().includes(term)) ||
        (user.address && user.address.toLowerCase().includes(term)) ||
        (user.department && user.department.toLowerCase().includes(term));

      // Phone filter
      const matchesPhoneFilter =
        !filters.hasPhone ||
        (!!user.phone_number && user.phone_number.trim() !== '');

      // National ID filter
      const matchesNationalIdFilter =
        !filters.hasNationalId ||
        (!!user.national_id && user.national_id.trim() !== '') ||
        (!!user.employee_id && user.employee_id.trim() !== '');

      // Category filter
      const matchesCategory =
        !filters.category || user.category === filters.category;

      // Form type filter
      const matchesFormType =
        !filters.formType || user.form_type === filters.formType;

      return (
        matchesSearch &&
        matchesPhoneFilter &&
        matchesNationalIdFilter &&
        matchesCategory &&
        matchesFormType
      );
    });

    // Apply sorting
    if (sortField !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        if (sortField === 'name') {
          comparison = a.name.localeCompare(b.name);
        } else if (sortField === 'created_at') {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          comparison = dateA - dateB;
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

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFilters((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
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
    return sortDirection === 'asc' ? (
      <FaSortUp className="text-white" />
    ) : (
      <FaSortDown className="text-white" />
    );
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleUserClick = async (user: User) => {
    try {
      const response = await axios.get(`${API_URL}/${user.id}`);
      if (response.data) {
        setSelectedUser(response.data);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Failed to load user details');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
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
            placeholder="Search by name, ID, phone, or address"
            className="w-full p-3 pl-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-white/70"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
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
            aria-label={
              viewMode === 'grid'
                ? 'Switch to list view'
                : 'Switch to grid view'
            }
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
                  id="hasPhone"
                  name="hasPhone"
                  checked={filters.hasPhone}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="hasPhone" className="text-white">
                  Has Phone
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasNationalId"
                  name="hasNationalId"
                  checked={filters.hasNationalId}
                  onChange={handleFilterChange}
                  className="mr-2 h-4 w-4"
                />
                <label htmlFor="hasNationalId" className="text-white">
                  Has National ID
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-white block">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded text-white"
                >
                  <option value="">All Categories</option>
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-2">
                <label htmlFor="formType" className="text-white block">
                  Form Type
                </label>
                <select
                  id="formType"
                  name="formType"
                  value={filters.formType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded text-white"
                >
                  <option value="">All Form Types</option>
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="disabled">Disabled</option>
                </select>
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
                    onClick={() => handleSort('created_at')}
                    className={`flex items-center gap-1 px-3 py-1 rounded ${sortField === 'created_at' ? 'bg-blue-600 text-white' : 'bg-white/20 text-white/70'}`}
                  >
                    Date {getSortIcon('created_at')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="mb-4 text-white/70">
        Found {filteredData.length}{' '}
        {filteredData.length === 1 ? 'user' : 'users'}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-xl">No results found</p>
              <p className="text-white/70">
                Try a different search term or adjust filters
              </p>
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
                onClick={() => handleUserClick(user)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white">
                      {user.name}
                    </h3>
                    {user.category && (
                      <p className="text-white/70 text-sm">{user.category}</p>
                    )}
                    {user.department && (
                      <p className="text-white/70 text-sm">{user.department}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-white font-medium">
                      {user.phone_number || 'N/A'}
                    </p>
                    <p className="text-white/70 text-sm">
                      ID: {user.national_id || user.employee_id || 'N/A'}
                    </p>
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-4 text-xl">No results found</p>
              <p className="text-white/70">
                Try a different search term or adjust filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/20 backdrop-blur-md rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  User Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/30">
                    {selectedUser.image_url || selectedUser.image_path ? (
                      <img
                        src={selectedUser.image_url || selectedUser.image_path}
                        alt={selectedUser.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-4xl font-bold">
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {selectedUser.name}
                    </h3>
                    {selectedUser.category && (
                      <p className="text-white/70">{selectedUser.category}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.phone_number && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-white/70" />
                        <span className="text-white">
                          {selectedUser.phone_number}
                        </span>
                      </div>
                    )}

                    {(selectedUser.national_id || selectedUser.employee_id) && (
                      <div className="flex items-center gap-2">
                        <FaIdCard className="text-white/70" />
                        <span className="text-white">
                          {selectedUser.national_id || selectedUser.employee_id}
                        </span>
                      </div>
                    )}

                    {selectedUser.address && (
                      <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-white/70" />
                        <span className="text-white">
                          {selectedUser.address}
                        </span>
                      </div>
                    )}

                    {selectedUser.dob && (
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-white/70" />
                        <span className="text-white">{selectedUser.dob}</span>
                      </div>
                    )}

                    {selectedUser.department && (
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-white/70" />
                        <span className="text-white">
                          {selectedUser.department}
                        </span>
                      </div>
                    )}

                    {selectedUser.form_type && (
                      <div className="flex items-center gap-2">
                        <FaUserTag className="text-white/70" />
                        <span className="text-white">
                          {selectedUser.form_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
