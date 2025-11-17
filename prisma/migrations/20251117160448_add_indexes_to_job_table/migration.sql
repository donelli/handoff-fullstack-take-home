-- CreateIndex
CREATE INDEX "Job_createdByUserId_status_idx" ON "Job"("createdByUserId", "status");

-- CreateIndex
CREATE INDEX "Job_createdByUserId_startDate_idx" ON "Job"("createdByUserId", "startDate");

-- CreateIndex
CREATE INDEX "Job_createdByUserId_endDate_idx" ON "Job"("createdByUserId", "endDate");

-- CreateIndex
CREATE INDEX "Job_createdByUserId_createdAt_idx" ON "Job"("createdByUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Job_createdByUserId_updatedAt_idx" ON "Job"("createdByUserId", "updatedAt");
