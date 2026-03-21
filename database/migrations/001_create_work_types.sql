CREATE TABLE IF NOT EXISTS work_types (
    id SERIAL PRIMARY KEY,
    work_type_name VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    avg_duration VARCHAR(50),
    avg_price NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
