-- ====================================================================
-- CAMPUS LOST & FOUND MANAGEMENT SYSTEM
-- System Reference Data (Categories, Campus Locations, & System Admin)
-- Strictly Zero Fake Student Activity (No fake items, reports, or claims)
-- ====================================================================

USE campus_lost_found;

-- 1. Insert Standard Campus Categories
INSERT INTO categories (id, name, icon, description) VALUES
(1, 'Electronics', 'laptop', 'Laptops, mobile phones, chargers, smartwatches, calculators'),
(2, 'Books & Study Material', 'book-open', 'Textbooks, notebooks, practical records, novel books'),
(3, 'Accessories', 'watch', 'Wristwatches, jewelry, keychains, sunglasses, rings'),
(4, 'ID Cards & Documents', 'credit-card', 'Student IDs, driver licenses, ATM cards, exam admit cards'),
(5, 'Bags & Backpacks', 'briefcase', 'College bags, laptop sleeves, pouches, gym bags'),
(6, 'Stationery', 'pen-tool', 'Geometry boxes, drafters, pen sets, scientific calculators'),
(7, 'Clothing & Wearables', 'shirt', 'Jackets, hoodies, caps, umbrellas, lab aprons'),
(8, 'Other Items', 'help-circle', 'Keys, water bottles, sports equipment, miscellaneous');

-- 2. Insert Standard Campus Locations
INSERT INTO locations (id, name, campus_zone, description) VALUES
(1, 'Central Library', 'Academic Block A', 'Ground and 1st floor reading halls, reference section'),
(2, 'Computer Lab 3', 'IT Block', '2nd Floor, Department of Computer Science'),
(3, 'Main Campus Canteen', 'Student Center', 'Ground floor food court and seating area'),
(4, 'Lecture Hall 102', 'Academic Block B', '1st Floor lecture theater'),
(5, 'College Auditorium', 'Auditorium Complex', 'Main event hall, stage and backstage'),
(6, 'Sports Ground & Pavilion', 'Sports Complex', 'Cricket ground, basketball court and gymnasium'),
(7, 'Administration Block', 'Admin Building', 'Accounts office, Dean office, registrar hall'),
(8, 'Science & Physics Lab', 'Science Wing', 'Ground floor laboratory complex');

-- 3. Insert Initial System Administrator Account Only
-- Students must register their own accounts through the Register page.
-- Admin Credentials: admin@campus.edu / Admin@123 (BCrypt hashed)
INSERT INTO users (id, full_name, email, phone, student_id, password_hash, role) VALUES
(1, 'Campus Admin Office', 'admin@campus.edu', '9876543210', 'ADM-2024-001', '$2a$10$w3qYgM7t3r1HkO5u4d2Qeu6d8A1f3b0K.E9V7uX3eY/1N1b4G4f1e', 'ADMIN');

-- Note: The `items`, `claims`, and `possible_matches` tables remain completely empty.
-- Real users will populate these tables through actual application usage.
