clickhouse client -n <<-EOSQL
    CREATE TABLE IF NOT EXISTS sales (
        sale_id UUID,
        product_id UInt64,
        customer_id UInt64,
        timestamp DateTime,
        amount Decimal(10, 2)
    ) ENGINE = MergeTree() ORDER BY (timestamp);

    CREATE TABLE IF NOT EXISTS products (
        product_id UInt64,
        name String,
        category String
    ) ENGINE = MergeTree() ORDER BY (product_id);

    CREATE TABLE IF NOT EXISTS customers (
        customer_id UInt64,
        name String,
        region String
    ) ENGINE = MergeTree() ORDER BY (customer_id);

    INSERT INTO products (product_id, name, category) VALUES
    (1, 'Laptop', 'Electronics'),
    (2, 'T-Shirt', 'Apparel'),
    (3, 'Coffee Mug', 'Kitchenware');

    INSERT INTO customers (customer_id, name, region) VALUES
    (101, 'Alice', 'North America'),
    (102, 'Bob', 'Europe'),
    (103, 'Charlie', 'Asia');

    INSERT INTO sales (sale_id, product_id, customer_id, timestamp, amount) VALUES
    (generateUUIDv4(), 1, 101, now(), 1200.00),
    (generateUUIDv4(), 2, 102, now(), 25.50),
    (generateUUIDv4(), 3, 103, now(), 15.00),
    (generateUUIDv4(), 1, 102, now(), 1150.00);
EOSQL
