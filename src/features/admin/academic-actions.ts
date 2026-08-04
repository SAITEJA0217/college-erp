"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


export async function getColleges() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("colleges").select("*").eq("is_archived", false);
  return data || [];
}

export async function createCollege(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("colleges")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/colleges");
  return { data };
}

export async function updateCollege(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("colleges")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/colleges");
  return { data };
}

export async function archiveCollege(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("colleges")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/colleges");
  return { success: true };
}

export async function getDepartments() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("departments").select("*").eq("is_archived", false);
  return data || [];
}

export async function createDepartment(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("departments")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/departments");
  return { data };
}

export async function updateDepartment(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("departments")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/departments");
  return { data };
}

export async function archiveDepartment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("departments")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/departments");
  return { success: true };
}

export async function getPrograms() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs").select("*").eq("is_archived", false);
  return data || [];
}

export async function createProgram(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/programs");
  return { data };
}

export async function updateProgram(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("programs")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/programs");
  return { data };
}

export async function archiveProgram(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("programs")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/programs");
  return { success: true };
}

export async function getAcademicYears() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academic_years").select("*").eq("is_archived", false);
  return data || [];
}

export async function createAcademicYear(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academic_years")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/academic-years");
  return { data };
}

export async function updateAcademicYear(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("academic_years")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/academic-years");
  return { data };
}

export async function archiveAcademicYear(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("academic_years")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/academic-years");
  return { success: true };
}

export async function getSemesters() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("semesters").select("*").eq("is_archived", false);
  return data || [];
}

export async function createSemester(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("semesters")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/semesters");
  return { data };
}

export async function updateSemester(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("semesters")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/semesters");
  return { data };
}

export async function archiveSemester(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("semesters")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/semesters");
  return { success: true };
}

export async function getSections() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sections").select("*").eq("is_archived", false);
  return data || [];
}

export async function createSection(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sections")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  return { data };
}

export async function updateSection(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sections")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  return { data };
}

export async function archiveSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("sections")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/sections");
  return { success: true };
}

export async function getSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects").select("*").eq("is_archived", false);
  return data || [];
}

export async function createSubject(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { data };
}

export async function updateSubject(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("subjects")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { data };
}

export async function archiveSubject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("subjects")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function getFacultyAssignments() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("faculty_assignments").select("*").eq("is_archived", false);
  return data || [];
}

export async function createFacultyAssignment(values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("faculty_assignments")
// @ts-expect-error
.insert([values]).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/faculty-assignments");
  return { data };
}

export async function updateFacultyAssignment(id: string, values: any) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("faculty_assignments")
// @ts-expect-error
.update(values).eq("id", id).select().single();
  if (error) return { error: error.message };
  revalidatePath("/admin/faculty-assignments");
  return { data };
}

export async function archiveFacultyAssignment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("faculty_assignments")
// @ts-expect-error
.update({ is_archived: true }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/faculty-assignments");
  return { success: true };
}
