-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CommuteConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "toCollegeMinutes" INTEGER NOT NULL DEFAULT 30,
    "fromCollegeMinutes" INTEGER NOT NULL DEFAULT 30,
    "restBufferMinutes" INTEGER NOT NULL DEFAULT 45,
    "wakeMinute" INTEGER NOT NULL DEFAULT 360,
    "sleepMinute" INTEGER NOT NULL DEFAULT 1380,
    CONSTRAINT "CommuteConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CommuteConfig" ("fromCollegeMinutes", "id", "restBufferMinutes", "toCollegeMinutes", "userId") SELECT "fromCollegeMinutes", "id", "restBufferMinutes", "toCollegeMinutes", "userId" FROM "CommuteConfig";
DROP TABLE "CommuteConfig";
ALTER TABLE "new_CommuteConfig" RENAME TO "CommuteConfig";
CREATE UNIQUE INDEX "CommuteConfig_userId_key" ON "CommuteConfig"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
