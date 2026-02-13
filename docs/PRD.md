# Product Requirements Document (PRD)

## 1. User Personas

### Persona A: The Super Admin (System Owner)
* **Role Description:** The platform owner who manages the SaaS infrastructure and oversees all tenant organizations. They do not manage project data but ensure system health and compliance.
* **Key Responsibilities:**
    * Monitoring the registration of new tenants.
    * Suspending or banning abusive tenants.
    * Ensuring the system uptime and database health.
* **Main Goals:**
    * Grow the platform's user base.
    * Maintain system stability and security.
    * Prevent unauthorized or malicious use of the platform.
* **Pain Points:**
    * "Blind spots" on who is signing up for the platform.
    * Difficulty in manually accessing the database to disable a specific bad actor.
    * Lack of visibility into system-wide resource usage.

### Persona B: The Tenant Admin (Customer)
* **Role Description:** The manager or business owner who registered their organization. They have full control over their company's workspace, billing, and team members.
* **Key Responsibilities:**
    * Managing the organization's subscription plan.
    * Inviting and removing team members.
    * Creating high-level projects and overseeing delivery.
    * Ensuring data security within their team.
* **Main Goals:**
    * Efficiently manage team projects without administrative friction.
    * Control costs by staying within plan limits.
    * Protect sensitive company data from unauthorized access.
* **Pain Points:**
    * Fear of accidental data loss (e.g., a junior employee deleting a project).
    * Complexity in managing permissions for different team members.
    * Hitting plan limits unexpectedly during critical work periods.

### Persona C: The End User (Team Member)
* **Role Description:** A regular employee or contractor invited to the workspace. They focus on executing specific tasks and updating project statuses.
* **Key Responsibilities:**
    * Completing assigned tasks on time.
    * Updating task statuses (Todo -> In Progress -> Done).
    * Collaborating on specific projects they are assigned to.
* **Main Goals:**
    * Clearly see "What do I need to do today?"
    * Update work progress quickly without navigating complex menus.
    * Access only the projects relevant to their role.
* **Pain Points:**
    * Cluttered interfaces showing irrelevant projects.
    * Confusion over task priorities.
    * Difficulty finding assigned work items.

---

## 2. Functional Requirements

### Module: Authentication & Authorization
* **FR-001:** The system shall allow users to register a new tenant organization with a unique subdomain.
* **FR-002:** The system shall allow users to log in securely using an email and password.
* **FR-003:** The system shall generate a JWT (JSON Web Token) upon successful authentication containing the user's ID, role, and tenant ID.
* **FR-004:** The system shall enforce Role-Based Access Control (RBAC) to restrict sensitive actions (e.g., deleting projects) to Admin roles only.

### Module: Tenant Management
* **FR-005:** The system shall automatically assign a "Free" subscription plan to all newly registered tenants.
* **FR-006:** The system shall enforce strict data isolation so that a user from Tenant A cannot access data belonging to Tenant B.
* **FR-007:** The system shall enforce subscription limits on the number of projects (e.g., Max 3 for Free Plan) before creating a new resource.
* **FR-008:** The system shall enforce subscription limits on the number of users (e.g., Max 5 for Free Plan) before adding a new member.

### Module: User Management
* **FR-009:** The system shall allow Tenant Admins to add new team members by providing their name, email, and password.
* **FR-010:** The system shall allow users to view a list of all other members within their organization.
* **FR-011:** The system shall prevent the creation of a user if their email address is already registered within the same tenant.

### Module: Project Management
* **FR-012:** The system shall allow authenticated users to create new projects with a name, description, and status.
* **FR-013:** The system shall allow users to update the status of a project (e.g., Active to Completed).
* **FR-014:** The system shall allow only Tenant Admins to permanently delete a project and its associated tasks.
* **FR-015:** The system shall display a dashboard view summarizing total projects, active projects, and completed projects.

### Module: Task Management
* **FR-016:** The system shall allow users to create tasks nested under a specific project.
* **FR-017:** The system shall allow users to assign tasks to specific team members.
* **FR-018:** The system shall allow users to filter tasks by "My Active Tasks" on the dashboard.

### Module: System & Security
* **FR-019:** The system shall log all critical actions (Login, Create Project, Delete Project, Add User) to an audit log table.
* **FR-020:** The system shall provide a public health check endpoint (`/api/health`) that returns the database connection status.

---

## 3. Non-Functional Requirements

### Performance
* **NFR-001:** The API shall return a response within 200ms for 90% of standard read requests (e.g., fetching the dashboard).
* **NFR-002:** The database queries shall utilize indexes on `tenant_id` to ensure consistent performance as the dataset grows.

### Security
* **NFR-003:** All user passwords must be hashed using `bcrypt` (or equivalent) before storage in the database.
* **NFR-004:** API endpoints must authenticate requests using JWTs that expire after a maximum of 24 hours.
* **NFR-005:** The system shall prevent Cross-Origin Resource Sharing (CORS) attacks by whitelisting only the frontend application's domain.

### Scalability
* **NFR-006:** The system architecture shall support a minimum of 100 concurrent users without service degradation.
* **NFR-007:** The database schema shall support horizontal scaling of tenants (Shared Database, Shared Schema approach) to accommodate thousands of organizations.

### Availability
* **NFR-008:** The application services (Frontend, Backend, Database) must be containerized via Docker to ensure 99% uptime through rapid recovery and consistent environments.

### Usability
* **NFR-009:** The frontend user interface shall be responsive and fully functional on mobile devices with a minimum screen width of 320px.
* **NFR-010:** The system shall provide clear, user-friendly error messages (e.g., "Plan limit reached") instead of generic server errors.