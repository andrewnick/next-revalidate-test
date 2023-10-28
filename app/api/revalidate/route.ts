import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  console.log({ token });
  console.log("revalidating");

  revalidateTag("navigation");

  return Response.json({ message: "Success" });
}
