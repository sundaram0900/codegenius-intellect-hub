
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatInterface from '../components/ChatInterface';
import AuthForm from '../components/auth/AuthForm';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ChatInterface />
    </div>
  );
};

export default Index;
