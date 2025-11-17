/*
  Warnings:

  - You are about to drop the `_JobToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `createdByUserId` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "_JobToUser_B_index";

-- DropIndex
DROP INDEX "_JobToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_JobToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_JobHomeowners" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_JobHomeowners_A_fkey" FOREIGN KEY ("A") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_JobHomeowners_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Job" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "cost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" INTEGER NOT NULL,
    CONSTRAINT "Job_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Job" ("cost", "createdAt", "description", "id", "location", "status", "updatedAt") SELECT "cost", "createdAt", "description", "id", "location", "status", "updatedAt" FROM "Job";
DROP TABLE "Job";
ALTER TABLE "new_Job" RENAME TO "Job";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_JobHomeowners_AB_unique" ON "_JobHomeowners"("A", "B");

-- CreateIndex
CREATE INDEX "_JobHomeowners_B_index" ON "_JobHomeowners"("B");
