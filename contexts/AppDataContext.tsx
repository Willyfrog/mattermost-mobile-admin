import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mattermostService } from '@/services/mattermostClient';

interface Team {
  id: string;
  name: string;
  display_name: string;
  description: string;
  company_name: string;
  allowed_domains: string;
  invite_id: string;
  allow_open_invite: boolean;
  delete_at: number;
  update_at: number;
  create_at: number;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  scheme_managed: boolean;
  builtin: boolean;
  delete_at: number;
  update_at: number;
  create_at: number;
}

interface AppDataState {
  teams: Team[];
  roles: Role[];
  loading: {
    teams: boolean;
    roles: boolean;
  };
  error: {
    teams: string | null;
    roles: string | null;
  };
}

interface AppDataContextType extends AppDataState {
  fetchTeams: () => Promise<void>;
  fetchRoles: () => Promise<void>;
  fetchAllData: () => Promise<void>;
  clearAllData: () => void;
  retryTeams: () => Promise<void>;
  retryRoles: () => Promise<void>;
  registerWithAuth: (clearCallback: () => void, fetchCallback: () => Promise<void>) => void;
}

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState({
    teams: false,
    roles: false,
  });
  const [error, setError] = useState({
    teams: null as string | null,
    roles: null as string | null,
  });

  const fetchTeams = useCallback(async () => {
    setLoading(prev => ({ ...prev, teams: true }));
    setError(prev => ({ ...prev, teams: null }));
    
    try {
      const result = await mattermostService.getAllTeams();
      
      if (result.success && result.teams) {
        setTeams(result.teams);
      } else {
        setError(prev => ({ ...prev, teams: result.error || 'Failed to fetch teams' }));
      }
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(prev => ({ ...prev, teams: 'Failed to fetch teams' }));
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    setLoading(prev => ({ ...prev, roles: true }));
    setError(prev => ({ ...prev, roles: null }));
    
    try {
      const result = await mattermostService.getAllRoles();
      
      if (result.success && result.roles) {
        setRoles(result.roles);
      } else {
        setError(prev => ({ ...prev, roles: result.error || 'Failed to fetch roles' }));
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(prev => ({ ...prev, roles: 'Failed to fetch roles' }));
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    await Promise.all([fetchTeams(), fetchRoles()]);
  }, [fetchTeams, fetchRoles]);

  const clearAllData = useCallback(() => {
    setTeams([]);
    setRoles([]);
    setError({
      teams: null,
      roles: null,
    });
    setLoading({
      teams: false,
      roles: false,
    });
  }, []);

  const retryTeams = useCallback(async () => {
    await fetchTeams();
  }, [fetchTeams]);

  const retryRoles = useCallback(async () => {
    await fetchRoles();
  }, [fetchRoles]);

  const registerWithAuth = useCallback((clearCallback: () => void, fetchCallback: () => Promise<void>) => {
    // This allows external components to register callbacks for clearing and fetching data
    // In practice, the AuthContext will call this to register its own callbacks
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        teams,
        roles,
        loading,
        error,
        fetchTeams,
        fetchRoles,
        fetchAllData,
        clearAllData,
        retryTeams,
        retryRoles,
        registerWithAuth,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}