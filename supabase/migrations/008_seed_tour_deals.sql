-- Seed tour deals for Bangladesh destinations
-- Cox's Bazar, Sundarban, Kuakata

INSERT INTO tour_deals (
  title, slug, description, short_description, destination,
  price, original_price, duration_days, max_travelers,
  image_url, inclusions, exclusions, is_active, is_featured, deal_code
) VALUES
-- 1. Cox's Bazar
(
  'Cox''s Bazar Beach Escape',
  'coxs-bazar-beach-escape',
  'Experience the world''s longest natural sandy beach with our Cox''s Bazar package. Enjoy breathtaking sunsets over the Bay of Bengal, explore the vibrant sea beach market, visit the ancient Buddha Dhatu Jadi temple at Himchari, and take a thrilling speed boat ride to Sonadia Island. Our carefully curated itinerary includes beachside dining, local seafood feasts, and visits to the picturesque Inani Beach with its crystal-clear water and coral formations.',
  '3-day beach getaway to the world''s longest natural sandy beach',
  'Cox''s Bazar',
  12500.00,
  15000.00,
  3,
  20,
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  '["AC hotel accommodation (2 nights)", "Daily breakfast buffet", "Airport transfers", "Himchari National Park tour", "Inani Beach excursion", "Speed boat ride to Sonadia Island", "Seafood dinner experience", "Local sightseeing guide"]',
  '["Airfare to Cox''s Bazar", "Personal expenses", "Travel insurance", "Tips and gratuities"]',
  true,
  true,
  '#020926-1300'
),
-- 2. Sundarban
(
  'Sundarban Mangrove Adventure',
  'sundarban-mangrove-adventure',
  'Embark on an unforgettable journey into the heart of the Sundarbans, the world''s largest mangrove forest and a UNESCO World Heritage Site. This 4-day expedition takes you deep into the delta where the Royal Bengal Tiger roams. Cruise through narrow creeks, spot exotic wildlife including saltwater crocodiles, spotted deer, and exotic birds. Visit the legendary Netidhopani temple, explore the Viper Island, and witness the mesmerizing sunset over the confluence of the Ganges and Brahmaputra rivers.',
  '4-day expedition into the world''s largest mangrove forest',
  'Sundarban',
  18500.00,
  22000.00,
  4,
  15,
  'https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800&q=80',
  '["AC cabin on launch boat (3 nights)", "All meals during the cruise", "Forest entry permits", "Expert naturalist guide", "Safari boat rides (4 sessions)", "Netidhopani temple visit", "Bird watching tour", "Kolkata pickup and drop"]',
  '["Airfare to Kolkata", "Personal expenses", "Travel insurance", "Binocular rental (optional)", "Tips and gratuities"]',
  true,
  true,
  '#020926-1301'
),
-- 3. Kuakata
(
  'Kuakata Sea & Heritage Tour',
  'kuakata-sea-heritage-tour',
  'Discover the serene beauty of Kuakata, the "Daughter of the Sea", where you can witness both sunrise and sunset over the Bay of Bengal from the same beach. This 3-day tour includes a visit to the Rakhine fishing village to experience the unique Rakhine culture and cuisine, a boat ride to the mysterious Gangamati Sea Beach with its natural bridge formations, and a trek through the lush Fatrar Char forest. Enjoy fresh seafood, relax on the pristine black sand beach, and visit the historic Kuakata Buddhist Temple.',
  '3-day tour to the "Daughter of the Sea" with sunrise and sunset views',
  'Kuakata',
  9800.00,
  12000.00,
  3,
  15,
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
  '["AC resort accommodation (2 nights)", "Daily breakfast and dinner", "Dhaka-Kuakata AC bus transfers", "Rakhine village cultural tour", "Gangamati Sea Beach boat ride", "Sunrise and sunset viewing sessions", "Fatrar Char forest trek", "Kuakata Buddhist Temple visit"]',
  '["Airfare to Dhaka", "Lunch during travel", "Personal expenses", "Travel insurance", "Tips and gratuities"]',
  true,
  true,
  '#020926-1302'
);
