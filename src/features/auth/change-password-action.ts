"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function changePasswordAction(newPassword: string) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      return { error: "Authentication required to change password." };
    }

    const userId = userData.user.id;

    // Update the password securely via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return { error: updateError.message };
    }

    // Use admin client to bypass RLS if necessary, though the user should be able to update their own profile if RLS permits
    const adminClient = createAdminClient();
    const { error: profileError } = await adminClient
      .from("profiles")
      // @ts-expect-error local schema not updated
      .update({ must_change_password: false })
      .eq("id", userId);

    if (profileError) {
      console.error("Failed to update must_change_password flag:", profileError);
      // We don't return an error here because the password WAS changed successfully.
      // Next time they login, they might get stuck if this failed, but it's an admin operation edge case.
    }

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." };
  }
}
