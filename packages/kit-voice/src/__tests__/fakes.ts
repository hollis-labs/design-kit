import { vi } from 'vitest'

/**
 * Browser fakes for jsdom, which has none of mediaDevices, MediaRecorder or Web Speech.
 * They record what the component did; none of them touches a real device.
 */

export interface FakeTrack {
  stop: ReturnType<typeof vi.fn>
}

export function fakeStream(): MediaStream & { tracks: FakeTrack[] } {
  const tracks: FakeTrack[] = [{ stop: vi.fn() }]
  return { tracks, getTracks: () => tracks } as unknown as MediaStream & { tracks: FakeTrack[] }
}

export function fakeDevice(deviceId: string, label: string, kind: MediaDeviceKind = 'audioinput'): MediaDeviceInfo {
  return { deviceId, label, kind, groupId: `group-${deviceId}`, toJSON: () => ({}) } as MediaDeviceInfo
}

/** Installs a fake `navigator.mediaDevices`. Call `restore()` in afterEach. */
export function installMediaDevices(options: {
  devices?: MediaDeviceInfo[]
  getUserMedia?: (constraints?: MediaStreamConstraints) => Promise<MediaStream>
} = {}) {
  const target = new EventTarget()
  const getUserMedia = vi.fn(options.getUserMedia ?? (async () => fakeStream()))
  const enumerateDevices = vi.fn(async () => options.devices ?? [])
  const mediaDevices = {
    getUserMedia,
    enumerateDevices,
    addEventListener: vi.fn((type: string, listener: EventListener) => target.addEventListener(type, listener)),
    removeEventListener: vi.fn((type: string, listener: EventListener) => target.removeEventListener(type, listener)),
  }
  const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: mediaDevices })
  return {
    ...mediaDevices,
    emitDeviceChange: () => target.dispatchEvent(new Event('devicechange')),
    restore: () => {
      if (original) Object.defineProperty(navigator, 'mediaDevices', original)
      else Reflect.deleteProperty(navigator, 'mediaDevices')
    },
  }
}

export function removeMediaDevices() {
  const original = Object.getOwnPropertyDescriptor(navigator, 'mediaDevices')
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined })
  return () => {
    if (original) Object.defineProperty(navigator, 'mediaDevices', original)
    else Reflect.deleteProperty(navigator, 'mediaDevices')
  }
}

export const settle = (ms = 60) => new Promise<void>((resolve) => setTimeout(resolve, ms))
