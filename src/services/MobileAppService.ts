import { supabase } from '@/integrations/supabase/client';

// Mobile app settings and preferences
export interface MobileAppSettings {
  id?: string;
  userId: string;
  pushNotifications: boolean;
  notificationTypes: {
    tradeOffers: boolean;
    leagueMessages: boolean;
    gameUpdates: boolean;
    playerNews: boolean;
    scoreAlerts: boolean;
  };
  darkMode: boolean;
  dataUsage: 'low' | 'medium' | 'high';
  refreshInterval: number; // in minutes
}

// Types for mobile sync states
export interface SyncState {
  lastSyncTimestamp: string;
  playerDataSynced: boolean;
  leagueDataSynced: boolean;
  rosterDataSynced: boolean;
  matchupDataSynced: boolean;
}

// Types for mobile device
export interface MobileDevice {
  id: string;
  userId: string;
  deviceType: 'ios' | 'android';
  deviceModel: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  pushToken?: string;
  lastActive: string;
  syncState: SyncState;
}

// Types for QR login sessions
export interface QRLoginSession {
  id: string;
  sessionCode: string;
  userId?: string;
  deviceId?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'authorized' | 'expired' | 'rejected';
}

class MobileAppService {
  /**
   * Get mobile app settings for a user
   */
  async getMobileAppSettings(userId: string): Promise<MobileAppSettings> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockMobileAppSettings(userId);
    } catch (error) {
      console.error('Error fetching mobile app settings:', error);
      throw error;
    }
  }

  /**
   * Update mobile app settings
   */
  async updateMobileAppSettings(settings: MobileAppSettings): Promise<MobileAppSettings> {
    try {
      // In a real implementation, this would update the database
      // For now, just return the settings
      return settings;
    } catch (error) {
      console.error('Error updating mobile app settings:', error);
      throw error;
    }
  }

  /**
   * Register a mobile device
   */
  async registerDevice(device: Omit<MobileDevice, 'id' | 'lastActive' | 'syncState'>): Promise<MobileDevice> {
    try {
      // In a real implementation, this would create a record in the database
      // For now, return mock data with the provided details
      const newDevice: MobileDevice = {
        id: `device-${Math.floor(Math.random() * 10000)}`,
        userId: device.userId,
        deviceType: device.deviceType,
        deviceModel: device.deviceModel,
        deviceName: device.deviceName,
        osVersion: device.osVersion,
        appVersion: device.appVersion,
        pushToken: device.pushToken,
        lastActive: new Date().toISOString(),
        syncState: {
          lastSyncTimestamp: new Date().toISOString(),
          playerDataSynced: false,
          leagueDataSynced: false,
          rosterDataSynced: false,
          matchupDataSynced: false
        }
      };
      
      return newDevice;
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  /**
   * Update device sync state
   */
  async updateDeviceSyncState(deviceId: string, syncState: Partial<SyncState>): Promise<SyncState> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      return {
        lastSyncTimestamp: new Date().toISOString(),
        playerDataSynced: syncState.playerDataSynced || false,
        leagueDataSynced: syncState.leagueDataSynced || false,
        rosterDataSynced: syncState.rosterDataSynced || false,
        matchupDataSynced: syncState.matchupDataSynced || false
      };
    } catch (error) {
      console.error('Error updating device sync state:', error);
      throw error;
    }
  }

  /**
   * Get registered devices for a user
   */
  async getUserDevices(userId: string): Promise<MobileDevice[]> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data
      return this.getMockUserDevices(userId);
    } catch (error) {
      console.error('Error fetching user devices:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for mobile login
   */
  async generateQRLoginSession(): Promise<QRLoginSession> {
    try {
      // Generate a random session code
      const sessionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Create a new login session
      const session: QRLoginSession = {
        id: `session-${Math.floor(Math.random() * 10000)}`,
        sessionCode,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes expiry
        status: 'pending'
      };
      
      return session;
    } catch (error) {
      console.error('Error generating QR login session:', error);
      throw error;
    }
  }

  /**
   * Authorize a QR login session
   */
  async authorizeQRLoginSession(sessionCode: string, userId: string, deviceId: string): Promise<QRLoginSession> {
    try {
      // In a real implementation, this would update the database
      // For now, return mock data
      return {
        id: `session-${Math.floor(Math.random() * 10000)}`,
        sessionCode,
        userId,
        deviceId,
        createdAt: new Date(Date.now() - 60 * 1000).toISOString(), // 1 minute ago
        expiresAt: new Date(Date.now() + 4 * 60 * 1000).toISOString(), // 4 minutes remaining
        status: 'authorized'
      };
    } catch (error) {
      console.error('Error authorizing QR login session:', error);
      throw error;
    }
  }

  /**
   * Check QR login session status
   */
  async checkQRLoginSessionStatus(sessionCode: string): Promise<QRLoginSession> {
    try {
      // In a real implementation, this would fetch from the database
      // For now, return mock data with a random status
      const statuses: Array<'pending' | 'authorized' | 'expired' | 'rejected'> = ['pending', 'authorized', 'expired', 'rejected'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        id: `session-${Math.floor(Math.random() * 10000)}`,
        sessionCode,
        userId: randomStatus === 'authorized' ? 'user-123' : undefined,
        deviceId: randomStatus === 'authorized' ? 'device-456' : undefined,
        createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
        expiresAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(), // 3 minutes remaining
        status: randomStatus
      };
    } catch (error) {
      console.error('Error checking QR login session status:', error);
      throw error;
    }
  }

  /**
   * Generate mock mobile app settings
   */
  private getMockMobileAppSettings(userId: string): MobileAppSettings {
    return {
      id: `settings-${userId}`,
      userId,
      pushNotifications: true,
      notificationTypes: {
        tradeOffers: true,
        leagueMessages: true,
        gameUpdates: true,
        playerNews: false,
        scoreAlerts: true
      },
      darkMode: true,
      dataUsage: 'medium',
      refreshInterval: 15
    };
  }

  /**
   * Generate mock user devices
   */
  private getMockUserDevices(userId: string): MobileDevice[] {
    return [
      {
        id: 'device-1',
        userId,
        deviceType: 'ios',
        deviceModel: 'iPhone 15 Pro',
        deviceName: 'My iPhone',
        osVersion: '17.1.2',
        appVersion: '1.0.0',
        pushToken: 'mock-push-token-ios',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        syncState: {
          lastSyncTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          playerDataSynced: true,
          leagueDataSynced: true,
          rosterDataSynced: true,
          matchupDataSynced: true
        }
      },
      {
        id: 'device-2',
        userId,
        deviceType: 'android',
        deviceModel: 'Samsung Galaxy S23',
        deviceName: 'Galaxy S23',
        osVersion: 'Android 14',
        appVersion: '1.0.0',
        pushToken: 'mock-push-token-android',
        lastActive: new Date().toISOString(), // now
        syncState: {
          lastSyncTimestamp: new Date().toISOString(),
          playerDataSynced: true,
          leagueDataSynced: true,
          rosterDataSynced: true,
          matchupDataSynced: true
        }
      }
    ];
  }
}

export const mobileAppService = new MobileAppService();
export default mobileAppService;