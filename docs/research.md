# Research & Technology Justification

## 1. Multi-Tenancy Analysis

### Introduction
Multi-tenancy is the core architectural requirement for any SaaS (Software as a Service) application. It refers to a software architecture in which a single instance of software runs on a server and serves multiple tenants (customers). A tenant is a group of users who share a common access with specific privileges to the software instance. In our application, a "Tenant" represents a Company or Organization.

Choosing the right database isolation strategy is the most critical decision in SaaS development, as it impacts cost, scalability, data security, and maintainability. We analyzed three primary models before selecting our approach.

### Comparison of Multi-Tenancy Approaches

We evaluated the three standard models: **Database per Tenant**, **Schema per Tenant**, and **Shared Database, Shared Schema**.

| Feature | **1. Separate Database** (Isolation) | **2. Separate Schema** (Shared DB) | **3. Shared Schema** (Discriminator) |
| :--- | :--- | :--- | :--- |
| **Description** | Each tenant has their own dedicated database instance (e.g., `db_tenant_a`, `db_tenant_b`). | One database instance, but each tenant has a unique namespace/schema (e.g., `schema_a.users`, `schema_b.users`). | One database, one schema. All rows live in the same tables, distinguished by a `tenant_id` column. |
| **Data Isolation** | **Highest**. Physically separated data files. Impossible to query across tenants by accident. | **High**. Logical separation at the database level. Permissions can be set per schema. | **Lowest**. Logical separation relies entirely on application code (`WHERE` clauses). |
| **Infrastructure Cost** | **Very High**. Each tenant consumes base resources (RAM/CPU/Storage). Thousands of tenants = thousands of DBs. | **Moderate**. One DB engine running, but metadata overhead increases with thousands of schemas. | **Lowest**. Resources are shared efficiently. Supports free-tier users with near-zero marginal cost. |
| **Scalability** | Hard to scale. Connection pooling becomes a bottleneck as the number of DBs grows. | Moderate. Postgres can handle many schemas, but migrations become slow (looping through 10k schemas). | **Excellent**. Can scale to millions of rows easily using standard indexing and partitioning strategies. |
| **Development** | Complex. Need a catalog database to map Tenants to DB Connections. | Moderate. Migrations must be automated to run across all schemas reliably. | **Simple**. Standard development. One migration updates the entire platform instantly. |
| **Backup/Restore** | Easy per tenant. You can just `pg_dump` a specific tenant's DB. | Moderate. You can dump a specific schema, but restoring it requires care. | Hard per tenant. Restoring one tenant requires extracting specific rows from a massive backup. |
| **"Noisy Neighbor"** | **None**. Heavy load on Tenant A does not affect Tenant B (if on different servers). | **Risk**. A complex query on Schema A consumes CPU/RAM available to Schema B. | **High Risk**. A bad query affects everyone. Requires strict query optimization. |

### Justification for Chosen Approach: Shared Database, Shared Schema

After weighing the pros and cons, we selected the **Shared Database, Shared Schema** approach (Option 3) for this Multi-Tenant SaaS application.

**1. Economic Viability of the "Free Tier"**
Our requirements specify a "Free Plan" for startups. In a "Separate Database" model, even a free user would require a provisioned database instance. On cloud providers like AWS RDS, this would be cost-prohibitive. Even the "Separate Schema" model incurs overhead. The Shared Schema approach allows us to host thousands of free tenants on a single small database instance with negligible marginal cost per tenant.

**2. Operational Simplicity & Migrations**
In a CI/CD pipeline, speed is essential.
* *Separate Schemas:* If we had 5,000 tenants, a deployment requiring a database migration (e.g., adding a `phone_number` column) would need to run the `ALTER TABLE` command 5,000 times. If the process fails at tenant #2,500, we enter an inconsistent state.
* *Shared Schema:* We run `ALTER TABLE users ADD COLUMN phone_number` **once**. It applies to all 5,000 tenants instantly. This atomic nature of deployments drastically reduces DevOps complexity and deployment time.

**3. Connection Pooling Limitations**
PostgreSQL has a limit on concurrent connections.
* In the "Separate Database" model, the application needs to maintain a connection pool for *every active tenant*. If 100 tenants are active, the app might need 100 pools x 10 connections = 1,000 open connections, which quickly exhausts server resources.
* In the "Shared Schema" model, we maintain **one global connection pool**. Whether we have 10 tenants or 10,000, the application only needs a fixed number of connections (e.g., 20-50) to serve them all efficiently.

**4. Performance Handling via Indexing**
While the "Noisy Neighbor" effect is a valid concern, it is mitigated by proper indexing. By ensuring every table has a **Composite Index** on `(tenant_id, id)` or `(tenant_id, created_at)`, PostgreSQL effectively partitions the B-Tree index. This means queries for Tenant A never even scan the index pages belonging to Tenant B. Performance effectively mimics a separate database without the overhead.

**Conclusion**
While "Separate Database" offers superior isolation, it is overkill for a standard B2B SaaS application where cost and agility are priorities. The "Shared Schema" approach allows us to move fast, keep costs low, and handle the "Free Plan" requirement effectively, relying on robust **Application-Level Middleware** to ensure data isolation security.

---

## 2. Technology Stack Justification

### Backend Framework: Node.js with Express
**Why Chosen:**
Node.js was selected for its non-blocking, event-driven architecture. SaaS applications are typically I/O heavy (reading from DB, sending JSON responses) rather than CPU intensive. Node.js handles thousands of concurrent requests on a single thread efficiently.
* **Express.js:** Chosen as the web framework because it is unopinionated and minimalistic. It allows us to easily write custom middleware (like our `tenant_id` extractor) without fighting against "magic" framework logic.
* **Alternatives Considered:**
    * **Python (Django):** Django is excellent but is synchronous (blocking) by default. For a high-concurrency SaaS, this often requires more worker processes and memory.
    * **Java (Spring Boot):** Highly robust but introduces significant boilerplate code and slower startup times, which is less ideal for containerized/microservice environments.

### Frontend Framework: React.js with Tailwind CSS
**Why Chosen:**
* **React:** The component-based architecture is perfect for a Dashboard UI. We can build reusable components like `<ProjectCard />`, `<TaskItem />`, and `<StatWidget />` that accept data as props. The Virtual DOM ensures that real-time status updates (e.g., changing a task from "Todo" to "Done") are rendered instantly without refreshing the page.
* **Tailwind CSS:** Used for styling because it speeds up development. Instead of jumping between `.js` and `.css` files, we apply utility classes directly. It also ensures the design is responsive by default using prefixes like `md:flex` or `lg:w-1/2`.
* **Alternatives Considered:**
    * **Vue.js:** A strong contender, but React has a larger ecosystem and job market support.
    * **Angular:** Too heavy and opinionated for this scope. React offers more flexibility in structuring the state management.

### Database: PostgreSQL
**Why Chosen:**
PostgreSQL is the industry standard for Multi-Tenant SaaS due to its reliability and feature set.
* **Relational Integrity:** We rely heavily on Foreign Keys (`tenant_id` cascading to Projects and Tasks) to ensure data consistency. If a tenant is deleted, `ON DELETE CASCADE` ensures all their data is wiped, preventing "orphan data" leaks.
* **ACID Compliance:** Essential for transactions like "Register Tenant", where we must create a Tenant *and* a User simultaneously. If one fails, the entire transaction rolls back.
* **Alternatives Considered:**
    * **MongoDB:** NoSQL databases lack strict schema enforcement. In a multi-tenant app, accidentally saving a document without a `tenant_id` is a catastrophic security risk. Postgres prevents this via `NOT NULL` constraints.

### Authentication: JSON Web Tokens (JWT)
**Why Chosen:**
JWTs provide **Stateless Authentication**.
* When a user logs in, we sign a token containing their `user_id`, `role`, and `tenant_id`.
* The server does not need to store session data in RAM or Redis. This makes the backend strictly stateless, allowing us to easily scale by adding more backend containers behind a load balancer without worrying about "sticky sessions".
* **Alternatives Considered:**
    * **Session-based Auth (Cookies):** Requires server-side storage (memory/DB) to track active sessions. This increases database load (checking session tables on every request) and complicates horizontal scaling.

### Deployment: Docker & Docker Compose
**Why Chosen:**
Containerization ensures environment consistency. "It works on my machine" is solved because the code runs in the exact same Linux environment (Alpine Node) in development and production. `docker-compose` allows us to spin up the entire stack (Frontend + Backend + DB) with a single command, fulfilling the submission requirement.
* **Alternatives Considered:**
    * **Kubernetes (K8s):** Provides powerful orchestration but brings massive complexity overhead. For a single-node submission, Docker Compose is the correct "right-sized" tool.

---

## 3. Security Considerations

In a Shared Database environment, security is paramount because a single SQL injection flaw could expose every customer's data. We have implemented a "Defense in Depth" strategy.

### 1. Logical Data Isolation (Middleware Strategy)
We do not rely on developers remembering to add `WHERE tenant_id = ?` to every query. Instead, we treat isolation as a systemic requirement.
* **The Mechanism:** We created a middleware called `protect`. This middleware decodes the JWT validation and attaches `req.user` (including `tenant_id`) to the request object.
* **Enforcement:** All controller functions (e.g., `getProjects`) extract `tenant_id` solely from `req.user`. We never accept `tenant_id` from the URL body or query parameters, preventing a user from spoofing their identity by sending `{ "tenant_id": "other_company" }`.

### 2. Authentication & Authorization (RBAC)
We implement a Role-Based Access Control system with three distinct tiers:
* **Super Admin:** Has `tenant_id = NULL`. Can access `/api/tenants` to suspend accounts.
* **Tenant Admin:** Can Create/Delete projects and Add Users.
* **User:** Read-only access to Settings; Can only Edit tasks assigned to them.
* **Implementation:** Critical routes use middleware like `authorize('tenant_admin')`. If a regular user attempts to `DELETE /api/projects/:id`, the middleware intercepts the request before it even reaches the controller logic, returning a `403 Forbidden`.

### 3. Password Hashing Strategy
We never store plain-text passwords.
* **Algorithm:** We use `bcryptjs`.
* **Salting:** We generate a unique salt (Cost Factor 10) for every user. This defends against Rainbow Table attacks. Even if two users have the password "password123", their stored hashes will be completely different.
* **Process:** During login, `bcrypt.compare()` re-hashes the input with the stored salt to verify validity without ever decrypting the original password (which is impossible as hashing is one-way).

### 4. API Security Measures
* **CORS (Cross-Origin Resource Sharing):** We explicitly whitelist only the Frontend container's URL. This prevents malicious third-party websites from making AJAX requests to our backend on behalf of a logged-in user.
* **Helmet:** (Recommended) We use standard HTTP headers to prevent Clickjacking and XSS attacks.
* **Input Validation:** Although not fully detailed in code, relying on parameterized queries (Postgres `$1, $2`) prevents SQL Injection 100% of the time by treating user input as data, not executable code.

### 5. Audit Logging
To ensure accountability, we track destructive actions.
* Every time a project is deleted or a new user is added, we write a row to `audit_logs`.
* This creates an immutable trail. If a project mysteriously disappears, the Tenant Admin can review the logs to see *who* deleted it and *when*. This is crucial for enterprise compliance.