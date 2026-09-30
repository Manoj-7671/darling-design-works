-- =========================================================
-- BuildAI Initial Seed Data
-- =========================================================

-- Insert default admin architect
INSERT INTO users (id, email, name, role)
VALUES ('user-001', 'architect@buildai.com', 'Chief Design Engineer', 'Architect')
ON CONFLICT DO NOTHING;

-- Insert default sample 3BHK modern project
INSERT INTO projects (
    id, user_id, name, length, width, floors, bedrooms, bathrooms,
    parking, style, building_type, height, location, budget, prompt
)
VALUES (
    'proj-001',
    'user-001',
    'Modern 3BHK Residence',
    30.0,
    40.0,
    2,
    3,
    3,
    '1 car',
    'Modern',
    'Residential',
    10.0,
    'Hyderabad, India',
    55.0,
    'Design a 2-floor 3BHK house on a 30 × 40 ft plot with parking and a modern elevation.'
)
ON CONFLICT DO NOTHING;

-- Insert default estimate for proj-001
INSERT INTO estimates (
    id, project_id, plot_area_sq_ft, built_up_sq_ft, estimated_cost,
    cost_per_sq_ft, cement_bags, steel_kg, sand_cu_ft, aggregate_cu_ft,
    bricks_units, tiles_sq_ft, status
)
VALUES (
    'est-001',
    'proj-001',
    1200.0,
    1872.0,
    4118400.0,
    2200.0,
    749,
    7488.0,
    1498.0,
    1123.0,
    14976,
    1591.0,
    'Preliminary'
)
ON CONFLICT DO NOTHING;
