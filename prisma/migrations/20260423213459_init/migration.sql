-- CreateTable
CREATE TABLE "Reaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reactionType" TEXT NOT NULL,
    "track" TEXT NOT NULL DEFAULT 'CATALYSIS',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetYield" REAL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "discoveryCompleted" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reactionId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "source" TEXT,
    "name" TEXT NOT NULL,
    "formula" TEXT,
    "smiles" TEXT,
    "description" TEXT,
    "predictedActivity" REAL NOT NULL,
    "predictedSelectivity" REAL NOT NULL,
    "predictedStability" REAL NOT NULL,
    "predictedYield" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "reasoning" TEXT NOT NULL,
    "propertyRationale" TEXT NOT NULL,
    CONSTRAINT "Candidate_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateId" TEXT NOT NULL,
    "reactionId" TEXT NOT NULL,
    "measuredActivity" REAL,
    "measuredSelectivity" REAL,
    "measuredStability" REAL,
    "measuredYield" REAL,
    "outcome" TEXT,
    "notes" TEXT,
    "loggedBy" TEXT NOT NULL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Experiment_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Experiment_reactionId_fkey" FOREIGN KEY ("reactionId") REFERENCES "Reaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ModelVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "versionTag" TEXT NOT NULL,
    "trainedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "experimentsUsed" INTEGER NOT NULL,
    "accuracyMetric" REAL NOT NULL,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE INDEX "Candidate_reactionId_predictedActivity_idx" ON "Candidate"("reactionId", "predictedActivity");
