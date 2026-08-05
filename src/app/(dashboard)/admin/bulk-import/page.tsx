import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BulkImportForm } from "@/components/enterprise/bulk-import-form";
import { assertRole } from "@/features/auth/user";

export default async function BulkImportPage() {
  await assertRole(["admin"]);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold">Bulk Import</h1>
        <p className="text-muted-foreground">Import students and faculty records from CSV files.</p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <BulkImportForm type="students" />
        </TabsContent>
        <TabsContent value="faculty">
          <BulkImportForm type="faculty" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
