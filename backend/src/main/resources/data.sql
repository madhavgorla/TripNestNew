-- TripNest Initial Seed Data for PostgreSQL
-- Database: tripnest

-- Users
INSERT INTO users (id, full_name, email, avatar_url, country, preferred_currency, role, provider, created_at)
VALUES
('usr-1', 'Lara Croft', 'lara@tripnest.com', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'United Kingdom', 'USD', 'TRAVELER', 'LOCAL', '2026-01-15 08:00:00+00'),
('usr-2', 'Madhav Sharma', 'madhav@tripnest.com', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'India', 'INR', 'GROUP_ADMIN', 'LOCAL', '2026-01-20 10:00:00+00'),
('usr-admin', 'TripNest Admin', 'admin@tripnest.com', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'United States', 'USD', 'ADMIN', 'LOCAL', '2026-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Trips
INSERT INTO trips (id, trip_name, description, destination, country, start_date, end_date, travelers, budget, spent, currency, status, visibility, cover_image, owner_id, owner_name, travel_style, latitude, longitude)
VALUES
('trip-rome-2026', 'Rome Cultural Escape', 'An immersive 5-day journey through the Roman Empire, classical renaissance art, and authentic Italian gastronomy.', 'Rome', 'Italy', '2026-10-10', '2026-10-15', 2, 3200.00, 2450.00, 'USD', 'UPCOMING', 'GROUP', '/src/assets/images/dest_rome_colosseum_1790172766150.jpg', 'usr-1', 'Lara Croft', 'Standard', 41.9028, 12.4964),
('trip-goa-2026', 'Goa Coastal Odyssey', 'Sun, sand, Portuguese heritage architecture, and coastal seafood explorations with friends.', 'Goa', 'India', '2026-11-05', '2026-11-10', 4, 65000.00, 38200.00, 'INR', 'PLANNING', 'GROUP', '/src/assets/images/dest_goa_beach_1790172797821.jpg', 'usr-2', 'Madhav Sharma', 'Adventure', 15.2993, 74.1240)
ON CONFLICT (id) DO NOTHING;

-- Itinerary Days
INSERT INTO itinerary_days (id, trip_id, day_number, date, title, summary)
VALUES
('day-rome-1', 'trip-rome-2026', 1, '2026-10-10', 'Arrival & Ancient Roman Forum', 'Touchdown in Leonardo da Vinci airport, check into Monti boutique hotel, Colosseum tour and dinner.'),
('day-rome-2', 'trip-rome-2026', 2, '2026-10-11', 'Vatican City & Trastevere Evenings', 'Vatican Museums, Sistine Chapel, followed by sunset walk along Tiber river.'),
('day-rome-3', 'trip-rome-2026', 3, '2026-10-12', 'Trevi Fountain & Villa Borghese', 'Morning coin toss at Trevi, Spanish Steps, and cycling in Borghese gardens.')
ON CONFLICT (id) DO NOTHING;

-- Activities
INSERT INTO activities (id, day_id, trip_id, name, description, start_time, end_time, location, category, cost, currency, priority, is_completed, latitude, longitude, sort_order)
VALUES
('act-1', 'day-rome-1', 'trip-rome-2026', 'Check into Hotel Artemide', 'Boutique hotel in Via Nazionale. Drop off baggage and refresh.', '10:00', '11:00', 'Via Nazionale 22, Rome', 'Hotel', 320.00, 'USD', 'High', TRUE, 41.9015, 12.4925, 1),
('act-2', 'day-rome-1', 'trip-rome-2026', 'Colosseum & Roman Forum Tour', 'Skip-the-line VIP guided tour of gladiators arena and Roman Forum.', '13:00', '16:00', 'Piazza del Colosseo 1, Rome', 'Sightseeing', 110.00, 'USD', 'High', TRUE, 41.8902, 12.4922, 2),
('act-3', 'day-rome-1', 'trip-rome-2026', 'Dinner at Trattoria Monti', 'Authentic cacio e pepe, artichokes alla romana, and local Frascati wine.', '19:30', '21:30', 'Via di San Vito 13, Rome', 'Food', 95.00, 'USD', 'Medium', FALSE, 41.8967, 12.5011, 3)
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, target_type, target_id, target_name, user_id, user_name, user_avatar, user_country, rating, value_for_money, safety, food_and_dining, walkability, title, comment, traveler_type, trip_date, would_recommend, helpful_votes, verified_traveler)
VALUES
('rev-rome-1', 'destination', 'rome', 'Rome', 'usr-1', 'Lara Croft', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', 'United Kingdom 🇬🇧', 5.0, 4.8, 4.9, 5.0, 4.8, 'Unforgettable ancient grandeur and sensational pasta', 'Walking through Rome feels like stepping into a living open-air museum. The Colosseum underground tour was truly magical, and evenings in Trastevere with fresh cacio e pepe exceeded expectations.', 'Solo', 'October 2025', TRUE, 42, TRUE),
('rev-goa-1', 'destination', 'goa', 'Goa', 'usr-2', 'Madhav Sharma', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'India 🇮🇳', 4.8, 5.0, 4.7, 4.9, 4.5, 'Sun, spice plantations, and golden sunset shacks', 'South Goa beaches are serene paradise. Clean waters at Palolem, delicious coastal kingfish curry, and very friendly locals. Renting a scooter is the best way to explore.', 'Friends', 'November 2025', TRUE, 29, TRUE)
ON CONFLICT (id) DO NOTHING;

-- Destinations
INSERT INTO destinations (id, name, country, region, category, rating, short_description, long_description, image_url, average_cost_per_day, best_time_to_visit, latitude, longitude)
VALUES
('dest-rome', 'Rome', 'Italy', 'Southern Europe', 'Historical', 4.9, 'The Eternal City with 2,800 years of living history, baroque fountains, and legendary cuisine.', 'Rome is an epic outdoor museum where ancient colosseums rise alongside bustling espresso cafes, cobblestone alleyways, and the Vatican City.', '/src/assets/images/dest_rome_colosseum_1790172766150.jpg', 160.00, 'April - May & September - October', 41.9028, 12.4964),
('dest-goa', 'Goa', 'India', 'South Asia', 'Beaches', 4.7, 'Golden coastline fringed with palm trees, Portuguese cathedrals, and lively beach shacks.', 'Goa offers a laid-back blend of susegad lifestyle, spice plantations, vibrant flea markets, and water sports.', '/src/assets/images/dest_goa_beach_1790172797821.jpg', 50.00, 'November - February', 15.2993, 74.1240)
ON CONFLICT (id) DO NOTHING;
