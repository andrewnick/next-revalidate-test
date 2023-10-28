import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  console.log({ token });
  console.log("revalidating");

  revalidateTag("navigation");

  await fetch("https://next-revalidate-test-delta.vercel.app/");
  // const data = await response.json();
  // console.log({ data });

  return Response.json({ message: "Success" });
}

export async function POST(req: Request) {
  console.log("revalidating post");
  revalidateTag("navigation");
  return Response.json({ revalidated: true, now: Date.now() });
}
