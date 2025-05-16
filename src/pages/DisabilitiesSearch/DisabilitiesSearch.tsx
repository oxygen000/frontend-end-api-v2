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
  FaSearch,
  FaSync,
  FaWheelchair,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslationWithFallback } from '../../hooks/useTranslationWithFallback';
import { toast } from 'react-hot-toast';

const API_URL = 'https://backend-fast-api-ai.fly.dev/api/users';
const PAGE_SIZE = 20;

interface User {
  id: string;
  name: string;
  nickname: string;
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

interface ApiUser {
  id: string;
  name: string;
  nickname?: string;
  image_path?: string;
  image_url?: string;
  created_at?: string;
  form_type?: string;
  category?: string;
  phone_number?: string;
  national_id?: string;
  address?: string;
  dob?: string;
  // Disability specific fields
  disability_type?: string;
  disability_description?: string;
  medical_condition?: string;
  special_needs?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  [key: string]: unknown;
}

type SortField = 'name' | 'created_at' | 'none';
type SortDirection = 'asc' | 'desc';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: { opacity: 0 },
};

const gridItemVariants = {
  hidden: ({ isGrid }: { isGrid: boolean }) => ({
    opacity: 0,
    y: 20,
    scale: isGrid ? 0.9 : 1,
  }),
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
  exit: { opacity: 0, scale: 0.9 },
  tap: { scale: 0.98 },
};

// Add a custom debounce hook
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

const DisabilitiesSearch: React.FC = () => {
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
    disabilityType: '',
    hasMedicalCondition: false,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Fetch data from API
  const fetchData = useCallback(async (retryCount = 0, maxRetries = 3) => {
    try {
      setLoading(true);
      setError(null);

      // Use a cached response if available
      const cachedData = sessionStorage.getItem('disabilitiesSearchData');
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
      setError('Failed to load disabilities data. Please try again later.');
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
        // Filter for disabilities only
        const disabilitiesOnly = response.data.filter(
          (user: ApiUser) =>
            user.form_type === 'disabled' || user.disability_type
        );
        setData(disabilitiesOnly);
        setFilteredData(disabilitiesOnly);
        // Cache the response for future use
        sessionStorage.setItem(
          'disabilitiesSearchData',
          JSON.stringify(disabilitiesOnly)
        );
      } else if (
        response.data &&
        response.data.users &&
        Array.isArray(response.data.users)
      ) {
        // Filter for disabilities only
        const disabilitiesOnly = response.data.users.filter(
          (user: ApiUser) =>
            user.form_type === 'disabled' || user.disability_type
        );
        setData(disabilitiesOnly);
        setFilteredData(disabilitiesOnly);
        // Cache the response for future use
        sessionStorage.setItem(
          'disabilitiesSearchData',
          JSON.stringify(disabilitiesOnly)
        );
      } else {
        setError('Invalid response format from server');
        setData([]);
        setFilteredData([]);
      }
    } catch (error) {
      console.error('Error fetching from API:', error);

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

  // Helper function to get image URL
  const getImageUrl = useMemo(() => {
    return (imagePath: string | null | undefined, userName: string) => {
      if (!imagePath) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;
      }

      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      const formattedPath = imagePath.includes('uploads/')
        ? imagePath
        : `uploads/${imagePath}`;

      return `https://backend-fast-api-ai.fly.dev/${formattedPath.replace(/^\//, '')}`;
    };
  }, []);

  useEffect(() => {
    fetchData(0, 3);
  }, [fetchData]);

  // Apply filters function
  const applyFilters = useCallback(() => {
    if (!Array.isArray(data)) {
      setFilteredData([]);
      return;
    }

    const term = debouncedSearchTerm.toLowerCase();

    const filtered = data.filter((user) => {
      // Apply search term if present
      if (term !== '') {
        const searchableFields = [
          user.name,
          user.phone_number,
          user.national_id,
          user.address,
          user.disability_type,
          user.disability_description,
          user.medical_condition,
        ];

        const matchesSearch = searchableFields.some(
          (field) => field && field.toString().toLowerCase().includes(term)
        );

        if (!matchesSearch) return false;
      }

      // Apply filters
      return (
        (!filters.disabilityType ||
          (user.disability_type &&
            user.disability_type.toString().toLowerCase() ===
              filters.disabilityType.toLowerCase())) &&
        (!filters.hasMedicalCondition ||
          (user.medical_condition &&
            user.medical_condition.toString().trim() !== ''))
      );
    });

    // Apply sorting
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let comparison = 0;
        let dateA, dateB;

        switch (sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'created_at':
            dateA = new Date(a.created_at || '').getTime();
            dateB = new Date(b.created_at || '').getTime();
            comparison = dateA - dateB;
            break;
          default:
            comparison = 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(filtered);
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

  // Event handlers
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
    setRefreshing(true);
    sessionStorage.removeItem('disabilitiesSearchData');
    setPage(1);
    setHasMore(true);
    toast?.success(t('search.refreshing', 'Refreshing data...'));

    fetchData(0, 3).finally(() => {
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    });
  };

  // UI Components
  const NoResultsFound = () => (
    <div className="text-center py-10 text-white">
      <FaWheelchair className="mx-auto h-12 w-12 text-white/50" />
      <p className="mt-4 text-xl">No people with disabilities found</p>
      <p className="text-white/70">
        Try a different search term or adjust filters
      </p>
    </div>
  );

  const adaptUser = (user: ApiUser): User => {
    return {
      id: user.id,
      name: user.name,
      nickname: user.nickname || '',
      image_path: user.image_path,
      image_url: user.image_url,
      created_at: user.created_at,
      form_type: user.form_type,
      category: user.category,
      phone_number: user.phone_number,
      national_id: user.national_id,
      address: user.address,
      dob: user.dob,
    };
  };

  // Disability types for the filter
  const DISABILITY_TYPES = [
    { value: '', label: 'All Types' },
    { value: 'physical', label: 'Physical' },
    { value: 'visual', label: 'Visual' },
    { value: 'hearing', label: 'Hearing' },
    { value: 'cognitive', label: 'Cognitive' },
    { value: 'multiple', label: 'Multiple Disabilities' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Disabilities Search
        </h1>
        <p className="text-white/70">
          Search and filter people with disabilities
        </p>
      </div>

      {/* Search & Controls */}
      <div className="bg-white/10 backdrop-blur-lg p-4 rounded-lg border border-white/20 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-white/50" />
            </div>
            <input
              type="text"
              placeholder={t(
                'search.searchDisabilities',
                'Search people with disabilities...'
              )}
              className="bg-white/10 w-full pl-10 pr-4 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded-lg border border-white/20 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              onClick={toggleViewMode}
              title={t('search.gridView', 'Grid View')}
            >
              <FaThLarge />
            </button>
            <button
              className={`px-3 py-2 rounded-lg border border-white/20 ${viewMode === 'row' ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              onClick={toggleViewMode}
              title={t('search.listView', 'List View')}
            >
              <FaList />
            </button>
            <button
              className={`px-3 py-2 rounded-lg border border-white/20 ${showFilters ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              onClick={toggleFilters}
              title={t('search.filters', 'Filters')}
            >
              <FaFilter />
            </button>
            <button
              className={`px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white/70 hover:bg-white/20 ${refreshing ? 'animate-spin' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
              title={t('search.refresh', 'Refresh Data')}
            >
              <FaSync />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <label className="block text-white mb-2">
                    {t('search.disabilityType', 'Disability Type')}
                  </label>
                  <select
                    name="disabilityType"
                    value={filters.disabilityType}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md text-white"
                  >
                    {DISABILITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasMedicalCondition"
                    name="hasMedicalCondition"
                    checked={filters.hasMedicalCondition}
                    onChange={handleFilterChange}
                    className="rounded border-white/30 text-purple-600 focus:ring-purple-500 bg-white/10"
                  />
                  <label
                    htmlFor="hasMedicalCondition"
                    className="text-white cursor-pointer"
                  >
                    {t('search.hasMedicalCondition', 'Has Medical Condition')}
                  </label>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <span className="text-white">
                      {t('search.sortByName', 'Sort by Name')}
                    </span>
                    {getSortIcon('name')}
                  </div>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <span className="text-white">
                      {t('search.sortByDate', 'Sort by Date')}
                    </span>
                    {getSortIcon('created_at')}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Display stats */}
      <div className="mb-4 text-white/70">
        {t('search.showing', 'Showing')} {displayedData.length}{' '}
        {t('search.of', 'of')} {filteredData.length}{' '}
        {t('search.peopleWithDisabilities', 'people with disabilities')}
      </div>

      {/* Loading state */}
      {loading && data.length === 0 && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white mb-6">
          <p>{error}</p>
          <button
            onClick={() => fetchData()}
            className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Main content - Grid/List view */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid-view"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300"></div>
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
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-purple-500">
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
                      {user.disability_type && (
                        <p className="text-white/70 text-sm">
                          <span className="font-medium">Type:</span>{' '}
                          {user.disability_type}
                        </p>
                      )}
                      {user.medical_condition && (
                        <p className="text-white/70 text-sm truncate max-w-xs">
                          <span className="font-medium">Medical:</span>{' '}
                          {user.medical_condition}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-white font-medium">
                        {user.phone_number || 'No contact'}
                      </p>
                      <p className="text-white/70 text-sm">
                        ID: {user.national_id || 'N/A'}
                      </p>
                    </div>
                    <Link
                      to={`/users/${user.id}`}
                      className="ml-4 px-4 py-2 bg-purple-600/70 cursor-pointer hover:bg-purple-700 text-white rounded transition-colors duration-300 flex-shrink-0"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-300"></div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DisabilitiesSearch;
