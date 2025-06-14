
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import DataTable from "@/components/ui/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import DetailViewModal from "@/components/shared/DetailViewModal";
import EditModal from "@/components/shared/EditModal";
import HostelForm, { HostelFormData } from "@/components/forms/HostelForm";
import { hostelsAPI, Hostel } from "@/lib/hostels-api";

const HostelManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentHostel, setCurrentHostel] = useState<Hostel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHostels();
  }, []);

  const loadHostels = async () => {
    try {
      setLoading(true);
      const data = await hostelsAPI.getAll();
      setHostels(data);
    } catch (error) {
      console.error('Error loading hostels:', error);
      toast({
        title: "Error",
        description: "Failed to load hostels data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredData = hostels.filter(
    (hostel) => hostel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewHostel = (hostel: Hostel) => {
    setCurrentHostel(hostel);
    setIsViewModalOpen(true);
  };

  const handleEditHostel = (hostel: Hostel) => {
    setCurrentHostel(hostel);
    setIsEditModalOpen(true);
  };

  const handleAddHostel = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveHostel = async (formData: HostelFormData) => {
    setIsSubmitting(true);
    
    try {
      if (formData.id) {
        await hostelsAPI.update(formData.id, formData);
        toast({
          title: "Hostel Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await hostelsAPI.create(formData);
        toast({
          title: "Hostel Added",
          description: `${formData.name} has been added successfully.`,
        });
      }
      
      await loadHostels();
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error saving hostel:', error);
      toast({
        title: "Error",
        description: "Failed to save hostel data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const columns = [
    { header: "Hostel Name", accessorKey: "name" as keyof Hostel },
    { header: "Location", accessorKey: "location" as keyof Hostel },
    { header: "Capacity", accessorKey: "capacity" as keyof Hostel },
    { header: "Occupancy", accessorKey: "current_occupancy" as keyof Hostel },
    { 
      header: "Monthly Rent", 
      accessorKey: "monthly_rent" as keyof Hostel,
      cell: (row: Hostel) => `$${row.monthly_rent}`
    },
    { header: "Contact Person", accessorKey: "contact_person" as keyof Hostel },
    {
      header: "Status",
      accessorKey: "status" as keyof Hostel,
      cell: (row: Hostel) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            row.status === "Active"
              ? "bg-green-100 text-green-800"
              : row.status === "Maintenance"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions" as "actions",
      cell: (row: Hostel) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleViewHostel(row)}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleEditHostel(row)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading hostels...</div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <PageHeader
        title="Hostel Management"
        description="Manage student accommodations and hostel facilities"
        actions={
          <Button variant="default" size="sm" onClick={handleAddHostel}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hostel
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hostels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hostels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hostels.reduce((sum, hostel) => sum + hostel.capacity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Occupancy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {hostels.reduce((sum, hostel) => sum + hostel.current_occupancy, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((hostels.reduce((sum, hostel) => sum + hostel.current_occupancy, 0) / 
                hostels.reduce((sum, hostel) => sum + hostel.capacity, 0)) * 100)}% occupied
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hostels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="rounded-lg border bg-card shadow-sm">
        <DataTable columns={columns} data={filteredData} />
      </div>

      {/* Add Hostel Modal */}
      <EditModal
        title="Add New Hostel"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <HostelForm 
          onSubmit={handleSaveHostel}
          isSubmitting={isSubmitting}
        />
      </EditModal>

      {/* View Hostel Modal */}
      {currentHostel && (
        <DetailViewModal
          title={`Hostel: ${currentHostel.name}`}
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Hostel Name</h3>
              <p>{currentHostel.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p>{currentHostel.location}</p>
            </div>
            <div>
              <h3 className="font-semibold">Capacity</h3>
              <p>{currentHostel.capacity}</p>
            </div>
            <div>
              <h3 className="font-semibold">Current Occupancy</h3>
              <p>{currentHostel.current_occupancy}</p>
            </div>
            <div>
              <h3 className="font-semibold">Monthly Rent</h3>
              <p>${currentHostel.monthly_rent}</p>
            </div>
            <div>
              <h3 className="font-semibold">Contact Person</h3>
              <p>{currentHostel.contact_person || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p>{currentHostel.phone || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{currentHostel.email || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{currentHostel.status}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold">Address</h3>
              <p>{currentHostel.address || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="font-semibold">Facilities</h3>
              <p>{currentHostel.facilities || 'N/A'}</p>
            </div>
          </div>
        </DetailViewModal>
      )}

      {/* Edit Hostel Modal */}
      {currentHostel && (
        <EditModal
          title={`Edit Hostel: ${currentHostel.name}`}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <HostelForm 
            defaultValues={{
              id: currentHostel.id,
              name: currentHostel.name,
              location: currentHostel.location,
              capacity: currentHostel.capacity.toString(),
              monthly_rent: currentHostel.monthly_rent.toString(),
              contact_person: currentHostel.contact_person || '',
              phone: currentHostel.phone || '',
              email: currentHostel.email || '',
              address: currentHostel.address || '',
              facilities: currentHostel.facilities || '',
              status: currentHostel.status,
            }}
            onSubmit={handleSaveHostel}
            isSubmitting={isSubmitting}
          />
        </EditModal>
      )}
    </MainLayout>
  );
};

export default HostelManagement;
