import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/user';

const MobileAppConfig: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Mock user for now
    setUser({
      id: '1',
      displayName: 'John Doe',
      avatarUrl: '',
      email: 'john@example.com'
    });
  }, []);
  
  return (
    <div className="space-y-6">
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome, {user.displayName}!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MobileAppConfig;
