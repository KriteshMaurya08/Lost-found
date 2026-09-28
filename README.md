# Campus Lost & Found Management System

A complete full-stack web application designed for university colleges to report, manage, search, match, and claim lost and found campus belongings.

---

## 1. Project Overview

On any college campus, students and staff routinely misplace personal belongings—laptops in reading halls, student ID cards in cafeterias, lab notebooks in computer centers, and watches on athletic grounds. Traditional manual lost-and-found registers are decentralized, prone to data loss, and lack verification safeguards.

**Campus Lost & Found** provides a single institutional platform where:
- Students can immediately report lost items or log found articles.
- An automated rule-based algorithm pairs lost reports with found articles based on category, location, date proximity, and descriptive keyword tokens.
- Rightful owners can submit confidential ownership claims with identifying proofs (e.g., serial numbers, screen locks, distinguishing marks).
- Campus administrators verify claims, authorize handovers, and transition item statuses.

---

## 2. Architecture & Technology Stack

```
               [ USERS (Students & Staff) ]
                            │
                            ▼
                  [ REACT FRONTEND (SPA) ]
                 HTML5, Tailwind CSS, JSX
                            │
                 HTTP REST Calls (JSON)
                            ▼
               [ SPRING BOOT REST BACKEND ]
                 Java 17, Spring Boot 3.x
                            │
                      SERVICE LAYER
               (Validation, Security, Match)
                            │
                            ▼
               [ DIRECT JDBC DATA ACCESS ]
          JdbcTemplate & PreparedStatement
       (Strictly No Hibernate / No JPA / No ORM)
                            │
                            ▼
              [ MYSQL RELATIONAL DATABASE ]
              InnoDB Engine, UTF-8 Charset
```

### Technology Breakdown

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, JavaScript (JSX), Tailwind CSS | Responsive, accessible, human-designed user interface |
| **Backend** | Java 17, Spring Boot 3.x, REST API | Business logic, authentication, match scoring, and authorization |
| **Data Access** | Spring JDBC (`JdbcTemplate`, `PreparedStatement`) | Parameterized SQL queries without ORM abstraction |
| **Database** | MySQL 8.0 (InnoDB) | Relational persistence with foreign keys, indexes, and constraints |
| **Security** | BCrypt Password Hashing | Cryptographic one-way hashing for user password storage |

---

## 3. Database Schema & Tables

Defined in `backend-spring-boot/src/main/resources/schema.sql`:

1. **`users`**:
   - `id` (BIGINT PK, AUTO_INCREMENT)
   - `full_name` (VARCHAR(100) NOT NULL)
   - `email` (VARCHAR(150) NOT NULL UNIQUE)
   - `phone` (VARCHAR(20) NOT NULL)
   - `student_id` (VARCHAR(50) NOT NULL UNIQUE)
   - `password_hash` (VARCHAR(255) NOT NULL)
   - `role` (ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT')
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`categories`**:
   - `id` (BIGINT PK)
   - `name` (VARCHAR(50) UNIQUE)
   - `icon` (VARCHAR(50))
   - `description` (VARCHAR(255))

3. **`locations`**:
   - `id` (BIGINT PK)
   - `name` (VARCHAR(100) UNIQUE)
   - `campus_zone` (VARCHAR(100))
   - `description` (VARCHAR(255))

4. **`items`**:
   - `id` (BIGINT PK)
   - `user_id` (BIGINT FK -> `users.id`)
   - `title` (VARCHAR(150) NOT NULL)
   - `type` (ENUM('LOST', 'FOUND') NOT NULL)
   - `category_id` (BIGINT FK -> `categories.id`)
   - `location_id` (BIGINT FK -> `locations.id`)
   - `description` (TEXT NOT NULL)
   - `date_reported` (DATE NOT NULL)
   - `status` (ENUM('ACTIVE', 'CLAIMED', 'RETURNED', 'RESOLVED') DEFAULT 'ACTIVE')
   - `image_url` (VARCHAR(500))
   - `contact_info` (VARCHAR(150))
   - `created_at`, `updated_at` (TIMESTAMP)

5. **`claims`**:
   - `id` (BIGINT PK)
   - `item_id` (BIGINT FK -> `items.id`)
   - `user_id` (BIGINT FK -> `users.id`)
   - `claimant_name`, `claimant_email`, `claimant_phone`
   - `proof_details` (TEXT NOT NULL)
   - `explanation` (TEXT)
   - `status` (ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING')
   - `admin_notes` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMP)

6. **`possible_matches`**:
   - `id` (BIGINT PK)
   - `lost_item_id` (BIGINT FK -> `items.id`)
   - `found_item_id` (BIGINT FK -> `items.id`)
   - `match_score` (INT 0-100)
   - `match_reasons` (TEXT)
   - `status` (ENUM('POTENTIAL', 'CONFIRMED', 'DISMISSED'))

---

## 4. REST API Endpoint Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Student/Staff registration with BCrypt hashing |
| `POST` | `/api/auth/login` | Public | Authenticates credentials against MySQL users table |
| `POST` | `/api/auth/logout` | Authenticated | Terminates active user session |
| `GET` | `/api/auth/me` | Authenticated | Fetches profile of the currently signed-in user |
| `PUT` | `/api/auth/profile` | Authenticated | Updates student name and phone number |
| `GET` | `/api/items` | Public | Retrieves items with search, filter, and sort |
| `GET` | `/api/items/lost` | Public | Retrieves only LOST items |
| `GET` | `/api/items/found` | Public | Retrieves only FOUND items |
| `GET` | `/api/items/:id` | Public | Fetches item details, reporter details, and match hints |
| `POST` | `/api/items` | Authenticated | Creates a new LOST or FOUND report in MySQL |
| `PATCH` | `/api/items/:id/status`| Owner / Admin | Updates item status (`ACTIVE`, `CLAIMED`, etc.) |
| `DELETE`| `/api/items/:id` | Owner / Admin | Permanently deletes an item and associated matches |
| `POST` | `/api/claims` | Authenticated | Submits proof claim against an active FOUND item |
| `GET` | `/api/my/reports` | Authenticated | Retrieves reports filed by logged-in user |
| `GET` | `/api/my/claims` | Authenticated | Retrieves claims filed by logged-in user |
| `GET` | `/api/claims` | Admin Only | Retrieves all claims with optional status filter |
| `PATCH` | `/api/claims/:id/status`| Admin Only | Approves or rejects a claim; updates item to CLAIMED |
| `GET` | `/api/matches` | Public | Lists all rule-based item match pairings |
| `GET` | `/api/admin/stats` | Admin Only | Aggregates real counts from MySQL tables |
| `GET` | `/api/admin/users` | Admin Only | Lists registered users (passwords omitted) |

---

## 5. How to Run the Project

### Option A: Running the Full Application in AI Studio / Node

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev

# App runs at: http://localhost:3000
```

### Option B: Running the Java Spring Boot Backend Independently with MySQL

```bash
# 1. Start your local MySQL server
mysql -u root -p

# 2. Run the schema and data scripts
SOURCE backend-spring-boot/src/main/resources/schema.sql;
SOURCE backend-spring-boot/src/main/resources/data.sql;

# 3. Open application.properties and verify credentials:
# spring.datasource.username=root
# spring.datasource.password=your_password

# 4. Build and run Spring Boot backend:
cd backend-spring-boot
./mvnw clean spring-boot:run
# Backend runs at http://localhost:8080
```

---

## 6. Pre-Configured Test Accounts for Viva Demonstration

| Role | Name | Email | Password | Student ID |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | Campus Admin Office | `admin@campus.edu` | `Admin@123` | `ADM-2024-001` |
| **Student 1** | Aarav Sharma | `aarav.sharma@campus.edu` | `Student@123` | `STU-2024-108` |
| **Student 2** | Priya Patel | `priya.patel@campus.edu` | `Student@123` | `STU-2024-215` |

---

## 7. College Viva Q&A Guide

**Q1: Why did you use Direct JDBC instead of Hibernate or Spring Data JPA?**
> *Answer:* Direct JDBC gives complete control over SQL statements, execution plans, and transaction boundaries. It avoids ORM caching anomalies, N+1 query problems, and heavy reflection overhead, making it ideal for demonstrating fundamental database and SQL principles.

**Q2: How do you prevent SQL Injection in your backend?**
> *Answer:* All queries utilize parameterized `PreparedStatement` within `JdbcTemplate`. User inputs are passed as parameters (using `?` placeholders) rather than concatenated strings, ensuring the database engine treats input strictly as literal values.

**Q3: How does the Rule-Based Matching system work?**
> *Answer:* When an item is reported, the system scans active items of the opposite type (`LOST` vs `FOUND`). It evaluates:
> 1. Same category (+35 points)
> 2. Same campus location (+30 points)
> 3. Date proximity within 7 days (+10 to +20 points)
> 4. Overlapping non-stopword descriptive keywords (+8 points per shared term)
> Any pair scoring 45 points or higher is recorded as a `POTENTIAL` match in MySQL with an explanatory justification string.
