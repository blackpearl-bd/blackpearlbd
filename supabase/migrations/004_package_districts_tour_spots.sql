-- ============================================================
-- PACKAGE DISTRICTS TABLE
-- ============================================================
CREATE TABLE package_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_value TEXT NOT NULL,  -- references package_destinations.value (e.g. 'dhaka-division')
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_package_districts_division ON package_districts (division_value, sort_order) WHERE is_active = true;

ALTER TABLE package_districts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active package districts"
  ON package_districts FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all package districts"
  ON package_districts FOR SELECT
  USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

CREATE POLICY "Admins can manage package districts"
  ON package_districts FOR ALL
  USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- PACKAGE TOUR SPOTS TABLE
-- ============================================================
CREATE TABLE package_tour_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES package_districts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_package_tour_spots_district ON package_tour_spots (district_id, sort_order) WHERE is_active = true;

ALTER TABLE package_tour_spots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active package tour spots"
  ON package_tour_spots FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all package tour spots"
  ON package_tour_spots FOR SELECT
  USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

CREATE POLICY "Admins can manage package tour spots"
  ON package_tour_spots FOR ALL
  USING (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- SEED DATA: Districts
-- ============================================================
INSERT INTO package_districts (division_value, name, sort_order) VALUES
  -- Dhaka Division
  ('dhaka-division', 'Dhaka', 0),
  ('dhaka-division', 'Gazipur', 1),
  ('dhaka-division', 'Narayanganj', 2),
  ('dhaka-division', 'Munshiganj', 3),
  ('dhaka-division', 'Manikganj', 4),
  ('dhaka-division', 'Narsingdi', 5),
  ('dhaka-division', 'Tangail', 6),
  ('dhaka-division', 'Faridpur', 7),
  ('dhaka-division', 'Gopalganj', 8),
  ('dhaka-division', 'Madaripur', 9),
  ('dhaka-division', 'Shariatpur', 10),
  ('dhaka-division', 'Rajbari', 11),
  ('dhaka-division', 'Kishoreganj', 12),
  -- Chattogram Division
  ('chattogram-division', 'Chattogram', 0),
  ('chattogram-division', 'Cox''s Bazar', 1),
  ('chattogram-division', 'Rangamati', 2),
  ('chattogram-division', 'Bandarban', 3),
  ('chattogram-division', 'Khagrachhari', 4),
  ('chattogram-division', 'Cumilla', 5),
  ('chattogram-division', 'Feni', 6),
  ('chattogram-division', 'Noakhali', 7),
  ('chattogram-division', 'Lakshmipur', 8),
  ('chattogram-division', 'Brahmanbaria', 9),
  ('chattogram-division', 'Chandpur', 10),
  -- Sylhet Division
  ('sylhet-division', 'Sylhet', 0),
  ('sylhet-division', 'Moulvibazar', 1),
  ('sylhet-division', 'Sunamganj', 2),
  ('sylhet-division', 'Habiganj', 3),
  -- Rajshahi Division
  ('rajshahi-division', 'Rajshahi', 0),
  ('rajshahi-division', 'Bogura', 1),
  ('rajshahi-division', 'Naogaon', 2),
  ('rajshahi-division', 'Natore', 3),
  ('rajshahi-division', 'Pabna', 4),
  ('rajshahi-division', 'Sirajganj', 5),
  ('rajshahi-division', 'Chapai Nawabganj', 6),
  ('rajshahi-division', 'Joypurhat', 7),
  -- Khulna Division
  ('khulna-division', 'Khulna', 0),
  ('khulna-division', 'Bagerhat', 1),
  ('khulna-division', 'Satkhira', 2),
  ('khulna-division', 'Jashore', 3),
  ('khulna-division', 'Jhenaidah', 4),
  ('khulna-division', 'Magura', 5),
  ('khulna-division', 'Narail', 6),
  ('khulna-division', 'Kushtia', 7),
  ('khulna-division', 'Chuadanga', 8),
  ('khulna-division', 'Meherpur', 9),
  -- Barishal Division
  ('barishal-division', 'Barishal', 0),
  ('barishal-division', 'Patuakhali', 1),
  ('barishal-division', 'Bhola', 2),
  ('barishal-division', 'Pirojpur', 3),
  ('barishal-division', 'Jhalokathi', 4),
  ('barishal-division', 'Barguna', 5),
  -- Rangpur Division
  ('rangpur-division', 'Rangpur', 0),
  ('rangpur-division', 'Dinajpur', 1),
  ('rangpur-division', 'Panchagarh', 2),
  ('rangpur-division', 'Thakurgaon', 3),
  ('rangpur-division', 'Nilphamari', 4),
  ('rangpur-division', 'Gaibandha', 5),
  ('rangpur-division', 'Kurigram', 6),
  ('rangpur-division', 'Lalmonirhat', 7),
  -- Mymensingh Division
  ('mymensingh-division', 'Mymensingh', 0),
  ('mymensingh-division', 'Jamalpur', 1),
  ('mymensingh-division', 'Sherpur', 2),
  ('mymensingh-division', 'Netrokona', 3);

-- ============================================================
-- SEED DATA: Tour Spots (using subquery to get district IDs)
-- ============================================================
INSERT INTO package_tour_spots (district_id, name, sort_order)
SELECT d.id, v.name, v.sort_order
FROM package_districts d
CROSS JOIN (VALUES
  -- Dhaka
  ('dhaka-division', 'Dhaka', 'Lalbagh Fort', 0),
  ('dhaka-division', 'Dhaka', 'Ahsan Manzil', 1),
  ('dhaka-division', 'Dhaka', 'Sonargaon (Panam Nagar)', 2),
  ('dhaka-division', 'Dhaka', 'National Parliament Building', 3),
  ('dhaka-division', 'Gazipur', 'Bhawal National Park', 0),
  ('dhaka-division', 'Gazipur', 'Bangabandhu Sheikh Mujib Safari Park', 1),
  ('dhaka-division', 'Narayanganj', 'Sonargaon Folk Art and Crafts Museum', 0),
  ('dhaka-division', 'Narayanganj', 'Taj Mahal Bangladesh', 1),
  ('dhaka-division', 'Munshiganj', 'Idrakpur Fort', 0),
  ('dhaka-division', 'Munshiganj', 'Bikrampur Vihara', 1),
  ('dhaka-division', 'Munshiganj', 'Baba Adam Mosque', 2),
  ('dhaka-division', 'Manikganj', 'Baliati Palace', 0),
  ('dhaka-division', 'Manikganj', 'Teota Zamindar Bari', 1),
  ('dhaka-division', 'Narsingdi', 'Wari-Bateshwar Archaeological Site', 0),
  ('dhaka-division', 'Narsingdi', 'Dream Holiday Park', 1),
  ('dhaka-division', 'Tangail', 'Mohera Zamindar Bari', 0),
  ('dhaka-division', 'Tangail', 'Atiya Mosque', 1),
  ('dhaka-division', 'Tangail', 'Jamuna Resort', 2),
  ('dhaka-division', 'Faridpur', 'Jasimuddin Heritage House', 0),
  ('dhaka-division', 'Faridpur', 'Mathurapur Deul', 1),
  ('dhaka-division', 'Gopalganj', 'Bangabandhu Sheikh Mujibur Rahman Complex (Tungipara)', 0),
  ('dhaka-division', 'Madaripur', 'Senapati Dighi', 0),
  ('dhaka-division', 'Madaripur', 'Raja Ram Mandir', 1),
  ('dhaka-division', 'Shariatpur', 'Burir Hat Mosque', 0),
  ('dhaka-division', 'Shariatpur', 'Modern Fantasy Kingdom', 1),
  ('dhaka-division', 'Rajbari', 'Shah Pahlwan Dargah', 0),
  ('dhaka-division', 'Rajbari', 'Godai River Bank', 1),
  ('dhaka-division', 'Kishoreganj', 'Nikli Haor', 0),
  ('dhaka-division', 'Kishoreganj', 'Jangalbari Fort', 1),
  ('dhaka-division', 'Kishoreganj', 'Solakia Eidgah', 2),
  -- Chattogram
  ('chattogram-division', 'Chattogram', 'Patenga Beach', 0),
  ('chattogram-division', 'Chattogram', 'Foy''s Lake', 1),
  ('chattogram-division', 'Chattogram', 'Naval Beach', 2),
  ('chattogram-division', 'Chattogram', 'Sitakunda Eco Park', 3),
  ('chattogram-division', 'Cox''s Bazar', 'Cox''s Bazar Sea Beach', 0),
  ('chattogram-division', 'Cox''s Bazar', 'Saint Martin''s Island', 1),
  ('chattogram-division', 'Cox''s Bazar', 'Inani Beach', 2),
  ('chattogram-division', 'Cox''s Bazar', 'Himchari', 3),
  ('chattogram-division', 'Rangamati', 'Kaptai Lake', 0),
  ('chattogram-division', 'Rangamati', 'Hanging Bridge', 1),
  ('chattogram-division', 'Rangamati', 'Shuvolong Waterfall', 2),
  ('chattogram-division', 'Rangamati', 'Rajban Vihara', 3),
  ('chattogram-division', 'Bandarban', 'Nilgiri', 0),
  ('chattogram-division', 'Bandarban', 'Nilachal', 1),
  ('chattogram-division', 'Bandarban', 'Boga Lake', 2),
  ('chattogram-division', 'Bandarban', 'Keokradong', 3),
  ('chattogram-division', 'Bandarban', 'Buddha Dhatu Jadi', 4),
  ('chattogram-division', 'Khagrachhari', 'Alutila Cave', 0),
  ('chattogram-division', 'Khagrachhari', 'Risang Waterfall', 1),
  ('chattogram-division', 'Khagrachhari', 'Sajek Valley', 2),
  ('chattogram-division', 'Cumilla', 'Shalban Vihara', 0),
  ('chattogram-division', 'Cumilla', 'Mainamati Museum', 1),
  ('chattogram-division', 'Cumilla', 'Dharmasagar Dighi', 2),
  ('chattogram-division', 'Cumilla', 'BARD', 3),
  ('chattogram-division', 'Feni', 'Muhuri Regulator', 0),
  ('chattogram-division', 'Feni', 'Bijoy Singha Dighi', 1),
  ('chattogram-division', 'Noakhali', 'Nijhum Dwip', 0),
  ('chattogram-division', 'Noakhali', 'Musapur Regulator', 1),
  ('chattogram-division', 'Lakshmipur', 'Ramgati Beach', 0),
  ('chattogram-division', 'Lakshmipur', 'Dalal Bazar Zamindar Bari', 1),
  ('chattogram-division', 'Brahmanbaria', 'Arifail Mosque', 0),
  ('chattogram-division', 'Brahmanbaria', 'Titas Gas Field', 1),
  ('chattogram-division', 'Brahmanbaria', 'Bhadughar Mosque', 2),
  ('chattogram-division', 'Chandpur', 'Mini Cox''s Bazar (Triveniketan)', 0),
  ('chattogram-division', 'Chandpur', 'Padma-Meghna River Junction', 1),
  -- Sylhet
  ('sylhet-division', 'Sylhet', 'Jaflong', 0),
  ('sylhet-division', 'Sylhet', 'Ratargul Swamp Forest', 1),
  ('sylhet-division', 'Sylhet', 'Hazrat Shah Jalal Shrine', 2),
  ('sylhet-division', 'Sylhet', 'Bichanakandi', 3),
  ('sylhet-division', 'Moulvibazar', 'Sreemangal Tea Gardens', 0),
  ('sylhet-division', 'Moulvibazar', 'Lawachara National Park', 1),
  ('sylhet-division', 'Moulvibazar', 'Madhabkunda Waterfall', 2),
  ('sylhet-division', 'Sunamganj', 'Tanguar Haor', 0),
  ('sylhet-division', 'Sunamganj', 'Jadukata River', 1),
  ('sylhet-division', 'Sunamganj', 'Shimul Bagan', 2),
  ('sylhet-division', 'Sunamganj', 'Barek Tila', 3),
  ('sylhet-division', 'Habiganj', 'Satchari National Park', 0),
  ('sylhet-division', 'Habiganj', 'Rema-Kalenga Wildlife Sanctuary', 1),
  -- Rajshahi
  ('rajshahi-division', 'Rajshahi', 'Varendra Research Museum', 0),
  ('rajshahi-division', 'Rajshahi', 'Puthia Temple Complex', 1),
  ('rajshahi-division', 'Rajshahi', 'Padma Garden', 2),
  ('rajshahi-division', 'Bogura', 'Mahasthangarh', 0),
  ('rajshahi-division', 'Bogura', 'Behula Lakshindar Basanta Bati', 1),
  ('rajshahi-division', 'Bogura', 'Nawab Palace', 2),
  ('rajshahi-division', 'Naogaon', 'Paharpur Somapura Mahavihara', 0),
  ('rajshahi-division', 'Naogaon', 'Kushumba Mosque', 1),
  ('rajshahi-division', 'Naogaon', 'Jabai Beel', 2),
  ('rajshahi-division', 'Natore', 'Uttara Ganabhaban', 0),
  ('rajshahi-division', 'Natore', 'Rani Bhabani Palace', 1),
  ('rajshahi-division', 'Natore', 'Chalan Beel', 2),
  ('rajshahi-division', 'Pabna', 'Hardinge Bridge', 0),
  ('rajshahi-division', 'Pabna', 'Lalon Shah Bridge', 1),
  ('rajshahi-division', 'Pabna', 'Mental Hospital Heritage Site', 2),
  ('rajshahi-division', 'Sirajganj', 'Bangabandhu Eco Park', 0),
  ('rajshahi-division', 'Sirajganj', 'Rabindra Kachharibari (Shahjadpur)', 1),
  ('rajshahi-division', 'Chapai Nawabganj', 'Choto Sona Mosque', 0),
  ('rajshahi-division', 'Chapai Nawabganj', 'Gaur Ruins', 1),
  ('rajshahi-division', 'Joypurhat', 'Nandail Dighi', 0),
  ('rajshahi-division', 'Joypurhat', 'Laskarpur Mosque', 1),
  -- Khulna
  ('khulna-division', 'Khulna', 'Sundarbans Mangrove Forest', 0),
  ('khulna-division', 'Khulna', 'Rupsha Bridge', 1),
  ('khulna-division', 'Bagerhat', 'Sixty Dome Mosque', 0),
  ('khulna-division', 'Bagerhat', 'Tomb of Khan Jahan Ali', 1),
  ('khulna-division', 'Satkhira', 'Sundarbans Entrance (Kalinagar/Munshiganj)', 0),
  ('khulna-division', 'Satkhira', 'Tetulia Jami Mosque', 1),
  ('khulna-division', 'Jashore', 'Michael Madhusudan Dutt Birthplace (Sagardari)', 0),
  ('khulna-division', 'Jashore', 'Jessore Collectorate Park', 1),
  ('khulna-division', 'Jhenaidah', 'Naldanga Temple Complex', 0),
  ('khulna-division', 'Jhenaidah', 'Pagla Kanai Tomb', 1),
  ('khulna-division', 'Magura', 'Siddheswari Temple', 0),
  ('khulna-division', 'Magura', 'Raja Sitaram Ray Palace', 1),
  ('khulna-division', 'Narail', 'Chitra River', 0),
  ('khulna-division', 'Narail', 'SM Sultan Complex', 1),
  ('khulna-division', 'Kushtia', 'Lalon Akhra (Cheuriya)', 0),
  ('khulna-division', 'Kushtia', 'Rabindra Kuthibari (Shilaidaha)', 1),
  ('khulna-division', 'Chuadanga', 'Carew & Co. (Darshana)', 0),
  ('khulna-division', 'Chuadanga', 'Gholdari Mosque', 1),
  ('khulna-division', 'Meherpur', 'Mujibnagar Complex', 0),
  ('khulna-division', 'Meherpur', 'Amjhupi Indigo Factory', 1),
  -- Barishal
  ('barishal-division', 'Barishal', 'Floating Guava Market (Bhimruli)', 0),
  ('barishal-division', 'Barishal', 'Durga Sagar Dighi', 1),
  ('barishal-division', 'Barishal', 'Oxford Mission Church', 2),
  ('barishal-division', 'Patuakhali', 'Kuakata Sea Beach', 0),
  ('barishal-division', 'Patuakhali', 'Lebur Char', 1),
  ('barishal-division', 'Bhola', 'Monpura Island', 0),
  ('barishal-division', 'Bhola', 'Char Kukri Mukri', 1),
  ('barishal-division', 'Bhola', 'Jacob Tower (Char Fasson)', 2),
  ('barishal-division', 'Pirojpur', 'RayerKathi Landlord House', 0),
  ('barishal-division', 'Pirojpur', 'Boleshwar Riverfront', 1),
  ('barishal-division', 'Jhalokathi', 'Floating Guava Markets', 0),
  ('barishal-division', 'Jhalokathi', 'Sujabad Fort', 1),
  ('barishal-division', 'Barguna', 'Bibi Chini Mosque', 0),
  ('barishal-division', 'Barguna', 'Taltali Eco Park', 1),
  ('barishal-division', 'Barguna', 'Sonar Char', 2),
  -- Rangpur
  ('rangpur-division', 'Rangpur', 'Tajhat Palace', 0),
  ('rangpur-division', 'Rangpur', 'Chikli Beel', 1),
  ('rangpur-division', 'Rangpur', 'Vinna Jagat', 2),
  ('rangpur-division', 'Dinajpur', 'Kantajew Temple', 0),
  ('rangpur-division', 'Dinajpur', 'Ramsagar Dighi', 1),
  ('rangpur-division', 'Dinajpur', 'Shopnopuri Amusement Park', 2),
  ('rangpur-division', 'Panchagarh', 'Tetulia (View of Kanchenjunga)', 0),
  ('rangpur-division', 'Panchagarh', 'Rocks Museum', 1),
  ('rangpur-division', 'Panchagarh', 'Banglabandha Zero Point', 2),
  ('rangpur-division', 'Thakurgaon', 'Baliadangi Banyan Tree', 0),
  ('rangpur-division', 'Thakurgaon', 'Fun City Amusement Park', 1),
  ('rangpur-division', 'Nilphamari', 'Nil Sagar Dighi', 0),
  ('rangpur-division', 'Nilphamari', 'Saidpur Railway Workshop', 1),
  ('rangpur-division', 'Gaibandha', 'Balasi Ghat', 0),
  ('rangpur-division', 'Gaibandha', 'Bardhan Kuthi', 1),
  ('rangpur-division', 'Kurigram', 'Dharla Bridge', 0),
  ('rangpur-division', 'Kurigram', 'Chilmari River Port', 1),
  ('rangpur-division', 'Lalmonirhat', 'Teesta Barrage', 0),
  ('rangpur-division', 'Lalmonirhat', 'Kakina Zamindar Bari', 1),
  -- Mymensingh
  ('mymensingh-division', 'Mymensingh', 'Bangladesh Agricultural University Campus', 0),
  ('mymensingh-division', 'Mymensingh', 'Alexander Castle', 1),
  ('mymensingh-division', 'Mymensingh', 'Shashi Lodge', 2),
  ('mymensingh-division', 'Jamalpur', 'Lakiya Beel', 0),
  ('mymensingh-division', 'Jamalpur', 'Hazrat Shah Jamal Shrine', 1),
  ('mymensingh-division', 'Sherpur', 'Gajani Vacation Centre', 0),
  ('mymensingh-division', 'Sherpur', 'Madhutila Eco Park', 1),
  ('mymensingh-division', 'Netrokona', 'Birishiri White Clay Hills', 0),
  ('mymensingh-division', 'Netrokona', 'Birishiri Cultural Academy', 1)
) AS v(division_value, district_name, name, sort_order)
WHERE d.division_value = v.division_value AND d.name = v.district_name;
