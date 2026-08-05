"use server";

import { assertRole } from "@/features/auth/user";
import { createStudent, createFaculty } from "@/features/admin/user-actions";
import { revalidatePath } from "next/cache";

export async function importBulkData(type: "students" | "faculty", records: any[]) {
  try {
    await assertRole(["admin"]);
    
    let successCount = 0;
    const errors: { index: number; row: any; error: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      let res;
      
      try {
        if (type === "students") {
          res = await createStudent(row);
        } else {
          res = await createFaculty(row);
        }

        if (res?.error) {
          errors.push({ index: i, row, error: res.error });
        } else {
          successCount++;
        }
      } catch (e: any) {
        errors.push({ index: i, row, error: e.message || "Unknown error" });
      }
    }

    if (type === "students") revalidatePath("/admin/students");
    if (type === "faculty") revalidatePath("/admin/faculty");
    
    return { success: true, successCount, errors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
