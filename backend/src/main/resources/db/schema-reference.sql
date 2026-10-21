-- Reference schema for planning. JPA currently creates/updates tables automatically (ddl-auto=update).
-- For production, replace ddl-auto=update with Flyway migrations.

-- MSSQL Reference Schema:
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'restaurants')
BEGIN
    CREATE TABLE restaurants (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(150) NOT NULL,
        code NVARCHAR(30) NOT NULL UNIQUE,
        created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'outlets')
BEGIN
    CREATE TABLE outlets (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        restaurant_id BIGINT FOREIGN KEY REFERENCES restaurants(id),
        name NVARCHAR(150) NOT NULL,
        code NVARCHAR(30) NOT NULL UNIQUE,
        phone NVARCHAR(30),
        email NVARCHAR(150),
        address NVARCHAR(MAX),
        gstin NVARCHAR(15),
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET(),
        updated_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        full_name NVARCHAR(150) NOT NULL,
        email NVARCHAR(150) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        is_active BIT NOT NULL DEFAULT 1,
        created_at DATETIMEOFFSET NOT NULL DEFAULT SYSDATETIMEOFFSET()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
BEGIN
    CREATE TABLE roles (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(40) NOT NULL UNIQUE
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_outlets')
BEGIN
    CREATE TABLE user_outlets (
        user_id BIGINT NOT NULL FOREIGN KEY REFERENCES users(id),
        outlet_id BIGINT NOT NULL FOREIGN KEY REFERENCES outlets(id),
        role_id BIGINT FOREIGN KEY REFERENCES roles(id),
        PRIMARY KEY (user_id, outlet_id)
    );
END;

-- Planned next: customers, categories, products, outlet_products, restaurant_tables,
-- orders, order_items, order_item_modifiers, bills, payments.
