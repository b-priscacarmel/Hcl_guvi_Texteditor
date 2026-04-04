# ✦ CollabDocs — Real-time Collaborative Text Editor

> A Google Docs-inspired collaborative editor where multiple users can edit the same document simultaneously with live cursor tracking, user presence indicators, rich text formatting, and full revision history.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=flat-square&logo=springboot)
![Database](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql)
![WebSocket](https://img.shields.io/badge/Protocol-STOMP%20%2F%20WebSocket-010101?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 📖 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Setup & Installation](#-setup--installation)
  - [Prerequisites](#prerequisites)
  - [Database Setup](#1-database-setup)
  - [Backend Setup](#2-backend-setup-spring-boot)
  - [Frontend Setup](#3-frontend-setup-react--vite)
- [WebSocket API Reference](#-websocket-api-reference)
- [REST API Reference](#-rest-api-reference)
- [Environment Configuration](#-environment-configuration)
- [AI Tools Used](#-ai-tools-used)
- [Known Limitations](#-known-limitations)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Status |
|---|---|
| Real-time text synchronisation across multiple users | ✅ |
| User presence indicators (who is online) | ✅ |
| Colour-coded cursor position tracking per user | ✅ |
| Rich text formatting — Bold, Italic, Underline, Strikethrough | ✅ |
| Heading levels (H1, H2), lists, blockquote, alignment | ✅ |
| Document persistence to MySQL | ✅ |
| Auto-save every 2 seconds | ✅ |
| Manual version snapshots with restore | ✅ |
| Revision history with preview and author info | ✅ |
| Multiple documents — create, browse, delete | ✅ |
| WebSocket reconnect on disconnect | ✅ |
| Responsive layout (mobile + desktop) | ✅ |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool & dev server |
| React Router DOM | 6.x | Client-side routing |
| React Quill | 2.x | Rich text editor (Quill.js wrapper) |
| @stomp/stompjs | 7.x | STOMP WebSocket client |
| SockJS-client | 1.6.x | WebSocket fallback transport |
| Axios | 1.x | HTTP REST client |
| React Hot Toast | 2.x | Notifications |
| date-fns | 3.x | Date formatting |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.x | Application framework |
| Spring WebSocket | — | STOMP broker + WebSocket support |
| Spring Data JPA | — | ORM / database access |
| Spring Web | — | REST controllers |
| Hibernate | — | JPA implementation |
| Lombok | — | Boilerplate reduction |
| MySQL Connector/J | — | MySQL JDBC driver |

### Database
| Technology | Purpose |
|---|---|
| MySQL 8.x | Persistent document and version storage |

### Communication Protocol
| Layer | Technology |
|---|---|
| Transport | WebSocket (with SockJS fallback) |
| Messaging | STOMP (Simple Text Oriented Messaging Protocol) |
| REST | JSON over HTTP |

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐  ┌─────────┐  │
│  │LoginPage │   │HomePage  │   │DocumentPage│ │History  │  │
│  └──────────┘   └──────────┘   └──────────┘  └─────────┘  │
│                      ↑ React Router                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            useCollaboration (hook)                    │  │
│  │  ┌──────────────┐     ┌───────────────────────────┐  │  │
│  │  │  websocket.js │     │         api.js            │  │  │
│  │  │  (STOMP/WS)  │     │      (Axios HTTP)         │  │  │
│  │  └──────┬───────┘     └─────────────┬─────────────┘  │  │
│  └─────────┼───────────────────────────┼────────────────┘  │
└────────────┼───────────────────────────┼───────────────────┘
             │ WebSocket (SockJS)         │ HTTP/REST
             │ STOMP frames               │
┌────────────┼───────────────────────────┼───────────────────┐
│            │     SPRING BOOT SERVER     │                   │
│  ┌─────────▼────────────┐   ┌──────────▼─────────────────┐ │
│  │  EditMessageHandler  │   │    DocumentController       │ │
│  │  (STOMP @MessageMap) │   │    PresenceController       │ │
│  └─────────┬────────────┘   └──────────┬─────────────────┘ │
│            │                            │                   │
│  ┌─────────▼────────────────────────────▼─────────────────┐ │
│  │         DocumentService  +  PresenceService             │ │
│  │    (business logic, OT/last-write-wins, colour mgmt)    │ │
│  └─────────┬────────────────────────────┬─────────────────┘ │
│            │                            │                   │
│  ┌─────────▼────────────┐   ┌───────────▼────────────────┐ │
│  │  DocumentRepository  │   │    VersionRepository        │ │
│  │  (Spring Data JPA)   │   │    (Spring Data JPA)        │ │
│  └─────────┬────────────┘   └───────────┬────────────────┘ │
└────────────┼───────────────────────────-┼───────────────────┘
             │                             │
┌────────────▼─────────────────────────────▼──────────────────┐
│                       MySQL 8                                │
│        ┌─────────────────┐  ┌──────────────────────┐        │
│        │    documents     │  │   document_versions   │        │
│        │─────────────────│  │──────────────────────│        │
│        │ id (PK)         │  │ id (PK)               │        │
│        │ title           │  │ document_id (FK)      │        │
│        │ content (LONG)  │  │ content (LONG)        │        │
│        │ created_by      │  │ saved_by              │        │
│        │ created_at      │  │ version_number        │        │
│        │ updated_at      │  │ created_at            │        │
│        └─────────────────┘  └──────────────────────┘        │
└──────────────────────────────────────────────────────────────┘
```

### Real-time Sync Flow

```
User A types                 Spring Boot               User B (and C, D...)
─────────                   ────────────               ───────────────────
keystroke
  │
  ▼
useCollaboration
(debounce 300ms)
  │
  ▼
sendEdit() via STOMP ──────► /app/edit
                              │
                         EditMessageHandler
                              │
                    ┌─────────┴──────────┐
                    │  persist to MySQL   │
                    │  (updateContent)    │
                    └─────────┬──────────┘
                              │
                    broadcast to all subscribers
                              │
                    /topic/document/{id} ──────────► onEdit callback
                                                         │
                                                    apply to Quill editor
                                                    (remote user sees update)
```

### Presence & Cursor Flow

```
User joins document
  │
  ▼
sendPresence(JOINED)  ──► /app/presence
                              │
                         PresenceService.addUser()
                         (assigns colour, tracks session)
                              │
                         broadcast to /topic/presence/{id}
                              │
                    All users ◄─── { activeUsers: [...] }
                    update UserList component

Cursor moves
  │
  ▼
sendCursor(position)  ──► /app/cursor  ──► /topic/cursor/{id}
                                                │
                                      CursorLayer shows badge
                                      with blinking caret
```

---

## 📁 Project Structure

```
collab-editor/
├── README.md
│
├── frontend/                          # React + Vite app
│   ├── index.html
│   ├── vite.config.js                 # Proxy config for /api and /ws
│   ├── package.json
│   └── src/
│       ├── main.jsx                   # Entry point
│       ├── App.jsx                    # Router + auth state
│       ├── index.css                  # Global dark editorial theme
│       │
│       ├── components/
│       │   ├── Editor.jsx             # Quill editor + collab hooks
│       │   ├── Toolbar.jsx            # Formatting toolbar + title input
│       │   ├── UserList.jsx           # Online user presence pills
│       │   ├── CursorLayer.jsx        # Coloured remote cursor badges
│       │   └── VersionHistory.jsx     # Revision history modal
│       │
│       ├── pages/
│       │   ├── LoginPage.jsx          # Username entry
│       │   ├── HomePage.jsx           # Document list + create/delete
│       │   └── DocumentPage.jsx       # Full editing experience
│       │
│       ├── services/
│       │   ├── websocket.js           # STOMP connect/publish/subscribe
│       │   └── api.js                 # Axios REST helpers
│       │
│       ├── hooks/
│       │   └── useCollaboration.js    # WS lifecycle + debounced broadcast
│       │
│       ├── yjs/
│       │   └── yjsConfig.js           # Yjs CRDT setup (in-memory layer)
│       │
│       └── utils/
│           └── debounce.js            # debounce + throttle utilities
│
└── backend/                           # Spring Boot app
    ├── pom.xml
    └── src/main/
        ├── resources/
        │   └── application.properties
        └── java/com/collab/editor/
            ├── CollabEditorApplication.java
            ├── config/
            │   ├── WebSocketConfig.java    # STOMP broker + SockJS endpoint
            │   └── CorsConfig.java         # CORS filter
            ├── controller/
            │   ├── DocumentController.java # REST CRUD + versions
            │   └── PresenceController.java # REST fallback for active users
            ├── websocket/
            │   └── EditMessageHandler.java # @MessageMapping handlers
            ├── service/
            │   ├── DocumentService.java    # Business logic + versioning
            │   └── PresenceService.java    # In-memory user session tracking
            ├── repository/
            │   ├── DocumentRepository.java
            │   └── VersionRepository.java
            ├── model/
            │   ├── Document.java
            │   ├── DocumentVersion.java
            │   └── UserSession.java        # In-memory (not persisted)
            └── dto/
                ├── EditMessage.java
                ├── CursorMessage.java
                └── PresenceMessage.java
```

---

## 🚀 Setup & Installation

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Download |
|---|---|---|
| Java JDK | 17+ | https://adoptium.net |
| Apache Maven | 3.8+ | https://maven.apache.org |
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | Included with Node.js |
| MySQL | 8.0+ | https://dev.mysql.com/downloads |

---

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create the database (Spring Boot will create tables automatically)
CREATE DATABASE collab_editor;

# Optional: create a dedicated user (recommended for production)
CREATE USER 'collab_user'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON collab_editor.* TO 'collab_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

---

### 2. Backend Setup (Spring Boot)

```bash
# Clone the repository
git clone https://github.com/your-username/collab-editor.git
cd collab-editor/backend
```

Edit `src/main/resources/application.properties`:

```properties
# Update these values to match your MySQL setup
spring.datasource.url=jdbc:mysql://localhost:3306/collab_editor?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

```bash
# Build and run
mvn clean install
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**

Spring Boot will automatically create the `documents` and `document_versions` tables via Hibernate (`ddl-auto=update`).

Verify the backend is running:
```bash
curl http://localhost:8080/api/documents
# Should return: []
```

---

### 3. Frontend Setup (React + Vite)

```bash
# Navigate to frontend folder
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on **http://localhost:5173**

Open your browser and go to `http://localhost:5173`.

To test real-time collaboration:
1. Open the same document URL in **two or more browser tabs/windows**
2. Enter different usernames in each
3. Start typing — changes sync instantly across all tabs

---

### Production Build

```bash
# Build frontend for production
cd frontend
npm run build
# Output is in frontend/dist/

# Build backend JAR
cd ../backend
mvn clean package
java -jar target/editor-0.0.1-SNAPSHOT.jar
```

---

## 📡 WebSocket API Reference

### Connection Endpoint

```
ws://localhost:8080/ws
(SockJS fallback: http://localhost:8080/ws)
```

### Subscribe Topics

| Topic | Description | Payload |
|---|---|---|
| `/topic/document/{id}` | Receive real-time edits | `EditMessage` |
| `/topic/presence/{id}` | Receive user join/leave events | `PresenceMessage` |
| `/topic/cursor/{id}` | Receive cursor position updates | `CursorMessage` |

### Publish Destinations

| Destination | Description | Payload |
|---|---|---|
| `/app/edit` | Send a text edit | `EditMessage` |
| `/app/presence` | Announce join/leave | `PresenceMessage` |
| `/app/cursor` | Send cursor position | `CursorMessage` |

### Message Schemas

**EditMessage**
```json
{
  "documentId": "1",
  "content": "<p>Hello world</p>",
  "user": "romia",
  "timestamp": 1714000000000
}
```

**PresenceMessage (send)**
```json
{
  "documentId": "1",
  "user": "romia",
  "status": "JOINED"
}
```

**PresenceMessage (receive — includes active users list)**
```json
{
  "documentId": "1",
  "user": "romia",
  "status": "JOINED",
  "color": "#4ECDC4",
  "activeUsers": [
    { "username": "romia", "color": "#4ECDC4", "cursorPosition": 42 },
    { "username": "alex",  "color": "#FF6B6B", "cursorPosition": 10 }
  ]
}
```

**CursorMessage**
```json
{
  "documentId": "1",
  "user": "romia",
  "position": 120,
  "color": "#4ECDC4"
}
```

---

## 🌐 REST API Reference

### Document Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/documents` | Create a new document | `{ "title": "My Doc", "createdBy": "romia" }` |
| `GET` | `/api/documents` | List all documents | — |
| `GET` | `/api/documents/{id}` | Get a document by ID | — |
| `PUT` | `/api/documents/{id}` | Update title/content | `{ "title": "...", "content": "...", "updatedBy": "romia" }` |
| `DELETE` | `/api/documents/{id}` | Delete a document | — |

### Version Endpoints

| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/documents/{id}/versions` | Save a version snapshot | `{ "savedBy": "romia" }` |
| `GET` | `/api/documents/{id}/versions` | Get all versions (newest first) | — |

### Presence Endpoint (REST Fallback)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/documents/{id}/users` | Get currently active users |

### Example cURL calls

```bash
# Create a document
curl -X POST http://localhost:8080/api/documents \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Doc", "createdBy": "romia"}'

# Get the document
curl http://localhost:8080/api/documents/1

# Save a version
curl -X POST http://localhost:8080/api/documents/1/versions \
  -H "Content-Type: application/json" \
  -d '{"savedBy": "romia"}'

# Get all versions
curl http://localhost:8080/api/documents/1/versions
```

---

## ⚙️ Environment Configuration

### Backend — `application.properties`

```properties
# Server port
server.port=8080

# MySQL connection
spring.datasource.url=jdbc:mysql://localhost:3306/collab_editor?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# CORS — update for production with your deployed frontend URL
app.cors.allowed-origins=http://localhost:5173
```

### Frontend — `vite.config.js`

The Vite dev server proxies all `/api` and `/ws` requests to the Spring Boot backend so there are no CORS issues during development:

```js
server: {
  proxy: {
    '/api': 'http://localhost:8080',
    '/ws':  { target: 'http://localhost:8080', ws: true }
  }
}
```

For production deployment, update your reverse proxy (Nginx/Apache) to forward these paths to the backend, or configure CORS in `CorsConfig.java` with your deployed frontend domain.

---

## 🤖 AI Tools Used

This project was developed with assistance from the following AI tools:

| Tool | Usage |
|---|---|
| **Claude (Anthropic)** | Full-stack code generation — Spring Boot backend (WebSocket config, JPA models, REST controllers, service layer), React frontend (components, hooks, WebSocket integration, CSS theming), README documentation, and architecture design |

**Specific areas where AI assistance was used:**

- Designing the STOMP WebSocket message flow (subscribe/publish topics)
- Spring Boot `@MessageMapping` handler structure for real-time broadcast
- `useCollaboration` React hook with debounced broadcasting and remote-edit loop prevention
- Dark editorial CSS theme (Syne + Inter + JetBrains Mono font pairing)
- Conflict resolution strategy (last-write-wins with `ignoreNextEditRef` to prevent echo loops)
- `PresenceService` in-memory user session management with colour assignment

**All AI-generated code was reviewed, tested, and integrated by the developer.**

---

##Known Limitations

### Conflict Resolution
- The current implementation uses **last-write-wins (LWW)** — the most recent `content` broadcast overwrites the editor state for all other users.
- Full **Operational Transformation (OT)** or **CRDT** (e.g. Yjs) is not implemented. In high-concurrency scenarios with multiple users typing in the same character position simultaneously, one user's change may be overwritten.
- `yjsConfig.js` is scaffolded but the Yjs CRDT layer is not wired to the STOMP backend (a proper Yjs setup requires a `y-websocket` server, which would need a separate Node.js process alongside Spring Boot).

### Authentication & Security
- There is **no real authentication** — usernames are entered freely on the login screen and stored in `sessionStorage`.
- Any user can open any document by navigating to its URL.
- There is **no authorisation** — all users can edit, delete, and restore versions on all documents.
- No HTTPS is configured — must be added before any public deployment.

### Scalability
- The `PresenceService` stores active user sessions **in-memory** on the single JVM instance.
- If the application is scaled horizontally (multiple instances), presence data will not be shared between instances. A Redis-backed session store would be needed for multi-node deployments.
- The STOMP simple broker is in-memory — it does not support clustering. A dedicated message broker (e.g. RabbitMQ, ActiveMQ) would be required for horizontal scaling.

### Auto-save & Data Loss
- Auto-save fires **2 seconds** after the last keystroke. If the browser tab is closed within that window, the last edits may not persist.
- There is no dirty-state indicator to warn the user about unsaved changes.

### Mobile / Accessibility
- The Quill editor and toolbar are functional but not fully optimised for mobile keyboards and touch interactions.
- ARIA labels and keyboard navigation are partial — the application is not fully WCAG 2.1 compliant.

### Version History
- Each manual "Save Version" snapshot stores the **full document content** as HTML, which is storage-inefficient for large documents. A diff/delta approach would be more efficient.
- There is no limit on the number of versions per document — old versions are never automatically pruned.

---

## 🔮 Future Improvements

- [ ] Add **JWT-based authentication** with Spring Security
- [ ] Add **Redis** for distributed presence and session management
- [ ] Switch STOMP broker from in-memory to **RabbitMQ** or **ActiveMQ** for horizontal scaling
- [ ] Add **document sharing** with permission levels (viewer, commenter, editor)
- [ ] Implement **delta-based version diffs** instead of full content snapshots
- [ ] Add **Google Docs-style comments** (inline annotations tied to text ranges)
- [ ] Add **export to PDF / Word** functionality
- [ ] Add **offline mode** with sync-on-reconnect
- [ ] Add **real-time typing indicators** ("romia is typing…")
- [ ] Deploy with **Docker Compose** for one-command setup

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes with clear messages (`git commit -m "feat: add offline sync"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---


