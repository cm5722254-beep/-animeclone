import { User, CharacterVoice, TimelineSegment, ProjectFile, StudioConfig, VoxcpmStatus, VideoDownloadResult } from '../types';

const API_BASE = '';

function getAuthToken(): string | null {
  return localStorage.getItem('studio_auth_token');
}

export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = res.statusText;
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (body: { username: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  register: (body: { username: string; password: string }) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  logout: () => request('/api/auth/logout', { method: 'POST' }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  adminListUsers: () => request<{ users: User[] }>('/api/admin/users'),

  adminSetPremium: (userId: number, days: number) =>
    request('/api/admin/set-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, days }),
    }),

  // Config & System
  getConfig: () => request<StudioConfig>('/api/config'),

  updateConfig: (body: any) =>
    request('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getVoxcpmStatus: () => request<VoxcpmStatus>('/api/voxcpm/status'),

  switchVoxcpmMode: (mode: string, cloudUrl?: string) =>
    request('/api/voxcpm/switch-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, cloudUrl }),
    }),

  switchMode: (mode: string, cloudUrl?: string) =>
    request('/api/voxcpm/switch-mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, cloudUrl }),
    }),

  getElevenlabsStatus: () => request<any>('/api/elevenlabs/status'),
  getElevenlabsVoices: () => request<any>('/api/elevenlabs/voices'),
  cloneElevenVoice: (voiceName: string, sampleFilename: string) =>
    request<{ success: boolean; voiceId: string; voiceName: string }>('/api/elevenlabs/clone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceName, sampleFilename }),
    }),

  getNetworkInfo: () => request<any>('/api/system/network-info'),

  getOutputStats: () => request<{ count: number; totalBytes: number; formattedSize: string }>('/api/outputs/stats'),


  clearOutputs: () => request<{ success: boolean; count: number; formattedFreed: string }>('/api/outputs/clear', { method: 'POST' }),

  // Media & Files
  uploadMedia: (file: File) => {
    const fd = new FormData();
    fd.append('mediaFile', file);
    return request<{ success: boolean; file: ProjectFile; filename: string; url: string }>('/api/upload', {
      method: 'POST',
      body: fd,
    });
  },
  uploadFile: (
    file: File,
    onProgress?: (percent: number, loaded: number, total: number) => void
  ): Promise<{ success: boolean; file: ProjectFile; filename: string; url: string }> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append('mediaFile', file);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent, e.loaded, e.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (err) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            reject(new Error(errJson.detail || errJson.message || `Upload failed with status ${xhr.status}`));
          } catch (_) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.open('POST', '/api/upload');

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(fd);
    });
  },

  getFiles: () => request<ProjectFile[]>('/api/files'),

  deleteFile: (filename: string) =>
    request<{ success: boolean; message: string }>(`/api/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    }),

  clearAllFiles: () =>
    request<{ success: boolean; count: number; formattedFreed: string; message: string }>('/api/files/clear', {
      method: 'POST',
    }),

  // Characters
  getCharacters: () => request<{ success: boolean; count: number; characters: CharacterVoice[]; isFree: boolean }>('/api/characters/all'),

  createCharacter: (fd: FormData) => request('/api/characters/create', { method: 'POST', body: fd }),

  updateCharacter: (body: any) =>
    request('/api/characters/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  characterSpeak: (body: { voiceId: string; text: string; emotion?: string; gender?: string }) =>
    request<{ success: boolean; audioUrl: string }>('/api/character/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  // Video Downloader
  downloadVideo: (url: string, quality = 'best') =>
    request<VideoDownloadResult>('/api/video/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, quality }),
    }),

  // Dubbing
  startDubbing: (body: any) =>
    request<{ success: boolean; jobId: string }>('/api/dubbing/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  getDubbingStatus: (jobId: string) => request<any>(`/api/dubbing/status/${jobId}`),

  scanTimeline: (filename: string, scope = 'full') =>
    request<{ success: boolean; duration: number; segments: TimelineSegment[] }>('/api/dubbing/scan-timeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, scope }),
    }),

  generateLine: (body: { text: string; lineIndex?: number; gender?: string; voiceId?: string; speakerId?: string; emotion?: string }) =>
    request<{ success: boolean; lineIndex: number; audioUrl: string }>('/api/dubbing/generate-line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),

  assembleCustom: (params: { filename: string; segments: TimelineSegment[]; bgmAudio?: string; removeOriginalVocals?: boolean; vocalGain?: number; bgmGain?: number }) =>
    request<{ success: boolean; outputVideo: string; outputAudio: string; totalLinesDubbed: number }>('/api/dubbing/assemble-custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }),

  // Translation
  translate: (text: string, sourceLang = 'zh', targetLang = 'km') =>
    request<{ translation: string }>('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, sourceLang, targetLang }),
    }),

  // Audio Mixer
  separateAudio: (filename: string, preferAi = true) =>
    request<{ success: boolean; engine: string; vocalsUrl: string; bgmUrl: string }>('/api/audio/separate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, preferAi }),
    }),
};
