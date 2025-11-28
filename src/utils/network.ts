import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkError } from './errors';

/**
 * Network Connectivity Detection
 *
 * Implements T032: Network connectivity detection with NetInfo
 * Supports offline mode detection per plan.md Offline Mode specifications
 */

let currentNetworkState: NetInfoState | null = null;

/**
 * Initialize network listener
 */
export function initializeNetworkListener() {
  return NetInfo.addEventListener(state => {
    currentNetworkState = state;
    console.log('Network state changed:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
    });
  });
}

/**
 * Check if device is connected to internet
 */
export async function isConnected(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

/**
 * Check if device is offline
 */
export async function isOffline(): Promise<boolean> {
  return !(await isConnected());
}

/**
 * Get current network state
 */
export async function getNetworkState(): Promise<NetInfoState> {
  return await NetInfo.fetch();
}

/**
 * Check if connected to WiFi
 * Used for background photo sync (NFR-025: avoid cellular data charges)
 */
export async function isConnectedToWiFi(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.type === 'wifi' && state.isConnected === true;
}

/**
 * Check if connected to cellular data
 */
export async function isConnectedToCellular(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.type === 'cellular' && state.isConnected === true;
}

/**
 * Ensure internet connection before proceeding
 * Throws NetworkError if offline
 */
export async function requireConnection(): Promise<void> {
  const connected = await isConnected();
  if (!connected) {
    throw new NetworkError();
  }
}

/**
 * Ensure WiFi connection before proceeding
 * Used for large uploads/downloads to avoid cellular charges
 */
export async function requireWiFi(): Promise<void> {
  const wifi = await isConnectedToWiFi();
  if (!wifi) {
    throw new Error('WiFi connection required for this operation');
  }
}

/**
 * Execute function only if online, otherwise throw error
 */
export async function whenOnline<T>(fn: () => Promise<T>): Promise<T> {
  await requireConnection();
  return fn();
}

/**
 * Execute function only if on WiFi, otherwise throw error
 */
export async function whenOnWiFi<T>(fn: () => Promise<T>): Promise<T> {
  await requireWiFi();
  return fn();
}
