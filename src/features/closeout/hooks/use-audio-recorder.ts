import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Audio, InterruptionModeAndroid, InterruptionModeIOS, type AVPlaybackStatus } from 'expo-av';

type AudioPermissionStatus = 'unknown' | 'granted' | 'denied';
type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused';

export type RecordedAudioClip = {
  localUri: string;
  fileName: string;
  mimeType: string;
  durationSeconds: number;
  recordedAt: string;
};

type UseAudioRecorderResult = {
  clip: RecordedAudioClip | null;
  errorMessage: string | null;
  permissionStatus: AudioPermissionStatus;
  playbackState: AudioPlaybackState;
  recordingSeconds: number;
  recordingState: 'idle' | 'recording' | 'paused' | 'recorded';
  ensurePermission: () => Promise<boolean>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
  stopPlayback: () => Promise<void>;
  stopRecording: () => Promise<RecordedAudioClip | null>;
  togglePlayback: (uri: string) => Promise<void>;
  discardClip: () => Promise<void>;
};

function inferAudioMimeType(uri: string) {
  const normalizedUri = uri.toLowerCase();

  if (normalizedUri.endsWith('.wav')) {
    return 'audio/wav';
  }

  if (normalizedUri.endsWith('.mp3')) {
    return 'audio/mpeg';
  }

  if (normalizedUri.endsWith('.caf')) {
    return 'audio/x-caf';
  }

  return 'audio/mp4';
}

export function useAudioRecorder(): UseAudioRecorderResult {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const activePlaybackUriRef = useRef<string | null>(null);

  const [clip, setClip] = useState<RecordedAudioClip | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<AudioPermissionStatus>('unknown');
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>('idle');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'recorded'>('idle');

  const cleanupSound = useCallback(async () => {
    if (!soundRef.current) {
      activePlaybackUriRef.current = null;
      setPlaybackState('idle');
      return;
    }

    await soundRef.current.unloadAsync();
    soundRef.current.setOnPlaybackStatusUpdate(null);
    soundRef.current = null;
    activePlaybackUriRef.current = null;
    setPlaybackState('idle');
  }, []);

  useEffect(() => {
    return () => {
      void cleanupSound();

      if (recordingRef.current) {
        void recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, [cleanupSound]);

  const ensurePermission = useCallback(async () => {
    const existing = await Audio.getPermissionsAsync();

    if (existing.granted) {
      setPermissionStatus('granted');
      return true;
    }

    const requested = await Audio.requestPermissionsAsync();
    const nextStatus: AudioPermissionStatus = requested.granted ? 'granted' : 'denied';
    setPermissionStatus(nextStatus);
    return requested.granted;
  }, []);

  const startRecording = useCallback(async () => {
    setErrorMessage(null);

    const granted = await ensurePermission();
    if (!granted) {
      return;
    }

    await cleanupSound();

    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      recordingRef.current = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    const recording = new Audio.Recording();
    recording.setProgressUpdateInterval(250);
    recording.setOnRecordingStatusUpdate((status) => {
      setRecordingSeconds(Math.floor((status.durationMillis ?? 0) / 1000));

      if (status.isRecording) {
        setRecordingState('recording');
        return;
      }

      if (status.canRecord) {
        setRecordingState('paused');
      }
    });

    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    recordingRef.current = recording;
    setClip(null);
    setRecordingSeconds(0);
    setRecordingState('recording');
  }, [cleanupSound, ensurePermission]);

  const pauseRecording = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    await recordingRef.current.pauseAsync();
    setRecordingState('paused');
  }, []);

  const resumeRecording = useCallback(async () => {
    if (!recordingRef.current) {
      return;
    }

    await recordingRef.current.startAsync();
    setRecordingState('recording');
  }, []);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const status = await recording.getStatusAsync();
    const uri = recording.getURI();
    recordingRef.current = null;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    });

    if (!uri) {
      setRecordingState('idle');
      setRecordingSeconds(0);
      setErrorMessage('ProofFlow could not save that recording. Try again.');
      return null;
    }

    const fileName = uri.split('/').pop() ?? `voice-note-${Date.now()}.m4a`;
    const nextClip = {
      localUri: uri,
      fileName,
      mimeType: inferAudioMimeType(uri),
      durationSeconds: Math.max(1, Math.round((status.durationMillis ?? 0) / 1000)),
      recordedAt: new Date().toISOString(),
    } satisfies RecordedAudioClip;

    setClip(nextClip);
    setRecordingState('recorded');
    setRecordingSeconds(nextClip.durationSeconds);
    return nextClip;
  }, []);

  const discardClip = useCallback(async () => {
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
      recordingRef.current = null;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: false,
    }).catch(() => undefined);

    await cleanupSound();

    setClip(null);
    setErrorMessage(null);
    setRecordingSeconds(0);
    setRecordingState('idle');
  }, [cleanupSound]);

  const stopPlayback = useCallback(async () => {
    await cleanupSound();
  }, [cleanupSound]);

  const togglePlayback = useCallback(
    async (uri: string) => {
      if (!uri) {
        return;
      }

      setErrorMessage(null);

      if (soundRef.current && activePlaybackUriRef.current === uri) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlaybackState('paused');
          return;
        }

        await soundRef.current.playAsync();
        setPlaybackState('playing');
        return;
      }

      await cleanupSound();
      setPlaybackState('loading');

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) {
            return;
          }

          if (status.didJustFinish) {
            setPlaybackState('idle');
            activePlaybackUriRef.current = null;
            return;
          }

          setPlaybackState(status.isPlaying ? 'playing' : 'paused');
        },
      );

      soundRef.current = sound;
      activePlaybackUriRef.current = uri;
      setPlaybackState('playing');
    },
    [cleanupSound],
  );

  return useMemo(
    () => ({
      clip,
      errorMessage,
      permissionStatus,
      playbackState,
      recordingSeconds,
      recordingState,
      discardClip,
      ensurePermission,
      pauseRecording,
      resumeRecording,
      startRecording,
      stopPlayback,
      stopRecording,
      togglePlayback,
    }),
    [
      clip,
      discardClip,
      ensurePermission,
      errorMessage,
      pauseRecording,
      permissionStatus,
      playbackState,
      recordingSeconds,
      recordingState,
      resumeRecording,
      startRecording,
      stopPlayback,
      stopRecording,
      togglePlayback,
    ],
  );
}
