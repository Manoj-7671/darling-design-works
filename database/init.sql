-- =========================================================
-- BuildAI Data Layer (Tier 3) Schema
-- Compatible with PostgreSQL, SQLite, and MySQL
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Architect',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    length FLOAT NOT NULL,
    width FLOAT NOT NULL,
    floors INT DEFAULT 2,
    bedrooms INT DEFAULT 3,
    bathrooms INT DEFAULT 3,
    parking VARCHAR(50) DEFAULT '1 car',
    style VARCHAR(50) DEFAULT 'Modern',
    building_type VARCHAR(50) DEFAULT 'Residential',
    height FLOAT DEFAULT 10.0,
    location VARCHAR(255) DEFAULT 'Hyderabad, India',
    budget FLOAT DEFAULT 55.0,
    prompt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Floor Plans Table
CREATE TABLE IF NOT EXISTS floor_plans (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL, -- 'GF', 'FF', 'STACKED'
    room_data TEXT NOT NULL,    -- JSON payload of coordinates, sizes & furniture
    wall_height VARCHAR(20) DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Estimates Table
CREATE TABLE IF NOT EXISTS estimates (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    plot_area_sq_ft FLOAT NOT NULL,
    built_up_sq_ft FLOAT NOT NULL,
    estimated_cost FLOAT NOT NULL,
    cost_per_sq_ft FLOAT DEFAULT 2200.0,
    cement_bags INT NOT NULL,
    steel_kg FLOAT NOT NULL,
    sand_cu_ft FLOAT NOT NULL,
    aggregate_cu_ft FLOAT NOT NULL,
    bricks_units INT NOT NULL,
    tiles_sq_ft FLOAT NOT NULL,
    status VARCHAR(50) DEFAULT 'Preliminary',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_floor_plans_project_id ON floor_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_estimates_project_id ON estimates(project_id);
