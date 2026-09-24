import { redirect } from "next/navigation";
import { getSessionUser, roleToRoute } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSessionUser();

  if (session) {
    redirect(roleToRoute(session.role));
  }

  redirect("/login");
}
