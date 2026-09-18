"use client";

import { useEffect, useRef, useState } from "react";
import {
  DeviceValidationError,
  connectToVPetGo,
  disconnectVPetSession,
  flashFullVpgo,
  flashLightFirmware,
  supportsWebSerial,
  type LightFirmwareMetadata,
  type UpdateMode,
  type UpdatePhase,
  type VPetSession
} from "../lib/vpetFlasher";
import { FirmwareValidationError } from "../lib/vpgoPackage";
import styles from "./UpdaterPanel.module.css";

type UpdaterPanelCopy = {
  portTitle: string;
  selectPort: string;
  changePort: string;
  noDevice: string;
  connected: string;
  deviceLabel: string;
  lightTitle: string;
  lightDescription: string;
  fullTitle: string;
  fullDescription: string;
  lightAction: string;
  fullAction: string;
  fullConfirmation: string;
  progressLabel: string;
  status: {
    idle: string;
    connecting: string;
    ready: string;
    downloading: string;
    validating: string;
    erasing: string;
    flashing: string;
    finishing: string;
    complete: string;
  };
  errors: {
    unsupportedBrowser: string;
    wrongChip: string;
    wrongFlashSize: string;
    connectionFailed: string;
    firmwareUnavailable: string;
    invalidFirmware: string;
    updateFailed: string;
  };
};

type UpdaterPanelProps = {
  copy: UpdaterPanelCopy;
};

type UpdaterStatus =
  | "idle"
  | "connecting"
  | "ready"
  | "downloading"
  | "validating"
  | "erasing"
  | "flashing"
  | "finishing"
  | "complete";

export function UpdaterPanel({ copy }: UpdaterPanelProps) {
  const sessionRef = useRef<VPetSession | null>(null);
  const [serialSupported, setSerialSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [device, setDevice] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const busy = [
    "connecting",
    "downloading",
    "validating",
    "erasing",
    "flashing",
    "finishing"
  ].includes(status);
  const connected = sessionRef.current !== null;

  useEffect(() => {
    setSerialSupported(supportsWebSerial());

    return () => {
      void disconnectVPetSession(sessionRef.current);
      sessionRef.current = null;
    };
  }, []);

  async function selectPort() {
    setError(null);
    setProgress(0);
    setStatus("connecting");

    await disconnectVPetSession(sessionRef.current);
    sessionRef.current = null;

    try {
      const session = await connectToVPetGo();
      sessionRef.current = session;
      setDevice(session.chipName + " · " + session.flashSize);
      setStatus("ready");
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "NotFoundError") {
        setStatus("idle");
        return;
      }

      setDevice(null);
      setStatus("idle");
      setError(resolveConnectionError(caughtError));
    }
  }

  async function runUpdate(mode: UpdateMode) {
    const session = sessionRef.current;

    if (!session) {
      return;
    }

    if (mode === "full" && !window.confirm(copy.fullConfirmation)) {
      return;
    }

    setError(null);
    setProgress(0);
    setStatus("downloading");

    try {
      const response = await fetch("/api/firmware/" + mode, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("firmware-unavailable");
      }

      const firmware = new Uint8Array(await response.arrayBuffer());

      if (firmware.byteLength === 0) {
        throw new Error("firmware-unavailable");
      }

      const reportPhase = (phase: UpdatePhase) => {
        setStatus(phase);
      };

      if (mode === "light") {
        const metadata = readLightFirmwareMetadata(response);
        await flashLightFirmware(session, firmware, metadata, setProgress, reportPhase);
      } else {
        await flashFullVpgo(session, firmware, setProgress, reportPhase);
      }

      sessionRef.current = null;
      setStatus("finishing");
      setProgress(100);

      // Give the UI one frame to show the final state after the hard reset.
      window.setTimeout(() => {
        setStatus("complete");
      }, 150);
    } catch (caughtError) {
      await disconnectVPetSession(sessionRef.current);
      sessionRef.current = null;
      setStatus("idle");
      setProgress(0);

      if (caughtError instanceof FirmwareValidationError) {
        setError(copy.errors.invalidFirmware);
      } else if (caughtError instanceof Error && caughtError.message === "firmware-unavailable") {
        setError(copy.errors.firmwareUnavailable);
      } else {
        setError(copy.errors.updateFailed);
      }
    }
  }

  function resolveConnectionError(caughtError: unknown): string {
    if (caughtError instanceof DeviceValidationError) {
      if (caughtError.code === "unsupported-browser") {
        return copy.errors.unsupportedBrowser;
      }

      if (caughtError.code === "wrong-chip") {
        return copy.errors.wrongChip;
      }

      if (caughtError.code === "wrong-flash-size") {
        return copy.errors.wrongFlashSize;
      }
    }

    return copy.errors.connectionFailed;
  }

  const statusText =
    status === "idle"
      ? copy.status.idle
      : status === "connecting"
        ? copy.status.connecting
        : status === "ready"
          ? copy.status.ready
          : status === "downloading"
            ? copy.status.downloading
            : status === "validating"
              ? copy.status.validating
              : status === "erasing"
                ? copy.status.erasing
                : status === "flashing"
                  ? copy.status.flashing
                  : status === "finishing"
                    ? copy.status.finishing
                    : copy.status.complete;

  return (
    <div className={styles.panel}>
      <div className={styles.portSection}>
        <div>
          <span className={styles.kicker}>{copy.portTitle}</span>
          <strong className={styles.deviceState}>
            {device ? copy.connected : copy.noDevice}
          </strong>
          {device ? (
            <span className={styles.deviceDetails}>
              {copy.deviceLabel}: {device}
            </span>
          ) : null}
        </div>
        <button
          className={styles.portButton}
          disabled={busy || serialSupported === false}
          onClick={selectPort}
          type="button"
        >
          {device ? copy.changePort : copy.selectPort}
        </button>
      </div>

      {serialSupported === false ? (
        <p className={styles.error} role="alert">
          {copy.errors.unsupportedBrowser}
        </p>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <div className={styles.updateGrid}>
        <article className={styles.updateCard}>
          <div>
            <h2>{copy.lightTitle}</h2>
            <p>{copy.lightDescription}</p>
          </div>
          <button
            className={styles.lightButton}
            disabled={!connected || busy}
            onClick={() => void runUpdate("light")}
            type="button"
          >
            {copy.lightAction}
          </button>
        </article>

        <article className={styles.updateCard}>
          <div>
            <h2>{copy.fullTitle}</h2>
            <p>{copy.fullDescription}</p>
          </div>
          <button
            className={styles.fullButton}
            disabled={!connected || busy}
            onClick={() => void runUpdate("full")}
            type="button"
          >
            {copy.fullAction}
          </button>
        </article>
      </div>

      <div aria-live="polite" className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>{statusText}</span>
          <strong>{progress}%</strong>
        </div>
        <div
          aria-label={copy.progressLabel}
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={progress}
          className={styles.progressTrack}
          role="progressbar"
        >
          <div className={styles.progressFill} style={{ width: progress + "%" }} />
        </div>
      </div>
    </div>
  );
}

function readLightFirmwareMetadata(response: Response): LightFirmwareMetadata {
  const appOffset = Number(response.headers.get("X-VPet-App-Offset"));
  const sha256 = response.headers.get("X-VPet-SHA256") ?? "";
  const version = response.headers.get("X-VPet-Version") ?? "";
  const preservesLittleFs = response.headers.get("X-VPet-Preserves-LittleFS") === "true";

  if (!Number.isInteger(appOffset) || !sha256 || !version) {
    throw new FirmwareValidationError("Light firmware metadata is missing.");
  }

  return {
    appOffset,
    sha256,
    version,
    preservesLittleFs
  };
}
