import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Bell, 
  Moon, 
  Database, 
  RefreshCw,
  Smartphone,
  QrCode,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  X,
  Download
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  MobileAppSettings, 
  MobileDevice,
  QRLoginSession,
  mobileAppService 
} from '@/services/MobileAppService';
import { useToast } from '@/components/ui/use-toast';

interface MobileAppConfigProps {
  className?: string;
}

const MobileAppConfig: React.FC<MobileAppConfigProps> = ({ className }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const [settings, setSettings] = useState<MobileAppSettings | null>(null);
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [qrSession, setQrSession] = useState<QRLoginSession | null>(null);
  const [qrPollingInterval, setQrPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [confirmDeleteDevice, setConfirmDeleteDevice] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock user ID
  const userId = user?.id || 'user-123';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [settingsData, devicesData] = await Promise.all([
          mobileAppService.getMobileAppSettings(userId),
          mobileAppService.getUserDevices(userId)
        ]);
        
        setSettings(settingsData);
        setDevices(devicesData);
      } catch (error) {
        console.error('Error fetching mobile app data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load mobile app configuration.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (qrPollingInterval) {
        clearInterval(qrPollingInterval);
      }
    };
  }, [userId, toast]);

  const handleSettingsChange = async (updatedSettings: MobileAppSettings) => {
    try {
      setSettings(updatedSettings);
      await mobileAppService.updateMobileAppSettings(updatedSettings);
      toast({
        title: 'Settings Updated',
        description: 'Your mobile app settings have been saved.',
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update settings.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePushNotifications = () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      pushNotifications: !settings.pushNotifications
    };
    
    handleSettingsChange(updatedSettings);
  };

  const handleToggleNotificationType = (type: keyof MobileAppSettings['notificationTypes']) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      notificationTypes: {
        ...settings.notificationTypes,
        [type]: !settings.notificationTypes[type]
      }
    };
    
    handleSettingsChange(updatedSettings);
  };

  const handleToggleDarkMode = () => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      darkMode: !settings.darkMode
    };
    
    handleSettingsChange(updatedSettings);
  };

  const handleDataUsageChange = (value: 'low' | 'medium' | 'high') => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      dataUsage: value
    };
    
    handleSettingsChange(updatedSettings);
  };

  const handleRefreshIntervalChange = (value: string) => {
    if (!settings) return;
    
    const updatedSettings = {
      ...settings,
      refreshInterval: parseInt(value)
    };
    
    handleSettingsChange(updatedSettings);
  };

  const handleGenerateQRCode = async () => {
    try {
      const session = await mobileAppService.generateQRLoginSession();
      setQrSession(session);
      
      // Poll for session status updates
      const interval = setInterval(async () => {
        const updatedSession = await mobileAppService.checkQRLoginSessionStatus(session.sessionCode);
        setQrSession(updatedSession);
        
        // If the session is no longer pending, stop polling
        if (updatedSession.status !== 'pending') {
          clearInterval(interval);
          setQrPollingInterval(null);
          
          // If authorized, refresh the devices list
          if (updatedSession.status === 'authorized') {
            const devicesData = await mobileAppService.getUserDevices(userId);
            setDevices(devicesData);
            
            toast({
              title: 'Device Connected',
              description: 'Your mobile device has been successfully connected.',
            });
          }
        }
      }, 3000); // Check every 3 seconds
      
      setQrPollingInterval(interval);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      // In a real implementation, we would call an API to delete the device
      // For now, just remove it from the local state
      setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
      setConfirmDeleteDevice(null);
      
      toast({
        title: 'Device Removed',
        description: 'The device has been disconnected from your account.',
      });
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete device.',
        variant: 'destructive',
      });
    }
  };

  // Format device last active date
  const formatLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className || ''}`}>
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-sleeper-dark grid grid-cols-3 h-12 mb-6">
          <TabsTrigger value="settings" className="tab-trigger">Settings</TabsTrigger>
          <TabsTrigger value="devices" className="tab-trigger">Devices</TabsTrigger>
          <TabsTrigger value="connect" className="tab-trigger">Connect</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-500" />
                  Notifications
                </CardTitle>
                <CardDescription>
                  Configure push notifications for your mobile app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                    <span>Push Notifications</span>
                    <span className="font-normal text-xs text-sleeper-gray">Enable or disable all notifications</span>
                  </Label>
                  <Switch
                    id="push-notifications"
                    checked={settings?.pushNotifications}
                    onCheckedChange={handleTogglePushNotifications}
                  />
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="trade-offers">Trade Offers</Label>
                      <Switch
                        id="trade-offers"
                        disabled={!settings?.pushNotifications}
                        checked={settings?.notificationTypes.tradeOffers}
                        onCheckedChange={() => handleToggleNotificationType('tradeOffers')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="league-messages">League Messages</Label>
                      <Switch
                        id="league-messages"
                        disabled={!settings?.pushNotifications}
                        checked={settings?.notificationTypes.leagueMessages}
                        onCheckedChange={() => handleToggleNotificationType('leagueMessages')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="game-updates">Game Updates</Label>
                      <Switch
                        id="game-updates"
                        disabled={!settings?.pushNotifications}
                        checked={settings?.notificationTypes.gameUpdates}
                        onCheckedChange={() => handleToggleNotificationType('gameUpdates')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="player-news">Player News</Label>
                      <Switch
                        id="player-news"
                        disabled={!settings?.pushNotifications}
                        checked={settings?.notificationTypes.playerNews}
                        onCheckedChange={() => handleToggleNotificationType('playerNews')}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="score-alerts">Score Alerts</Label>
                      <Switch
                        id="score-alerts"
                        disabled={!settings?.pushNotifications}
                        checked={settings?.notificationTypes.scoreAlerts}
                        onCheckedChange={() => handleToggleNotificationType('scoreAlerts')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-purple-500" />
                  Appearance & Performance
                </CardTitle>
                <CardDescription>
                  Configure app appearance and data settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                    <span>Dark Mode</span>
                    <span className="font-normal text-xs text-sleeper-gray">Use dark theme in the mobile app</span>
                  </Label>
                  <Switch
                    id="dark-mode"
                    checked={settings?.darkMode}
                    onCheckedChange={handleToggleDarkMode}
                  />
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1 mb-2">
                    <Label htmlFor="data-usage">Data Usage</Label>
                    <span className="font-normal text-xs text-sleeper-gray">Control how much data the app uses</span>
                  </div>
                  <Select
                    value={settings?.dataUsage}
                    onValueChange={(value: 'low' | 'medium' | 'high') => handleDataUsageChange(value)}
                  >
                    <SelectTrigger id="data-usage">
                      <SelectValue placeholder="Select data usage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Limited Images)</SelectItem>
                      <SelectItem value="medium">Medium (Recommended)</SelectItem>
                      <SelectItem value="high">High (Best Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex flex-col space-y-1 mb-2">
                    <Label htmlFor="refresh-interval">Refresh Interval</Label>
                    <span className="font-normal text-xs text-sleeper-gray">How often the app checks for updates</span>
                  </div>
                  <Select
                    value={settings?.refreshInterval.toString()}
                    onValueChange={handleRefreshIntervalChange}
                  >
                    <SelectTrigger id="refresh-interval">
                      <SelectValue placeholder="Select refresh interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-500" />
                Connected Devices
              </CardTitle>
              <CardDescription>
                Manage your connected mobile devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sleeper-gray mb-4">No devices connected</p>
                  <Button 
                    onClick={() => setActiveTab('connect')}
                    className="flex items-center gap-2"
                  >
                    <Smartphone className="h-4 w-4" />
                    Connect a Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.map((device) => (
                      <div 
                        key={device.id} 
                        className="border border-border rounded-md p-4 hover:bg-sleeper-dark transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-sleeper-dark rounded-full">
                              <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{device.deviceName}</h3>
                              <p className="text-xs text-sleeper-gray">{device.deviceModel}</p>
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDeleteDevice(device.id)}
                              className="h-8 w-8 p-0 text-sleeper-gray hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-sleeper-gray">OS:</span>
                            <span>{device.deviceType === 'ios' ? 'iOS' : 'Android'} {device.osVersion}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-sleeper-gray">App Version:</span>
                            <span>{device.appVersion}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-sleeper-gray">Last Active:</span>
                            <span>{formatLastActive(device.lastActive)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-sleeper-gray">Sync Status:</span>
                            <span className="flex items-center">
                              {device.syncState.playerDataSynced &&
                               device.syncState.leagueDataSynced &&
                               device.syncState.rosterDataSynced &&
                               device.syncState.matchupDataSynced ? (
                                <>
                                  <Check className="h-3 w-3 text-green-500 mr-1" />
                                  Synced
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 text-yellow-500 mr-1" />
                                  Partial
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delete Device Confirmation Dialog */}
          <Dialog 
            open={confirmDeleteDevice !== null} 
            onOpenChange={(open) => !open && setConfirmDeleteDevice(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove Device</DialogTitle>
                <DialogDescription>
                  Are you sure you want to disconnect this device? You will need to reconnect it if you want to use the mobile app on this device again.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setConfirmDeleteDevice(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => confirmDeleteDevice && handleDeleteDevice(confirmDeleteDevice)}
                >
                  Remove Device
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Connect Tab */}
        <TabsContent value="connect">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Connect with QR Code
                </CardTitle>
                <CardDescription>
                  Scan the QR code with your mobile device to connect
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {qrSession ? (
                  <div className="text-center">
                    <div className="bg-white p-4 rounded-md mb-4">
                      {/* In a real app, this would be an actual QR code */}
                      <div className="w-48 h-48 mx-auto bg-gray-800 relative">
                        <div className="absolute inset-4 border-2 border-white flex items-center justify-center">
                          <div className="text-white text-sm">
                            QR Code<br />
                            {qrSession.sessionCode}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Session Code</p>
                      <p className="text-2xl font-mono tracking-wider">{qrSession.sessionCode}</p>
                    </div>
                    
                    <div className="flex items-center justify-center mb-4">
                      <Clock className="h-4 w-4 text-sleeper-gray mr-1" />
                      <p className="text-sm text-sleeper-gray">
                        {qrSession.status === 'pending' ? 'Expires in 5 minutes' : 
                         qrSession.status === 'authorized' ? 'Connected successfully' :
                         qrSession.status === 'expired' ? 'Session expired' :
                         'Session rejected'}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      {qrSession.status === 'pending' ? (
                        <div className="flex items-center text-yellow-500">
                          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          <span>Waiting for scan...</span>
                        </div>
                      ) : qrSession.status === 'authorized' ? (
                        <div className="flex items-center text-green-500">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Device connected!</span>
                        </div>
                      ) : qrSession.status === 'expired' ? (
                        <div className="flex items-center text-sleeper-gray">
                          <X className="h-4 w-4 mr-1" />
                          <span>Session expired</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-red-500">
                          <X className="h-4 w-4 mr-1" />
                          <span>Connection rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <p className="mb-4">Generate a QR code to connect your mobile device to your account.</p>
                    <Button 
                      onClick={handleGenerateQRCode}
                      className="flex items-center gap-2"
                    >
                      <QrCode className="h-4 w-4" />
                      Generate QR Code
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-center text-center">
                <p className="text-sm text-sleeper-gray">
                  To connect your device, open the Dynasty AI Football app and scan the QR code
                </p>
                {qrSession && qrSession.status !== 'pending' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleGenerateQRCode}
                    className="mt-4"
                  >
                    Generate New Code
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-teal-500" />
                  Get the Mobile App
                </CardTitle>
                <CardDescription>
                  Download the companion app for your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border border-border rounded-md flex items-center">
                  <div className="mr-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14.1157 6.87476L9.06573 1.83476C8.87505 1.64408 8.67173 1.64976 8.46841 1.73476C8.26509 1.81976 8.16841 1.9881 8.16841 2.25476V21.7548C8.16841 22.0214 8.26509 22.1898 8.46841 22.2748C8.67173 22.3598 8.87505 22.3598 9.06573 22.1748L14.1157 17.1248M11.7824 12.0048H22.9999M18.9999 8.00476L22.9999 12.0048L18.9999 16.0048" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">iOS App</h3>
                    <p className="text-xs text-sleeper-gray mb-2">For iPhone and iPad</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>App Store</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-md flex items-center">
                  <div className="mr-4">
                    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.99634 2.45703H17.9963C18.5486 2.45703 18.9963 2.90474 18.9963 3.45703V20.457C18.9963 21.0093 18.5486 21.457 17.9963 21.457H5.99634C5.44405 21.457 4.99634 21.0093 4.99634 20.457V3.45703C4.99634 2.90474 5.44405 2.45703 5.99634 2.45703Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M11.9963 17.457H12.0063" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Android App</h3>
                    <p className="text-xs text-sleeper-gray mb-2">For Android devices</p>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Google Play</span>
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-sleeper-dark rounded-md">
                  <h3 className="font-semibold mb-2">Mobile Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Manage your teams on the go</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Real-time scoring updates</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Push notifications for important events</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Offline access to player data</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span>Trade offers and chat messaging</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileAppConfig;