-- TripNest PostgreSQL Database Schema
-- Database: tripnest

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    avatar_url VARCHAR(500),
    country VARCHAR(100),
    preferred_currency VARCHAR(10) DEFAULT 'USD',
    role VARCHAR(30) DEFAULT 'TRAVELER',
    provider VARCHAR(20) DEFAULT 'LOCAL',
    provider_id VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(64) PRIMARY KEY,
    trip_name VARCHAR(200) NOT NULL,
    description TEXT,
    destination VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers INT DEFAULT 1,
    budget NUMERIC(12, 2) DEFAULT 0.00,
    spent NUMERIC(12, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'PLANNING',
    visibility VARCHAR(30) DEFAULT 'PRIVATE',
    cover_image VARCHAR(500),
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    owner_name VARCHAR(150),
    travel_style VARCHAR(50) DEFAULT 'Standard',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    group_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_days (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE,
    title VARCHAR(200) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(64) PRIMARY KEY,
    day_id VARCHAR(64) REFERENCES itinerary_days(id) ON DELETE CASCADE,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    start_time VARCHAR(10),
    end_time VARCHAR(10),
    location VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Sightseeing',
    cost NUMERIC(10, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    notes TEXT,
    priority VARCHAR(20) DEFAULT 'Medium',
    is_completed BOOLEAN DEFAULT FALSE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    category VARCHAR(50) DEFAULT 'Other',
    expense_date DATE NOT NULL,
    paid_by_id VARCHAR(64) REFERENCES users(id),
    paid_by_name VARCHAR(150),
    payment_method VARCHAR(50) DEFAULT 'Credit Card',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_splits (
    id VARCHAR(64) PRIMARY KEY,
    expense_id VARCHAR(64) REFERENCES expenses(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id),
    user_name VARCHAR(150),
    amount NUMERIC(12, 2) NOT NULL,
    settled BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS travel_groups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(64) PRIMARY KEY,
    group_id VARCHAR(64) REFERENCES travel_groups(id) ON DELETE CASCADE,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150),
    email VARCHAR(150),
    avatar_url VARCHAR(500),
    role VARCHAR(30) DEFAULT 'Member',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS travel_documents (
    id VARCHAR(64) PRIMARY KEY,
    trip_id VARCHAR(64) REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) DEFAULT 'Other',
    file_size VARCHAR(30),
    file_type VARCHAR(50) DEFAULT 'application/pdf',
    upload_date DATE,
    expiry_date DATE,
    file_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(64) PRIMARY KEY,
    target_type VARCHAR(30) DEFAULT 'destination',
    target_id VARCHAR(64) NOT NULL,
    target_name VARCHAR(150) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    user_avatar VARCHAR(500),
    user_country VARCHAR(100),
    rating NUMERIC(3, 1) NOT NULL,
    value_for_money NUMERIC(3, 1),
    safety NUMERIC(3, 1),
    food_and_dining NUMERIC(3, 1),
    walkability NUMERIC(3, 1),
    title VARCHAR(200) NOT NULL,
    comment TEXT NOT NULL,
    traveler_type VARCHAR(50) DEFAULT 'Solo',
    trip_date VARCHAR(50),
    would_recommend BOOLEAN DEFAULT TRUE,
    helpful_votes INT DEFAULT 0,
    verified_traveler BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    category VARCHAR(50),
    rating NUMERIC(3, 1) DEFAULT 4.8,
    short_description TEXT,
    long_description TEXT,
    image_url VARCHAR(500),
    average_cost_per_day NUMERIC(10, 2),
    best_time_to_visit VARCHAR(150),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);
