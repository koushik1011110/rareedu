import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Student, University, Course, AcademicSession } from "@/lib/supabase-database";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

interface StudentDetailViewProps {
  student: Student | null;
  universities: University[];
  courses: Course[];
  academicSessions: AcademicSession[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (student: Student) => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  universities,
  courses,
  academicSessions,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!student) return null;

  const getUniversityName = (id: number) => {
    return universities.find(u => u.id === id)?.name || 'Unknown';
  };

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name || 'Unknown';
  };

  const getSessionName = (id: number) => {
    return academicSessions.find(s => s.id === id)?.session_name || 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="academic">Academic Info</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 flex justify-center">
                    {student.photo_url ? (
                      <div className="relative w-48 h-48">
                        <img
                          src={student.photo_url}
                          alt={`${student.first_name}'s photo`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                        No Photo
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {student.first_name} {student.last_name}</p>
                    <p><strong>Father's Name:</strong> {student.father_name}</p>
                    <p><strong>Mother's Name:</strong> {student.mother_name}</p>
                    <p><strong>Date of Birth:</strong> {format(new Date(student.date_of_birth), 'PPP')}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Phone:</strong> {student.phone_number || 'N/A'}</p>
                    <p><strong>Email:</strong> {student.email || 'N/A'}</p>
                    <p><strong>Status:</strong> {student.status}</p>
                    <p><strong>Admission Number:</strong> {student.admission_number || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>University:</strong> {getUniversityName(student.university_id)}</p>
                    <p><strong>Course:</strong> {getCourseName(student.course_id)}</p>
                    <p><strong>Academic Session:</strong> {getSessionName(student.academic_session_id)}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>12th Marks:</strong> {student.twelfth_marks || 'N/A'}</p>
                    <p><strong>Seat Number:</strong> {student.seat_number || 'N/A'}</p>
                    <p><strong>Scores:</strong> {student.scores || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.passport_copy_url && (
                    <div className="space-y-2">
                      <p><strong>Passport Copy:</strong></p>
                      <div className="relative w-full h-48 border rounded overflow-hidden">
                        <img
                          src={student.passport_copy_url}
                          alt="Passport Copy"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {student.aadhaar_copy_url && (
                    <div className="space-y-2">
                      <p><strong>Aadhaar Card:</strong></p>
                      <div className="relative w-full h-48 border rounded overflow-hidden">
                        <img
                          src={student.aadhaar_copy_url}
                          alt="Aadhaar Card"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {student.twelfth_certificate_url && (
                    <div className="space-y-2 col-span-2">
                      <p><strong>12th Certificate:</strong></p>
                      <div className="relative w-full h-48 border rounded overflow-hidden">
                        <img
                          src={student.twelfth_certificate_url}
                          alt="12th Certificate"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  {!student.passport_copy_url && !student.aadhaar_copy_url && !student.twelfth_certificate_url && (
                    <p className="col-span-2 text-center text-gray-500">No documents uploaded</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Address:</strong> {student.address || 'N/A'}</p>
                  <p><strong>City:</strong> {student.city || 'N/A'}</p>
                  <p><strong>Country:</strong> {student.country || 'N/A'}</p>
                  <p><strong>Aadhaar Number:</strong> {student.aadhaar_number || 'N/A'}</p>
                  <p><strong>Passport Number:</strong> {student.passport_number || 'N/A'}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
        <DialogFooter className="border-t p-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailView;