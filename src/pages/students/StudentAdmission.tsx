import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Upload, User, GraduationCap, Phone, Mail, Users, MapPin, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const StudentAdmission = () => {
  const [formData, setFormData] = useState({
    // Academic Information
    university: "",
    course: "",
    seatNumber: "",
    twelfthMarks: "",
    scores: "",

    // Personal Information
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: null as Date | null,
    fatherName: "",
    motherName: "",

    // Address Information
    address: "",
    city: "",
    country: "",

    // Identification
    aadhaarNumber: "",
    passportNumber: "",

    // Document Uploads
    studentImage: null as File | null,
    passportCopy: null as File | null,
    aadhaarCopy: null as File | null,
    twelfthCertificate: null as File | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);

  // Initialize storage bucket
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Check if bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'student-documents');

        if (!bucketExists) {
          // Create bucket if it doesn't exist
          const { error } = await supabase.storage.createBucket('student-documents', {
            public: true, // Make bucket public
            fileSizeLimit: 52428800, // 50MB
            allowedMimeTypes: ['image/*', 'application/pdf']
          });

          if (error) {
            console.error('Error creating storage bucket:', error);
            return;
          }

          // Update bucket to be public
          const { error: updateError } = await supabase.storage.updateBucket('student-documents', {
            public: true
          });

          if (updateError) {
            console.error('Error updating bucket visibility:', updateError);
            return;
          }
        } else {
          // Ensure existing bucket is public
          const { error: updateError } = await supabase.storage.updateBucket('student-documents', {
            public: true
          });

          if (updateError) {
            console.error('Error updating bucket visibility:', updateError);
            return;
          }
        }

        setIsStorageReady(true);
      } catch (error) {
        console.error('Error initializing storage:', error);
        toast({
          title: "Warning",
          description: "File upload functionality may not be available.",
          variant: "destructive",
        });
      }
    };

    initializeStorage();
  }, []);

  const universities = [
    { id: 1, name: "Tashkent State Medical University" },
    { id: 2, name: "Samarkand State Medical University" },
    { id: 3, name: "Bukhara State Medical Institute" },
    { id: 4, name: "Qarshi State University" },
  ];

  const courses = [
    { id: 1, name: "MBBS" },
    { id: 2, name: "BDS" },
    { id: 3, name: "Pharmacy" },
    { id: 4, name: "Nursing" },
    { id: 5, name: "Pediatrics" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size should not exceed 5MB",
          variant: "destructive",
        });
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Only JPG, PNG, and PDF files are allowed",
          variant: "destructive",
        });
        return;
      }

      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormData(prev => ({ ...prev, dateOfBirth: date || null }));
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    if (!isStorageReady) {
      console.error('Storage is not ready');
      return null;
    }

    try {
      // Generate a unique filename with timestamp and original extension
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const fileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      console.log('Uploading file:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('student-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload file: ${error.message}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Required fields validation
      const requiredFields = {
        university: 'University',
        course: 'Course',
        firstName: 'First Name',
        lastName: 'Last Name',
        fatherName: 'Father\'s Name',
        motherName: 'Mother\'s Name',
        dateOfBirth: 'Date of Birth'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([key, label]) => !formData[key])
        .map(([_, label]) => label);

      if (missingFields.length > 0) {
        toast({
          title: "Required Fields Missing",
          description: `Please fill in the following required fields: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.dateOfBirth) {
        toast({
          title: "Error",
          description: "Date of Birth is required",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

      // Upload files first with proper error handling
      const uploadResults = await Promise.all([
        formData.studentImage ? uploadFile(formData.studentImage, 'photos').catch(err => {
          console.error('Error uploading student image:', err);
          return null;
        }) : null,
        formData.passportCopy ? uploadFile(formData.passportCopy, 'passport').catch(err => {
          console.error('Error uploading passport copy:', err);
          return null;
        }) : null,
        formData.aadhaarCopy ? uploadFile(formData.aadhaarCopy, 'aadhaar').catch(err => {
          console.error('Error uploading aadhaar copy:', err);
          return null;
        }) : null,
        formData.twelfthCertificate ? uploadFile(formData.twelfthCertificate, 'certificates').catch(err => {
          console.error('Error uploading 12th certificate:', err);
          return null;
        }) : null,
      ]);

      const [photoUrl, passportUrl, aadhaarUrl, certificateUrl] = uploadResults;

      // Log upload results
      console.log('File upload results:', {
        photoUrl,
        passportUrl,
        aadhaarUrl,
        certificateUrl
      });

      // Prepare student data
      const studentData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        date_of_birth: formData.dateOfBirth.toISOString().split('T')[0], // Format as YYYY-MM-DD
        phone_number: formData.phoneNumber || null,
        email: formData.email || null,
        university_id: Number(formData.university),
        course_id: Number(formData.course),
        academic_session_id: 1, // Default to first session, update as needed
        status: 'active' as const,
        city: formData.city || null,
        country: formData.country || null,
        address: formData.address || null,
        aadhaar_number: formData.aadhaarNumber || null,
        passport_number: formData.passportNumber || null,
        twelfth_marks: formData.twelfthMarks ? parseFloat(formData.twelfthMarks) : null,
        seat_number: formData.seatNumber || null,
        scores: formData.scores || null,
        photo_url: photoUrl,
        passport_copy_url: passportUrl,
        aadhaar_copy_url: aadhaarUrl,
        twelfth_certificate_url: certificateUrl,
      };

      console.log('Saving student data:', studentData);

      // Save to database
      const { error } = await supabase
        .from('students')
        .insert([studentData]);

      if (error) {
        console.error('Database error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      toast({
        title: "Success",
        description: `${formData.firstName} ${formData.lastName} has been successfully admitted.`,
      });
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      university: "",
      course: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      dateOfBirth: null,
      fatherName: "",
      motherName: "",
      studentImage: null,
      seatNumber: "",
      twelfthMarks: "",
      scores: "",
      address: "",
      city: "",
      country: "",
      aadhaarNumber: "",
      passportNumber: "",
      passportCopy: null,
      aadhaarCopy: null,
      twelfthCertificate: null,
    });
  };

  return (
    <MainLayout>
      <PageHeader
        title="Student Admission"
        description="Admit new students to universities and courses"
      />
      
      <div className="space-y-6">
        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" />
              Academic Information
            </CardTitle>
            <CardDescription>Select university and course details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">Select University *</Label>
                <Select value={formData.university} onValueChange={(value) => handleInputChange("university", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id.toString()}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Select Course *</Label>
                <Select value={formData.course} onValueChange={(value) => handleInputChange("course", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Enter student's personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="Enter phone number"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter email address"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateOfBirth && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateOfBirth ? format(formData.dateOfBirth, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateOfBirth}
                        onSelect={handleDateSelect}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentImage">Student Image</Label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Upload className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="studentImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "studentImage")}
                        className="pl-10 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
                      />
                    </div>
                  </div>
                  {formData.studentImage && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {formData.studentImage.name}
                    </p>
                  )}
                </div>

                {/* Address Information */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Enter city"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    placeholder="Enter country"
                  />
                </div>

                {/* Identification Information */}
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                  <Input
                    id="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
                    placeholder="Enter Aadhaar number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number *</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                    placeholder="Enter passport number"
                  />
                </div>

                {/* Academic Details */}
                <div className="space-y-2">
                  <Label htmlFor="twelfthMarks">12th Marks *</Label>
                  <Input
                    id="twelfthMarks"
                    value={formData.twelfthMarks}
                    onChange={(e) => handleInputChange("twelfthMarks", e.target.value)}
                    placeholder="Enter 12th marks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seatNumber">Seat Number *</Label>
                  <Input
                    id="seatNumber"
                    value={formData.seatNumber}
                    onChange={(e) => handleInputChange("seatNumber", e.target.value)}
                    placeholder="Enter seat number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scores">Scores *</Label>
                  <Input
                    id="scores"
                    value={formData.scores}
                    onChange={(e) => handleInputChange("scores", e.target.value)}
                    placeholder="Enter scores"
                  />
                </div>

                {/* Document Uploads */}
                <div className="space-y-2">
                  <Label>Photo Upload *</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "studentImage")}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Passport Copy *</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "passportCopy")}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Aadhaar Card Copy *</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "aadhaarCopy")}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>12th Certificate Copy *</Label>
                  <div className="relative">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(e, "twelfthCertificate")}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Family Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Family Information
            </CardTitle>
            <CardDescription>Enter parent details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange("fatherName", e.target.value)}
                  placeholder="Enter father's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange("motherName", e.target.value)}
                  placeholder="Enter mother's name"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={resetForm}
              >
                Reset Form
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Submitting..." : "Submit Admission"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentAdmission;
