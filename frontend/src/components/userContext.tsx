import React, { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';
import { User } from './user';

interface UserContextType {
  user: User;
  setUser: (user:User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: FunctionComponent<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    email: '',
    password: '',
    userName: '',
    profilePicture: '',
    googlePicture: undefined,
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
