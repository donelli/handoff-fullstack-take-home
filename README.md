# Fullstack Takehome Exercise

This is a full-stack job management application built for contractors and homeowners to manage construction jobs, tasks, and communication.

## Challenge Description

The original challenge requirements can be found [here](https://handoffai.notion.site/Take-Home-Challenge-Full-Stack-Engineer-191fc39a5fa781abadf6d0bdcf071a26).

## Features Implemented

### Authentication

- User login system with username/password
- Support for two user types: **Contractor** and **Homeowner**
- Role-based access control and UI differences

### Job Management

- **Create Jobs**: Contractors can create new jobs with description, location, cost, start/end dates, and assign multiple homeowners
- **Edit Jobs**: Contractors can update job details
- **Delete Jobs**: Soft delete functionality (jobs are marked as deleted, not permanently removed)
- **View Job Details**: Comprehensive job information page with all details
- **Job Status Management**:
  - Four statuses: Planning, In Progress, Completed, Canceled
  - Contractors can change job status via interactive toggle
  - Homeowners can view current status

### Job Listing

- **Contractor View**:
  - Paginated table with infinite scroll using AG Grid
  - Sortable columns (status, dates, etc.)
  - Configurable page sizes
  - Shows all jobs with full details
- **Homeowner View**:
  - Card-based layout grouped by status
  - Sections: "Jobs in Progress", "Jobs Being Planned", "Finished or Canceled Jobs"
  - Load more pagination

### Job Tasks

- Add multiple tasks to jobs with description and optional cost
- Mark tasks as completed (contractors only)
- View task completion status and completion timestamps
- Task completion tracking with user attribution

### Job Chat

- Real-time messaging system (polling-based)
- Send and receive messages
- Message history with timestamps
- User attribution (shows sender name or "You" for own messages)
- Auto-scroll to latest messages

### Additional Features

- Date range selection (start/end dates) with validation
- Multi-select homeowner assignment
- Form validation and error handling
- Toast notifications for user feedback
- Responsive UI with custom design system components

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes, Apollo Server (GraphQL)
- **Database**: SQLite with Prisma ORM
- **UI**: Custom CSS modules, AG Grid for data tables
- **State Management**: Apollo Client for GraphQL

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm i
   ```

3. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database

The application uses SQLite with Prisma ORM. The database file is located at `prisma/dev.db`.

### Schema Modifications

To modify the database schema:

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev` to create a migration

### Reset Database

To reset the database:

```bash
npx prisma reset
```
