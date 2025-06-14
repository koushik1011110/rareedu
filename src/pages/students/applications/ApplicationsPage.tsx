import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataTable, { Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Eye } from "lucide-react";
import { applyStudentsAPI, ApplyStudent, University, Course, AcademicSession } from "@/lib/supabase-database";
import StudentDetailView from "@/components/students/StudentDetailView";
import { universitiesAPI } from "@/lib/supabase-database";
import { coursesAPI } from "@/lib/supabase-database";
import { academicSessionsAPI } from "@/lib/supabase-database";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ApplicationsPage = () => {
  const [applications, setApplications] = useState<ApplyStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<ApplyStudent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);

  useEffect(() => {
    loadApplications();
    loadUniversities();
    loadCourses();
    loadAcademicSessions();
  }, []);

  const loadUniversities = async () => {
    try {
      const data = await universitiesAPI.getAll();
      setUniversities(data);
    } catch (error) {
      console.error('Error loading universities:', error);
    }
  };

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const loadAcademicSessions = async () => {
    try {
      const data = await academicSessionsAPI.getAll();
      setAcademicSessions(data);
    } catch (error) {
      console.error('Error loading academic sessions:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await applyStudentsAPI.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (student: ApplyStudent, newStatus: string) => {
    try {
      setLoading(true);
      const updatedStudent = await applyStudentsAPI.update(student.id, { 
        status: newStatus as 'pending' | 'approved' | 'cancelled',
        application_status: newStatus as 'pending' | 'approved' | 'cancelled'
      });
      
      if (updatedStudent) {
        await loadApplications();
        toast({
          title: "Success",
          description: `Application status updated to ${newStatus} successfully`,
        });
      } else {
        throw new Error('Failed to update application');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns: Column<ApplyStudent>[] = [
    {
      accessorKey: "first_name",
      header: "Student Name",
      cell: (row) => {
        const student = row;
        return `${student.first_name} ${student.last_name}`;
      },
    },
    {
      accessorKey: "created_at",
      header: "Application Date",
      cell: (row) => {
        return new Date(row.created_at).toLocaleDateString();
      },
    },
    {
      accessorKey: "course_id",
      header: "Program",
      cell: (row) => {
        const course = courses.find(c => c.id === row.course_id);
        const university = universities.find(u => u.id === row.university_id);
        return (
          <div>
            {course?.name} - {university?.name}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (row) => {
        const student = row;
        return getStatusBadge(student.status);
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: (row) => {
        const student = row;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedStudent(student);
                setShowDetailModal(true);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Select
              defaultValue={student.status}
              onValueChange={(value) => handleStatusChange(student, value)}
              disabled={loading}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Change Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
  ];

  const filteredApplications = applications.filter(application => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      application.first_name.toLowerCase().includes(searchTerm) ||
      application.last_name.toLowerCase().includes(searchTerm) ||
      application.email?.toLowerCase().includes(searchTerm) ||
      application.phone_number?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Student Applications"
        actions={[
          <Button
            key="search"
            variant="outline"
            onClick={() => {
              // Implement search functionality
            }}
          >
            <Search className="mr-2 h-4 w-4" />
            Search Applications
          </Button>,
          <Button
            key="new"
            onClick={() => {
              // Implement new application functionality
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Application
          </Button>,
        ]}
      />

      <Card>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Student Applications</h1>
            <div className="w-64">
              <Input
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredApplications}
            isLoading={loading}
          />
        </CardContent>
      </Card>

      {showDetailModal && selectedStudent && (
        <StudentDetailView
          student={selectedStudent as any}
          universities={universities}
          courses={courses}
          academicSessions={academicSessions}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </MainLayout>
  );
};

export default ApplicationsPage;
