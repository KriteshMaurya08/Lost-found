# MySQL Setup & Configuration Guide

This guide details how to install, configure, and inspect the MySQL database for **Campus Lost & Found**.

---

## 1. Database Creation Script

Log in to your MySQL terminal:
```bash
mysql -u root -p
```

Execute the database creation and character set command:
```sql
CREATE DATABASE IF NOT EXISTS campus_lost_found
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE campus_lost_found;
```

---

## 2. Running Schema and Seed Data

Execute the bundled SQL files:
```bash
mysql -u root -p campus_lost_found < backend-spring-boot/src/main/resources/schema.sql
mysql -u root -p campus_lost_found < backend-spring-boot/src/main/resources/data.sql
```

Verify tables created:
```sql
SHOW TABLES;
-- Expected output:
-- +-------------------------------+
-- | Tables_in_campus_lost_found   |
-- +-------------------------------+
-- | categories                    |
-- | claims                        |
-- | items                         |
-- | locations                     |
-- | possible_matches              |
-- | users                         |
-- +-------------------------------+
-- 6 rows in set (0.00 sec)
```

---

## 3. Spring Boot Datasource Configuration

Ensure `backend-spring-boot/src/main/resources/application.properties` matches your local MySQL server credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/campus_lost_found?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=root
spring.datasource.password=root123
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP Connection Pool
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=2
```

---

## 4. Key MySQL Queries for Demonstration

### Check All Active Lost Items:
```sql
SELECT i.id, i.title, c.name AS category, l.name AS location, i.date_reported, u.full_name AS reporter
FROM items i
JOIN categories c ON i.category_id = c.id
JOIN locations l ON i.location_id = l.id
JOIN users u ON i.user_id = u.id
WHERE i.type = 'LOST' AND i.status = 'ACTIVE'
ORDER BY i.date_reported DESC;
```

### Check Pending Ownership Claims:
```sql
SELECT cl.id, i.title AS item_name, cl.claimant_name, cl.claimant_email, cl.proof_details, cl.status
FROM claims cl
JOIN items i ON cl.item_id = i.id
WHERE cl.status = 'PENDING';
```

### Inspect Algorithmic Matches:
```sql
SELECT pm.id, l.title AS lost_item, f.title AS found_item, pm.match_score, pm.match_reasons
FROM possible_matches pm
JOIN items l ON pm.lost_item_id = l.id
JOIN items f ON pm.found_item_id = f.id
ORDER BY pm.match_score DESC;
```
