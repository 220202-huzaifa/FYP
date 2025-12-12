import { DIDClient } from "@d-id/client-sdk";

export async function POST(req) {
  const { text } = await req.json();

  const client = new DIDClient({
    apiKey: process.env.DID_API_KEY,
  });

  const result = await client.videos.create({
    script: {
      type: "text",
      input: text,
    },
    presenter: "amy", // default avatar
  });

  return Response.json(result);
}
