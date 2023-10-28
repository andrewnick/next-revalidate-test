import { revalidateTag } from "next/cache";

export async function GET() {
  revalidateTag("navigation");

  return Response.json({ message: "Success" });
}
