import { useState, useCallback } from 'react';
import {
  maleApi,
  femaleApi,
  childApi,
  disabledApi,
  commonApi,
} from '../services/api';
import type {
  MaleUser,
  FemaleUser,
  ChildUser,
  DisabledUser,
} from '../services/api';

// Union type for all possible user types
type UserType = MaleUser | FemaleUser | ChildUser | DisabledUser;

// Type guard functions to check user category
const isMaleUser = (user: UserType): user is MaleUser =>
  'gender' in user && user.gender === 'male';
const isFemaleUser = (user: UserType): user is FemaleUser =>
  'gender' in user && user.gender === 'female';
const isChildUser = (user: UserType): user is ChildUser =>
  'guardian_name' in user;
const isDisabledUser = (user: UserType): user is DisabledUser =>
  'disability_type' in user;

export const useUsers = (
  category: 'male' | 'female' | 'child' | 'disabled'
) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Get the appropriate API based on category
  const getApi = useCallback(() => {
    switch (category) {
      case 'male':
        return maleApi;
      case 'female':
        return femaleApi;
      case 'child':
        return childApi;
      case 'disabled':
        return disabledApi;
      default:
        throw new Error('Invalid category');
    }
  }, [category]);

  // Fetch users
  const fetchUsers = useCallback(
    async (skip = 0, limit = 100) => {
      setLoading(true);
      setError(null);
      try {
        const api = getApi();
        const [usersData, countData] = await Promise.all([
          api.getAll(skip, limit),
          commonApi.getCount(category),
        ]);
        setUsers(usersData.users as UserType[]);
        setTotalCount(countData.count);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [category, getApi]
  );

  // Create user with type checking
  const createUser = useCallback(
    async (userData: UserType, image?: File) => {
      setLoading(true);
      setError(null);
      try {
        // Type checking and casting based on category
        switch (category) {
          case 'male':
            if (!isMaleUser(userData)) {
              throw new Error('Invalid user data for male category');
            }
            return await maleApi.create(userData, image);
          case 'female':
            if (!isFemaleUser(userData)) {
              throw new Error('Invalid user data for female category');
            }
            return await femaleApi.create(userData, image);
          case 'child':
            if (!isChildUser(userData)) {
              throw new Error('Invalid user data for child category');
            }
            return await childApi.create(userData, image);
          case 'disabled':
            if (!isDisabledUser(userData)) {
              throw new Error('Invalid user data for disabled category');
            }
            return await disabledApi.create(userData, image);
          default:
            throw new Error('Invalid category');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
        // Refresh the user list after successful creation
        await fetchUsers();
      }
    },
    [category, fetchUsers]
  );

  // Get user by ID
  const getUserById = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const api = getApi();
        return await api.getById(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [category, getApi]
  );

  // Search users
  const searchUsers = useCallback(
    async (query: string) => {
      setLoading(true);
      setError(null);
      try {
        const results = await commonApi.search(query, category);
        setUsers(results.users as UserType[]);
        return results;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [category]
  );

  return {
    loading,
    error,
    users,
    totalCount,
    fetchUsers,
    createUser,
    getUserById,
    searchUsers,
  };
};