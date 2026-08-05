"use client";

import { useState } from "react";
import Papa from "papaparse";
import { Upload, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { importBulkData } from "@/features/enterprise/bulk-actions";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

type ImportType = "students" | "faculty";

export function BulkImportForm({ type }: { type: ImportType }) {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: any[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setHeaders(results.meta.fields || []);
        setData(results.data);
        setResults(null);
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`);
      }
    });
  };

  const handleImport = async () => {
    if (data.length === 0) return;
    setIsImporting(true);

    try {
      const formattedData = data.map(row => {
        if (type === "students") {
          return {
            ...row,
            batch_year: parseInt(row.batch_year),
          };
        } else {
          return {
            ...row,
            experience_years: parseInt(row.experience_years),
            is_hod: row.is_hod === "true" || row.is_hod === "1"
          };
        }
      });

      const response = await importBulkData(type, formattedData);
      
      if (response.success) {
        setResults({
          success: response.successCount || 0,
          errors: response.errors || []
        });
        toast.success(`Import completed: ${response.successCount} successful`);
      } else {
        toast.error(`Import failed: ${response.error}`);
      }
    } catch (error: any) {
      toast.error(`Import error: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Import {type === "students" ? "Students" : "Faculty"}</CardTitle>
        <CardDescription>Upload a CSV file to import multiple records at once.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!data.length && !results && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg border-muted-foreground/25 bg-muted/20">
            <Upload className="h-8 w-8 text-muted-foreground mb-4" />
            <div className="space-y-1 text-center">
              <h3 className="font-semibold text-sm">Upload CSV File</h3>
              <p className="text-sm text-muted-foreground">Select a file from your computer</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mt-6 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
            <div className="mt-4 text-xs text-muted-foreground text-center">
              <p>Required columns for {type}:</p>
              {type === "students" ? (
                <p>email, full_name, roll_number, department_id, semester_id, section_id, batch_year</p>
              ) : (
                <p>email, full_name, department_id, designation, qualification, experience_years, joining_date, employment_type</p>
              )}
            </div>
          </div>
        )}

        {data.length > 0 && !results && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium">Preview ({data.length} records found)</p>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => setData([])}>Cancel</Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Import
                </Button>
              </div>
            </div>
            <div className="border rounded-md">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map(h => <TableHead key={h}>{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.slice(0, 10).map((row, i) => (
                      <TableRow key={i}>
                        {headers.map(h => <TableCell key={`${i}-${h}`}>{row[h]}</TableCell>)}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              {data.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground bg-muted/30 border-t">
                  Showing first 10 records of {data.length}
                </div>
              )}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-6 flex items-center space-x-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">Successfully Imported</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300">{results.success}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-destructive/10 border-destructive/20">
                <CardContent className="p-6 flex items-center space-x-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Failed to Import</p>
                    <p className="text-2xl font-bold text-destructive">{results.errors.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {results.errors.length > 0 && (
              <div className="border rounded-md">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Email / Identifier</TableHead>
                        <TableHead>Error message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.errors.map((err, i) => (
                        <TableRow key={i}>
                          <TableCell>{err.index + 2}</TableCell>
                          <TableCell>{err.row.email || err.row.roll_number}</TableCell>
                          <TableCell className="text-destructive font-medium">{err.error}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button onClick={() => { setData([]); setResults(null); }}>Import Another File</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
