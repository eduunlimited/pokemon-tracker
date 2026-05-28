-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isHome" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LocationSegment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "locationAId" TEXT NOT NULL,
    "locationBId" TEXT NOT NULL,
    "miles" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LocationSegment_locationAId_fkey" FOREIGN KEY ("locationAId") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LocationSegment_locationBId_fkey" FOREIGN KEY ("locationBId") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MileageTrip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "purpose" TEXT NOT NULL,
    "miles" REAL NOT NULL,
    "ratePerMile" REAL NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'manual',
    "locationPath" TEXT,
    "routeSummary" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MileageTrip" ("createdAt", "date", "id", "miles", "notes", "purpose", "ratePerMile", "updatedAt") SELECT "createdAt", "date", "id", "miles", "notes", "purpose", "ratePerMile", "updatedAt" FROM "MileageTrip";
DROP TABLE "MileageTrip";
ALTER TABLE "new_MileageTrip" RENAME TO "MileageTrip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LocationSegment_locationAId_locationBId_key" ON "LocationSegment"("locationAId", "locationBId");
