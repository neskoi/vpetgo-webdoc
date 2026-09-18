import {
  fetchFirmwareFromDrive,
  isFirmwareMode
} from "@/features/updater/server/googleDriveFirmware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mode: string }> }
) {
  const { mode } = await context.params;

  if (!isFirmwareMode(mode)) {
    return Response.json(
      { error: "Unknown firmware mode." },
      {
        status: 404,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  try {
    const delivery = await fetchFirmwareFromDrive(mode);
    const driveResponse = delivery.response;

    if (!driveResponse.ok || !driveResponse.body) {
      console.error("Google Drive firmware request failed.", {
        mode,
        status: driveResponse.status
      });

      return unavailableResponse();
    }

    const headers = new Headers({
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Type": "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      ...delivery.metadataHeaders
    });
    const contentLength = driveResponse.headers.get("content-length");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new Response(driveResponse.body, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Firmware delivery failed.", error);
    return unavailableResponse();
  }
}

function unavailableResponse(): Response {
  return Response.json(
    { error: "Firmware is temporarily unavailable." },
    {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
