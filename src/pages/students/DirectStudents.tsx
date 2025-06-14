import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import EditModal from "@/components/shared/EditModal";
import StudentDetailView from "@/components/students/StudentDetailView";
import SupabaseDirectStudentForm, { SupabaseDirectStudentFormData } from "@/components/forms/SupabaseDirectStudentForm";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye } from "lucide-react";
import { studentsAPI, universitiesAPI, coursesAPI, academicSessionsAPI, Student, University, Course, AcademicSession } from "@/lib/supabase-database";

const DirectStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, universitiesData, coursesData, sessionsData] = await Promise.all([
        studentsAPI.getAll(),
        universitiesAPI.getAll(),
        coursesAPI.getAll(),
        academicSessionsAPI.getAll(),
      ]);

      setStudents(studentsData);
      setUniversities(universitiesData);
      setCourses(coursesData);
      setAcademicSessions(sessionsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load students data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (studentData: SupabaseDirectStudentFormData) => {
    try {
      setIsSubmitting(true);
      const newStudent = await studentsAPI.create(studentData);
      setStudents(prev => [newStudent, ...prev]);
      toast({
        title: "Student Added",
        description: `${newStudent.first_name} ${newStudent.last_name} has been added successfully with admission number ${newStudent.admission_number}.`,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (studentData: SupabaseDirectStudentFormData) => {
    if (!selectedStudent) return;
    
    try {
      setIsSubmitting(true);
      const updatedStudent = await studentsAPI.update(selectedStudent.id, studentData);
      setStudents(prev => prev.map(student => 
        student.id === selectedStudent.id ? updatedStudent : student
      ));
      toast({
        title: "Student Updated",
        description: `${updatedStudent.first_name} ${updatedStudent.last_name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await studentsAPI.delete(id);
      setStudents(prev => prev.filter(student => student.id !== id));
      toast({
        title: "Student Deleted",
        description: "Student has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsEditModalOpen(true);
  };

  const getUniversityName = (id: number) => {
    return universities.find(u => u.id === id)?.name || 'Unknown';
  };

  const getCourseName = (id: number) => {
    return courses.find(c => c.id === id)?.name || 'Unknown';
  };

  const getSessionName = (id: number) => {
    return academicSessions.find(s => s.id === id)?.session_name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: "default" as const, color: "text-green-600" },
      inactive: { variant: "secondary" as const, color: "text-gray-600" },
      completed: { variant: "outline" as const, color: "text-blue-600" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns: Column<Student>[] = [
    { 
      header: "Admission No.", 
      accessorKey: "admission_number",
      cell: (student: Student) => (
        <span className="font-mono text-sm">{student.admission_number || 'N/A'}</span>
      )
    },
    { 
      header: "Name", 
      accessorKey: "first_name",
      cell: (student: Student) => `${student.first_name} ${student.last_name}`
    },
    { 
      header: "Father's Name", 
      accessorKey: "father_name" 
    },
    { 
      header: "University", 
      accessorKey: "university_id",
      cell: (student: Student) => getUniversityName(student.university_id)
    },
    { 
      header: "Course", 
      accessorKey: "course_id",
      cell: (student: Student) => getCourseName(student.course_id)
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (student: Student) => getStatusBadge(student.status)
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (student: Student) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(student)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEditClick(student)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteStudent(student.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <PageHeader
          title="Direct Students"
          description="Manage students admitted directly to universities"
        />
        <div>Loading...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageHeader
        title="Direct Students"
        description="Manage students who are directly admitted"
        actions={
          <Button onClick={() => setIsEditModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        }
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
              <CardDescription>
            A list of all directly admitted students
              </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={students}
            isLoading={loading}
            searchPlaceholder="Search students..."
          />
        </CardContent>
      </Card>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedStudent(null);
        }}
        title={selectedStudent ? "Edit Student" : "Add New Student"}
      >
        <SupabaseDirectStudentForm
          onSubmit={selectedStudent ? handleEditStudent : handleAddStudent}
          initialData={selectedStudent ? {
            id: selectedStudent.id,
            first_name: selectedStudent.first_name,
            last_name: selectedStudent.last_name,
            father_name: selectedStudent.father_name,
            mother_name: selectedStudent.mother_name,
            date_of_birth: selectedStudent.date_of_birth,
            phone_number: selectedStudent.phone_number || "",
            email: selectedStudent.email || "",
            university_id: selectedStudent.university_id,
            course_id: selectedStudent.course_id,
            academic_session_id: selectedStudent.academic_session_id,
            status: selectedStudent.status as "active" | "inactive" | "completed",
          } : undefined}
          isSubmitting={isSubmitting}
          universities={universities}
          courses={courses}
          academicSessions={academicSessions}
        />
      </EditModal>

      <StudentDetailView
        student={selectedStudent}
        universities={universities}
        courses={courses}
        academicSessions={academicSessions}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudent(null);
        }}
      />
    </MainLayout>
  );
};

export default DirectStudents;
