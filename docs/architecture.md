# System Architecture

## 1. System Architecture Diagram

The system follows a standard **3-Tier Web Architecture**, fully containerized using Docker. It ensures strict separation of concerns between the presentation layer, business logic layer, and data storage layer.

![System Architecture Diagram](images/system-architecture.png)

### Component Details
* **Client (Browser):** The end-user interface running in the browser.
* **Frontend (Port 3000):** A Single Page Application (SPA) built with React. It handles the UI, client-side routing, and JWT storage. It communicates with the backend via REST API.
* **Backend (Port 5000):** A Node.js/Express server. It acts as the gatekeeper, handling Authentication (Auth), Authorization (RBAC), and Tenant Isolation (Middleware).
* **Database (Port 5432):** A PostgreSQL instance. It stores all persistent data. All tables (except tenants) are shared but logically isolated via a `tenant_id` column.

---

## 2. Database Schema Design (ERD)

The database uses a **Shared Schema** approach. The `tenant_id` Foreign Key is the critical mechanism for data isolation.

![Database ERD](images/database-erd.png)

### Tables & Relationships

1.  **Tenants**
    * **PK:** `id` (UUID)
    * **Fields:** `name`, `subdomain`, `subscription_plan`, `max_users`, `max_projects`
    * **Purpose:** Stores organization details and subscription limits.

2.  **Users**
    * **PK:** `id` (UUID)
    * **FK:** `tenant_id` -> Tenants.id (Nullable for Super Admins)
    * **Fields:** `email` (Unique per tenant), `password_hash`, `role` (super_admin, tenant_admin, user)
    * **Purpose:** Stores authentication credentials and role info.

3.  **Projects**
    * **PK:** `id` (UUID)
    * **FK:** `tenant_id` -> Tenants.id (Enforces isolation)
    * **FK:** `created_by` -> Users.id
    * **Fields:** `name`, `description`, `status`
    * **Purpose:** The main resource managed by tenants.

4.  **Tasks**
    * **PK:** `id` (UUID)
    * **FK:** `tenant_id` -> Tenants.id
    * **FK:** `project_id` -> Projects.id
    * **FK:** `assigned_to` -> Users.id
    * **Fields:** `title`, `priority`, `status`, `due_date`
    * **Purpose:** Granular work items linked to projects.

5.  **Audit_Logs**
    * **PK:** `id` (UUID)
    * **FK:** `tenant_id` -> Tenants.id
    * **FK:** `user_id` -> Users.id
    * **Fields:** `action`, `details`, `ip_address`, `created_at`
    * **Purpose:** Security and compliance tracking.

---

## 3. API Architecture

The API follows RESTful principles. All endpoints return responses in a standard JSON format: `{ "success": boolean, "data": object, "message": string }`.

### Module: System
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Check system & DB status | No | Public |

### Module: Authentication (Auth)
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register-tenant` | Register new organization | No | Public |
| `POST` | `/api/auth/login` | Login & receive JWT | No | Public |
| `GET` | `/api/auth/me` | Get current user profile | **Yes** | All |
| `GET` | `/api/auth/users` | List team members | **Yes** | All |
| `POST` | `/api/auth/users` | Add new team member | **Yes** | Tenant Admin |

### Module: Tenants (Super Admin)
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tenants` | List all registered tenants | **Yes** | Super Admin |
| `PUT` | `/api/tenants/:id/suspend` | Suspend a tenant account | **Yes** | Super Admin |

### Module: Projects
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/projects` | List projects for tenant | **Yes** | All |
| `POST` | `/api/projects` | Create project (Limit checked) | **Yes** | All |
| `GET` | `/api/projects/:id` | Get single project details | **Yes** | All |
| `PUT` | `/api/projects/:id` | Update project status | **Yes** | All |
| `DELETE` | `/api/projects/:id` | Delete project | **Yes** | Tenant Admin |

### Module: Tasks
| Method | Endpoint | Description | Auth Required | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/projects/:pid/tasks` | Get tasks for a project | **Yes** | All |
| `POST` | `/api/projects/:pid/tasks` | Create a new task | **Yes** | All |
| `PUT` | `/api/projects/:pid/tasks/:tid`| Update task status/assignee | **Yes** | All |
| `DELETE` | `/api/projects/:pid/tasks/:tid`| Delete a task | **Yes** | All |