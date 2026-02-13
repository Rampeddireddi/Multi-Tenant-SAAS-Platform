# API Documentation

Base URL: `http://localhost:5000/api`

## 1. System (1 Endpoint)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Check system and database health status. | No |

## 2. Authentication & Users (6 Endpoints)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register-tenant` | Register a new tenant organization. | No |
| `POST` | `/auth/login` | Login and retrieve JWT token. | No |
| `GET` | `/auth/me` | Get current logged-in user details. | Yes |
| `GET` | `/auth/users` | List all users in the current tenant. | Yes |
| `POST` | `/auth/users` | Add a new team member (Admin only). | Yes |
| `PUT` | `/auth/profile` | Update own profile (Name/Password). | Yes |

## 3. Projects (5 Endpoints)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | List all projects. | Yes |
| `POST` | `/projects` | Create a new project. | Yes |
| `GET` | `/projects/:id` | Get details of a single project. | Yes |
| `PUT` | `/projects/:id` | Update project status. | Yes |
| `DELETE` | `/projects/:id` | Delete a project (Admin only). | Yes |

## 4. Tasks (5 Endpoints)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects/:id/tasks` | Get all tasks for a project. | Yes |
| `POST` | `/projects/:id/tasks` | Create a new task. | Yes |
| `GET` | `/projects/:id/tasks/:taskId` | Get details of a single task. | Yes |
| `PUT` | `/projects/:id/tasks/:taskId` | Update task status or assignee. | Yes |
| `DELETE` | `/projects/:id/tasks/:taskId` | Delete a task. | Yes |

## 5. Tenants (Super Admin) (2 Endpoints)
| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/tenants` | List all tenants. | Yes (Super Admin) |
| `PUT` | `/tenants/:id/suspend` | Suspend a tenant account. | Yes (Super Admin) |