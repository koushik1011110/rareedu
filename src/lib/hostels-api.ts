
import { supabase } from "@/integrations/supabase/client";

export interface Hostel {
  id: number;
  name: string;
  location: string;
  capacity: number;
  current_occupancy: number;
  monthly_rent: number;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  facilities?: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  created_at: string;
  updated_at: string;
}

export interface HostelFormData {
  id?: number;
  name: string;
  location: string;
  capacity: string;
  monthly_rent: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  facilities: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
}

export const hostelsAPI = {
  getAll: async (): Promise<Hostel[]> => {
    const { data, error } = await supabase
      .from('hostels')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching hostels:', error);
      throw error;
    }
    
    return (data || []).map(hostel => ({
      ...hostel,
      status: hostel.status as 'Active' | 'Inactive' | 'Maintenance'
    }));
  },

  create: async (hostelData: Omit<HostelFormData, 'id'>): Promise<Hostel> => {
    const { data, error } = await supabase
      .from('hostels')
      .insert([{
        name: hostelData.name,
        location: hostelData.location,
        capacity: parseInt(hostelData.capacity),
        monthly_rent: parseFloat(hostelData.monthly_rent),
        contact_person: hostelData.contact_person,
        phone: hostelData.phone,
        email: hostelData.email,
        address: hostelData.address,
        facilities: hostelData.facilities,
        status: hostelData.status,
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating hostel:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'Active' | 'Inactive' | 'Maintenance'
    };
  },

  update: async (id: number, hostelData: Partial<Omit<HostelFormData, 'id'>>): Promise<Hostel> => {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (hostelData.name) updateData.name = hostelData.name;
    if (hostelData.location) updateData.location = hostelData.location;
    if (hostelData.capacity) updateData.capacity = parseInt(hostelData.capacity);
    if (hostelData.monthly_rent) updateData.monthly_rent = parseFloat(hostelData.monthly_rent);
    if (hostelData.contact_person) updateData.contact_person = hostelData.contact_person;
    if (hostelData.phone) updateData.phone = hostelData.phone;
    if (hostelData.email) updateData.email = hostelData.email;
    if (hostelData.address) updateData.address = hostelData.address;
    if (hostelData.facilities) updateData.facilities = hostelData.facilities;
    if (hostelData.status) updateData.status = hostelData.status;

    const { data, error } = await supabase
      .from('hostels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating hostel:', error);
      throw error;
    }
    
    return {
      ...data,
      status: data.status as 'Active' | 'Inactive' | 'Maintenance'
    };
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('hostels')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting hostel:', error);
      throw error;
    }
  },
};
