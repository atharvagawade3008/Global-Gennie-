import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole, TouristProfile, EmergencyContact } from '../types';
import { MOCK_USERS, MOCK_TOURIST_PROFILE, MOCK_EMERGENCY_CONTACTS } from '../lib/mockData';

interface AuthContextType {
  user: UserProfile;
  role: UserRole;
  setRole: (role: UserRole) => void;
  touristProfile: TouristProfile;
  emergencyContacts: EmergencyContact[];
  updateTouristProfile: (updates: Partial<TouristProfile>) => void;
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id' | 'user_id'>) => void;
  removeEmergencyContact: (id: string) => void;
  isAuthenticated: boolean;
  switchUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('globalgennie_active_role') as UserRole) || 'tourist';
  });

  const [touristProfile, setTouristProfile] = useState<TouristProfile>(() => {
    const saved = localStorage.getItem('globalgennie_tourist_profile');
    return saved ? JSON.parse(saved) : MOCK_TOURIST_PROFILE;
  });

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('globalgennie_emergency_contacts');
    return saved ? JSON.parse(saved) : MOCK_EMERGENCY_CONTACTS;
  });

  const activeUser = MOCK_USERS[currentRole] || MOCK_USERS.tourist;

  useEffect(() => {
    localStorage.setItem('globalgennie_active_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('globalgennie_tourist_profile', JSON.stringify(touristProfile));
  }, [touristProfile]);

  useEffect(() => {
    localStorage.setItem('globalgennie_emergency_contacts', JSON.stringify(emergencyContacts));
  }, [emergencyContacts]);

  const switchUserRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const updateTouristProfile = (updates: Partial<TouristProfile>) => {
    setTouristProfile((prev) => ({ ...prev, ...updates }));
  };

  const addEmergencyContact = (contact: Omit<EmergencyContact, 'id' | 'user_id'>) => {
    const newContact: EmergencyContact = {
      ...contact,
      id: 'ec-' + Math.random().toString(36).substring(2, 9),
      user_id: activeUser.id,
    };
    setEmergencyContacts((prev) => [newContact, ...prev]);
  };

  const removeEmergencyContact = (id: string) => {
    setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        role: currentRole,
        setRole: setCurrentRole,
        touristProfile,
        emergencyContacts,
        updateTouristProfile,
        addEmergencyContact,
        removeEmergencyContact,
        isAuthenticated: true,
        switchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
