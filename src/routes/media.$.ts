import { createFileRoute } from "@tanstack/react-router";
import { getMediaFile } from "@/lib/cms/server/repo.server";

/** Serves images uploaded through the admin media library: /media/{id}/{filename} */
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = (params._splat ?? "").split("/")[0] ?? "";
        const file = id ? await getMediaFile(id) : null;
        if (!file) return new Response("Not found", { status: 404 });
        return new Response(file.bytes as BodyInit, {
          headers: {
            "Content-Type": file.item.contentType,
            "Content-Length": String(file.bytes.byteLength),
            // Media ids are immutable, so files can be cached indefinitely.
            "Cache-Control": "public, max-age=31536000, immutable",
            // Let the hosting CDN keep a copy so images aren't re-read from the database.
            "CDN-Cache-Control": "public, max-age=31536000, immutable",
            "Netlify-CDN-Cache-Control": "public, durable, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
