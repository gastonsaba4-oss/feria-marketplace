import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("marketplace");

  if (req.method === "GET") {
    const data = await store.get("main", { type: "json" });
    return Response.json(data || null);
  }

  if (req.method === "PUT") {
    const body = await req.json();
    await store.setJSON("main", body);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = { path: "/api/data" };
