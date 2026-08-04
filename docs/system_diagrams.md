# System Diagrams & Documentation

This directory contains visual mappings of the system's database relationships, authentication configurations, and architectural layout.

## 1. System Architecture Diagram

```mermaid
graph TD
    User([Web Client]) -->|HTTPS| NextJS[Next.js App Router]
    NextJS -->|Server Actions / API| SupabaseAPI[Supabase JS Client API]
    NextJS -->|Static Assets / SSR| VercelEdge[Vercel CDN Edge]
    
    subgraph Supabase Backend
        SupabaseAPI --> Auth[GoTrue Authentication]
        SupabaseAPI --> Postgres[(PostgreSQL Database)]
        SupabaseAPI --> Storage[Supabase Storage Buckets]
    end

    Postgres -->|RLS Policies| Security[Role Enforcement Engine]
```

---

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant App as Next.js Middleware/Server Action
    participant Supabase as Supabase Auth Server
    participant DB as Postgres Profiles Table

    User->>App: Input Employee/Student ID & Password
    App->>DB: Query profile email matching ID (Service Role)
    DB-->>App: Return User Email & Role
    App->>Supabase: SignInWithPassword(Email, Password)
    Supabase-->>App: Return JWT Token Session
    App->>User: Set Cookie / Redirect based on role-home routing
```

---

## 3. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    profiles {
        uuid id PK
        varchar email UK
        varchar full_name
        varchar role
        varchar employee_or_student_id UK
    }
    students {
        uuid profile_id PK, FK
        varchar roll_number UK
        uuid department_id FK
        uuid semester_id FK
        uuid section_id FK
    }
    faculty {
        uuid profile_id PK, FK
        uuid department_id FK
        varchar designation
    }
    departments {
        uuid id PK
        uuid college_id FK
        varchar code UK
        varchar name
    }
    subjects {
        uuid id PK
        uuid section_id FK
        varchar code
        varchar name
    }

    profiles ||--o| students : "extends"
    profiles ||--o| faculty : "extends"
    departments ||--o{ students : "enrolls"
    departments ||--o{ faculty : "employs"
    subjects ||--o{ faculty : "assigned to"
```
