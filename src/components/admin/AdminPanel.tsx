
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, Users, Shield } from 'lucide-react';

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  is_approved: boolean;
  created_at: string;
}

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchPendingUsers();
    }
  }, [isAdmin]);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserApproval = async (userId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: approved })
        .eq('id', userId);

      if (error) throw error;
      fetchPendingUsers();
    } catch (error) {
      console.error('Error updating user approval:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-center text-white">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You don't have admin privileges to access this panel.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-300">Manage user accounts and approvals</p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-orange-400" />
            <h2 className="text-xl font-semibold text-white">User Accounts</h2>
          </div>

          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="text-white font-medium">{user.full_name || 'No name provided'}</h3>
                  <p className="text-gray-300 text-sm">{user.email}</p>
                  <p className="text-gray-400 text-xs">
                    Created: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={user.is_approved ? "default" : "secondary"}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                  
                  {!user.is_approved && (
                    <Button
                      onClick={() => updateUserApproval(user.id, true)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                  )}
                  
                  {user.is_approved && (
                    <Button
                      onClick={() => updateUserApproval(user.id, false)}
                      size="sm"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {pendingUsers.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No users found
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
