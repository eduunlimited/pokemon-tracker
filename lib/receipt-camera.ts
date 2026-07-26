export function isCameraStreamActive(stream: MediaStream | null): boolean {
  const track = stream?.getVideoTracks()[0];
  return track?.readyState === "live";
}

export function stopCameraStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function selectReceiptCamera(cameras: MediaDeviceInfo[]): MediaDeviceInfo | undefined {
  const ranked = cameras
    .map((device) => {
      const label = device.label.toLowerCase();
      let score = 0;
      if (/back|rear|environment/.test(label)) score += 10;
      if (/wide/.test(label)) score += 5;
      if (/tele|zoom|ultra|0\.5|0,5|depth|front|selfie|user|facetime/.test(label)) {
        score -= 20;
      }
      return { device, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.device;
}

const baseVideoConstraints: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1920, min: 1280 },
  height: { ideal: 1080, min: 720 },
};

export async function acquireReceiptCameraStream(
  existing: MediaStream | null,
): Promise<MediaStream> {
  if (existing && isCameraStreamActive(existing)) {
    return existing;
  }

  stopCameraStream(existing);

  let stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: baseVideoConstraints,
  });

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const preferred = selectReceiptCamera(cameras);
    const activeDeviceId = stream.getVideoTracks()[0]?.getSettings().deviceId;

    if (preferred?.deviceId && preferred.deviceId !== activeDeviceId) {
      stopCameraStream(stream);
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: { exact: preferred.deviceId },
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
      });
    }
  } catch {
    // Keep the initial stream when device selection fails.
  }

  const track = stream.getVideoTracks()[0];
  if (track) {
    try {
      await track.applyConstraints({
        advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
      });
    } catch {
      // focusMode is not supported on every device.
    }
  }

  return stream;
}

export async function captureReceiptPhoto(
  stream: MediaStream,
  video: HTMLVideoElement,
): Promise<Blob | null> {
  const track = stream.getVideoTracks()[0];
  if (track && "ImageCapture" in window) {
    try {
      const ImageCaptureCtor = (
        window as Window & {
          ImageCapture: new (track: MediaStreamTrack) => {
            takePhoto: (settings?: PhotoSettings) => Promise<Blob>;
          };
        }
      ).ImageCapture;
      const capture = new ImageCaptureCtor(track);
      return await capture.takePhoto();
    } catch {
      // Fall back to canvas capture below.
    }
  }

  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.drawImage(video, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.95);
  });
}
