// Minimal hook placeholder; your app uses contexts/AuthContext.jsx so this is optional
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export default function useAuth(){
  return useContext(AuthContext);
}
