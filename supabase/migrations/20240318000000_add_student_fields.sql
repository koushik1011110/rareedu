-- Add new fields to students table
ALTER TABLE students
ADD COLUMN city VARCHAR(100),
ADD COLUMN country VARCHAR(100),
ADD COLUMN address TEXT,
ADD COLUMN aadhaar_number VARCHAR(12),
ADD COLUMN passport_number VARCHAR(20),
ADD COLUMN twelfth_marks DECIMAL(5,2),
ADD COLUMN seat_number VARCHAR(50),
ADD COLUMN scores TEXT,
ADD COLUMN photo_url TEXT,
ADD COLUMN passport_copy_url TEXT,
ADD COLUMN aadhaar_copy_url TEXT,
ADD COLUMN twelfth_certificate_url TEXT; 