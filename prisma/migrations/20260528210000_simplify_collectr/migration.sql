-- DropTable
PRAGMA foreign_keys=OFF;
DROP TABLE "InventoryItem";

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "mileageRate" REAL NOT NULL DEFAULT 0.67,
    "collectrInventoryValue" REAL NOT NULL DEFAULT 0,
    "collectrUpdatedAt" DATETIME
);
INSERT INTO "new_AppSetting" ("id", "mileageRate") SELECT "id", "mileageRate" FROM "AppSetting";
DROP TABLE "AppSetting";
ALTER TABLE "new_AppSetting" RENAME TO "AppSetting";
PRAGMA foreign_keys=ON;
