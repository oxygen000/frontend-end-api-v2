import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { Link } from 'react-router-dom';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { toast } from 'react-hot-toast';

const API_URL = 'https://backend-fast-api-ai.fly.dev/api/users';

// Define a smaller initial page size to improve first render time
const PAGE_SIZE = 20;

interface User {
  id: string;
  name: string;
  nickname: string;
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

// Create an interface for the API response user data
interface ApiUser {
  id: string;
  name: string;
  nickname?: string;
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
  // Add specific optional fields that might be in the API response
  occupation?: string;
  has_criminal_record?: boolean | string;
  guardian_name?: string;
  disability_type?: string;
  // Use unknown instead of any for safety
  [key: string]: unknown;
}

// Add a custom debounce hook to improve search performance
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Search: React.FC = () => {
  const { t } = useTranslationWithFallback();
  const [data, setData] = useState<ApiUser[]>([]);
  const [filteredData, setFilteredData] = useState<ApiUser[]>([]);
  const [displayedData, setDisplayedData] = useState<ApiUser[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
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
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchData = useCallback(async (retryCount = 0, maxRetries = 3) => {
    try {
      setLoading(true);
      setError(null);

      // Use a cached response if available
      const cachedData = sessionStorage.getItem('searchData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
        setFilteredData(parsedData);
        setLoading(false);

        // Load more data in the background
        fetchFromAPI(retryCount, maxRetries).catch(console.error);
        return;
      }

      await fetchFromAPI(retryCount, maxRetries);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load users. Please try again later.');
      setData([]);
      setFilteredData([]);
      setLoading(false);
    }
  }, []);

  // Separate function to fetch from API
  const fetchFromAPI = async (retryCount = 0, maxRetries = 3) => {
    try {
      const response = await axios.get(API_URL);

      if (response.data && Array.isArray(response.data)) {
        setData(response.data);
        setFilteredData(response.data);
        // Cache the response for future use
        sessionStorage.setItem('searchData', JSON.stringify(response.data));
      } else if (
        response.data &&
        response.data.users &&
        Array.isArray(response.data.users)
      ) {
        setData(response.data.users);
        setFilteredData(response.data.users);
        // Cache the response for future use
        sessionStorage.setItem(
          'searchData',
          JSON.stringify(response.data.users)
        );
      } else {
        setError('Invalid response format from server');
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching from API:', error);

      // If the all users endpoint fails, try the regular endpoint as fallback
      if (retryCount === 0) {
        try {
          const fallbackResponse = await axios.get(API_URL);
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            setData(fallbackResponse.data);
            setFilteredData(fallbackResponse.data);
            // Cache the response for future use
            sessionStorage.setItem(
              'searchData',
              JSON.stringify(fallbackResponse.data)
            );
            setLoading(false);
            return;
          } else if (
            fallbackResponse.data &&
            fallbackResponse.data.users &&
            Array.isArray(fallbackResponse.data.users)
          ) {
            setData(fallbackResponse.data.users);
            setFilteredData(fallbackResponse.data.users);
            // Cache the response for future use
            sessionStorage.setItem(
              'searchData',
              JSON.stringify(fallbackResponse.data.users)
            );
            setLoading(false);
            return;
          }
        } catch (fallbackError) {
          console.error('Fallback endpoint also failed:', fallbackError);
        }
      }

      // Implement retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying fetchData (${retryCount + 1}/${maxRetries})...`);
        setTimeout(
          () => {
            fetchFromAPI(retryCount + 1, maxRetries);
          },
          1000 * (retryCount + 1)
        ); // Exponential backoff
        return;
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Use useMemo to create getImageUrl function to prevent recreating on every render
  const getImageUrl = useMemo(() => {
    return (imagePath: string | null | undefined, userName: string) => {
      if (!imagePath) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
      }

      // Check if image_path already contains the full URL
      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // If image_path doesn't contain 'uploads/' prefix, add it
      const formattedPath = imagePath.includes('uploads/')
        ? imagePath
        : `uploads/${imagePath}`;

      return `https://backend-fast-api-ai.fly.dev/${formattedPath.replace(/^\//, '')}`;
    };
  }, []);

  useEffect(() => {
    fetchData(0, 3);
  }, [fetchData]);

  // Optimized filter function
  const applyFilters = useCallback(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const term = debouncedSearchTerm.toLowerCase();

    // Use optimized filtering with early returns for better performance
    const filtered = data.filter((user) => {
      // Quick check for empty term to skip unnecessary processing
      if (term === '') {
        // Only check filters if search term is empty
        return (
          (!filters.hasPhone ||
            (!!user.phone_number && user.phone_number.trim() !== '')) &&
          (!filters.hasNationalId ||
            (!!user.national_id && user.national_id.trim() !== '') ||
            (!!user.employee_id && user.employee_id.trim() !== '')) &&
          (!filters.category || user.category === filters.category) &&
          (!filters.formType || user.form_type === filters.formType)
        );
      }

      // Searchable fields in a single array for cleaner code
      const searchableFields = [
        user.name,
        user.phone_number,
        user.national_id,
        user.employee_id,
        user.address,
        user.department,
        user.nickname,
        user.form_type,
      ];

      // Check if any searchable field contains the search term
      const matchesSearch = searchableFields.some(
        (field) => field && field.toLowerCase().includes(term)
      );

      if (!matchesSearch) return false;

      // If search term matches, check filters
      return (
        (!filters.hasPhone ||
          (!!user.phone_number && user.phone_number.trim() !== '')) &&
        (!filters.hasNationalId ||
          (!!user.national_id && user.national_id.trim() !== '') ||
          (!!user.employee_id && user.employee_id.trim() !== '')) &&
        (!filters.category || user.category === filters.category) &&
        (!filters.formType || user.form_type === filters.formType)
      );
    });

    // Apply sorting - only if needed
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sortField) {
          case 'name': {
            comparison = a.name.localeCompare(b.name);
            break;
          }
          case 'created_at': {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            comparison = dateA - dateB;
            break;
          }
          default:
            comparison = 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(filtered);
    // Reset pagination when filters change
    setPage(1);
    setHasMore(filtered.length > PAGE_SIZE);
    setDisplayedData(filtered.slice(0, PAGE_SIZE));
  }, [data, debouncedSearchTerm, filters, sortField, sortDirection]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      applyFilters();
    }
  }, [
    data,
    debouncedSearchTerm,
    filters,
    sortField,
    sortDirection,
    applyFilters,
  ]);

  // Handle pagination
  const loadMoreItems = useCallback(() => {
    if (!hasMore) return;

    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * PAGE_SIZE;
    const endIndex = nextPage * PAGE_SIZE;

    if (startIndex >= filteredData.length) {
      setHasMore(false);
      return;
    }

    const nextItems = filteredData.slice(startIndex, endIndex);
    setDisplayedData((prev) => [...prev, ...nextItems]);
    setPage(nextPage);
    setHasMore(endIndex < filteredData.length);
  }, [page, filteredData, hasMore]);

  useEffect(() => {
    // Implement intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreItems();
        }
      },
      { threshold: 0.5 }
    );

    const loadMoreTrigger = document.getElementById('load-more-trigger');
    if (loadMoreTrigger) {
      observer.observe(loadMoreTrigger);
    }

    return () => {
      if (loadMoreTrigger) {
        observer.unobserve(loadMoreTrigger);
      }
    };
  }, [hasMore, loading, loadMoreItems]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleViewMode = () => {
    setViewMode((current) => (current === 'grid' ? 'row' : 'grid'));
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
    // Set refreshing status
    setRefreshing(true);

    // Clear the cached data to ensure we get fresh data
    sessionStorage.removeItem('searchData');

    // Reset pagination
    setPage(1);
    setHasMore(true);

    // Show a short toast message
    toast?.success(t('search.refreshing', 'Refreshing data...'));

    // Fetch fresh data
    fetchData(0, 3).finally(() => {
      // Clear refreshing status when done (regardless of success/failure)
      setTimeout(() => {
        setRefreshing(false);
      }, 500); // Small delay for better UX
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const FORM_TYPES = [
    { value: '', label: 'All Form Types' },
    { value: 'child', label: 'Child' },
    { value: 'disabled', label: 'Disabled' },
    { value: 'employee', label: 'Employee' },
    { value: 'student', label: 'Student' },
    { value: 'visitor', label: 'Visitor' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];

  const NoResultsFound = () => (
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
  );

  // Update the adaptUser function to use ApiUser instead of any
  const adaptUser = (user: ApiUser): User => {
    return {
      ...user,
      nickname: user.nickname || '',
    };
  };

  // Replace the existing animation variants with new, more sophisticated ones
  const gridItemVariants = {
    hidden: ({ isGrid }: { isGrid: boolean; index?: number }) => ({
      opacity: 0,
      rotateX: isGrid ? -10 : 0,
      translateY: isGrid ? -50 : 0,
      translateX: isGrid ? 0 : -50,
      filter: 'blur(10px)',
      scale: 0.8,
    }),
    visible: {
      opacity: 1,
      rotateX: 0,
      translateY: 0,
      translateX: 0,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 200,
        duration: 0.4,
      },
    },
    exit: ({ isGrid }: { isGrid: boolean; index?: number }) => ({
      opacity: 0,
      rotateX: isGrid ? 10 : 0,
      translateY: isGrid ? 50 : 0,
      translateX: isGrid ? 0 : 50,
      filter: 'blur(10px)',
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    }),
    hover: {
      scale: 1.05,
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      transition: {
        duration: 0.2,
      },
    },
    tap: {
      scale: 0.98,
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.1,
      },
    },
  };

  // New container variants with more elaborate animations
  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.1,
        when: 'beforeChildren',
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      filter: 'blur(10px)',
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: 'afterChildren',
        ease: 'easeIn',
        duration: 0.4,
      },
    },
  };

  // New modal animation variants
  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      rotateY: -10,
      filter: 'blur(10px)',
    },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      rotateY: 10,
      filter: 'blur(10px)',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  // New backdrop animation
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  };

  if (loading && filteredData.length === 0) {
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
            disabled={refreshing}
            className={`mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded flex items-center mx-auto ${refreshing ? 'opacity-75' : ''}`}
          >
            {refreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {t('search.retrying', 'Retrying...')}
              </>
            ) : (
              t('common.retry', 'Retry')
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t('search.title', 'Search')}
        </h1>
        <p className="text-white/70">
          {t('search.subtitle', 'Search and filter registered users')}
        </p>
      </div>

    

      {/* Search & Controls */}
      <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-white/20 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {t('search.title', 'All Registered Users')}
            </h2>
            <p className="text-white/70 mt-1">
              {t(
                'search.subtitle',
                'View and search through all registered profiles in the system'
              )}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${refreshing ? 'opacity-75' : ''}`}
          >
            {refreshing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {t('search.refreshingText', 'Refreshing...')}
              </>
            ) : (
              t('common.refresh', 'Refresh')
            )}
          </button>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder={t(
                'search.placeholder',
                'Search any registered user by name, ID, phone, department, or address'
              )}
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
              aria-label={t('search.toggleFilters', 'Toggle filters')}
            >
              <FaFilter />
            </button>
            <button
              onClick={toggleViewMode}
              className="p-3 bg-white/20 text-white/70 rounded-lg hover:bg-white/30 transition-colors duration-200"
              aria-label={
                viewMode === 'grid'
                  ? t('search.switchToListView', 'Switch to list view')
                  : t('search.switchToGridView', 'Switch to grid view')
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
            className="mb-6 p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
          >
            <h3 className="text-white font-semibold text-lg mb-5">
              {t('search.filterOptions', 'Filter Options')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Form Type Dropdown */}
              <div>
                <label htmlFor="formType" className="text-white block mb-1">
                  {t('search.formType', 'Form Type')}
                </label>
                <select
                  id="formType"
                  name="formType"
                  value={filters.formType}
                  onChange={handleFilterChange}
                  className="w-full p-2 bg-white/20 border border-white/30 rounded "
                >
                  <option value="">{t('search.all', 'All')}</option>
                  {FORM_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {t(`search.formTypes.${value}`, label)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Buttons */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="text-white block mb-2">
                  {t('search.sortBy', 'Sort By')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: t('search.sortFields.name', 'Name'),
                      field: 'name',
                    },
                    {
                      label: t('search.sortFields.date', 'Date'),
                      field: 'created_at',
                    },
                  ].map(({ label, field }) => (
                    <button
                      key={field}
                      onClick={() => handleSort(field as SortField)}
                      className={`flex items-center gap-1 px-3 py-1 rounded transition-colors ${
                        sortField === field
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/20 text-white/70 hover:bg-white/30'
                      }`}
                    >
                      {label} {getSortIcon(field as SortField)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results count with improved styling and view toggle */}
        <div className="mb-4 text-white/70 flex justify-between items-center">
          <div>
            {t('search.found', 'Found')}{' '}
            <span className="font-medium text-white">
              {filteredData.length}
            </span>{' '}
            {filteredData.length === 1
              ? t('search.userSingular', 'user')
              : t('search.userPlural', 'users')}
          </div>
        </div>

        {/* Display filtered data with improved animations */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {displayedData.length > 0 ? (
                displayedData.map((user, index) => (
                  <motion.div
                    key={user.id}
                    custom={{ isGrid: true, index }}
                    variants={gridItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileTap="tap"
                    layoutId={user.id}
                  >
                    <Card user={adaptUser(user)} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full">
                  <NoResultsFound />
                </div>
              )}

              {/* Intersection observer trigger */}
              {hasMore && (
                <div
                  id="load-more-trigger"
                  className="h-10 w-full col-span-full flex justify-center items-center"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-300"></div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {displayedData.length > 0 ? (
                displayedData.map((user, index) => (
                  <motion.div
                    key={user.id}
                    custom={{ isGrid: false, index }}
                    variants={gridItemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileTap="tap"
                    layoutId={user.id}
                    className="bg-white/20 backdrop-blur-md rounded-lg p-4 border border-white/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-blue-500">
                        {user.image_path || user.image_url ? (
                          <img
                            src={getImageUrl(
                              user.image_path || user.image_url,
                              user.name
                            )}
                            alt={user.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white">
                          {user.name}
                        </h3>
                        {user.category && (
                          <p className="text-white/70 text-sm">
                            {user.category}
                          </p>
                        )}
                        {user.department && (
                          <p className="text-white/70 text-sm">
                            {user.department}
                          </p>
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
                      <Link
                        to={`/users/${user.id}`}
                        className="ml-4 px-4 py-2 bg-blue-600/70 cursor-pointer hover:bg-blue-700 text-white rounded transition-colors duration-300 flex-shrink-0"
                      >
                        {t('common.view', 'View')}
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <NoResultsFound />
              )}

              {/* Intersection observer trigger */}
              {hasMore && (
                <div
                  id="load-more-trigger"
                  className="h-10 w-full flex justify-center items-center"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-300"></div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Details Modal with enhanced animations */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              variants={modalVariants}
              className="bg-white/20 backdrop-blur-md rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  User Details
                </h2>
                <motion.button
                  onClick={closeModal}
                  className="text-white/70 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes size={24} />
                </motion.button>
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/30">
                    {selectedUser.image_url || selectedUser.image_path ? (
                      <img
                        src={getImageUrl(
                          selectedUser.image_path || selectedUser.image_url,
                          selectedUser.name
                        )}
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

// Wrap the component with React.memo to prevent unnecessary re-renders
export default React.memo(Search);
