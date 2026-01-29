/**
 * Background script for handling audio recording with VAD integration
 * This script runs in the service worker context and manages:
 * 1. Microphone permission management
 */

interface AudioRecordingState {
  isRecording: boolean;
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
  processor: AudioWorkletNode | null;
  vadProcessor: AudioWorkletNode | null;
  startTime: number;
  sessionId: string;
  chunks: AudioChunk[];
}

interface AudioChunk {
  data: Float32Array;
  timestamp: number;
  duration: number;
  isVoice: boolean;
}

interface PermissionResult {
  granted: boolean;
  message?: string;
  micType: string; // 'granted', 'prompt', 'denied', 'unknown'
  requiresUserAction?: boolean;
}

class AudioRecordingManager {
  private state: AudioRecordingState = {
    isRecording: false,
    audioContext: null,
    mediaStream: null,
    processor: null,
    vadProcessor: null,
    startTime: 0,
    sessionId: '',
    chunks: [],
  };

  /**
   * Check and request microphone permissions
   */
  async checkMicrophonePermission(): Promise<PermissionResult> {
    try {
      // First check navigator permissions
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      });

      console.log('Microphone permission status:', permissionStatus.state);

      switch (permissionStatus.state) {
        case 'granted':
          return { granted: true, micType: 'granted' };

        case 'prompt':
          return {
            granted: false,
            micType: 'prompt',
            message: 'Microphone access needed. Click allow when prompted.',
            requiresUserAction: true,
          };

        case 'denied':
          return {
            granted: false,
            micType: 'denied',
            message: 'Microphone access blocked. Please enable in browser settings.',
            requiresUserAction: true,
          };

        default:
          return {
            granted: false,
            micType: 'unknown',
            message: 'Unable to determine microphone permission status.',
          };
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return {
        granted: false,
        micType: 'unknown',
        message: 'Error checking microphone permissions.',
      };
    }
  }
}

// Create global instance
const audioRecordingManager = new AudioRecordingManager();

// Export for use in background script
export default audioRecordingManager;
