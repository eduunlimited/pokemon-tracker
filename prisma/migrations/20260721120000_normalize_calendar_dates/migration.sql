-- Normalize stored calendar dates to UTC noon so reads stay on the intended day.
UPDATE "Expense"
SET "date" = date("date") || 'T12:00:00.000Z'
WHERE "date" IS NOT NULL;

UPDATE "MileageTrip"
SET "date" = date("date") || 'T12:00:00.000Z'
WHERE "date" IS NOT NULL;
