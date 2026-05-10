import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/options";

export async function getServerAuthSession() {
  try {
    return await getServerSession(authOptions);
  } catch {
    return null;
  }
}
