import { supabase } from "./supabaseClient";

export async function isOwner(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return false;

  const { data, error } = await supabase
    .from("owners_allowlist")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (error) return false;
  return !!data?.email;
}
