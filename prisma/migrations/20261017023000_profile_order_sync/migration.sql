-- AlterTable
ALTER TABLE "Expense" ADD COLUMN "externalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Expense_externalId_key" ON "Expense"("externalId");

-- AlterTable
ALTER TABLE "AppSetting" ADD COLUMN "profileGeneratorApiKey" TEXT;
