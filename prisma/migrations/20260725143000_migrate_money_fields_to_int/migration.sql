-- Convert existing monetary values from DECIMAL to INTEGER (FCFA)
-- FCFA does not use fractional subunits, so we round legacy values before casting.

ALTER TABLE "Dish"
  ALTER COLUMN "price" TYPE INTEGER
  USING ROUND("price")::integer;

ALTER TABLE "MenuItem"
  ALTER COLUMN "price" TYPE INTEGER
  USING CASE
    WHEN "price" IS NULL THEN NULL
    ELSE ROUND("price")::integer
  END;

ALTER TABLE "Promotion"
  ALTER COLUMN "fixedAmount" TYPE INTEGER
  USING CASE
    WHEN "fixedAmount" IS NULL THEN NULL
    ELSE ROUND("fixedAmount")::integer
  END;

ALTER TABLE "Order"
  ALTER COLUMN "totalAmount" TYPE INTEGER
  USING ROUND("totalAmount")::integer;

ALTER TABLE "OrderItem"
  ALTER COLUMN "unitPrice" TYPE INTEGER
  USING ROUND("unitPrice")::integer;

ALTER TABLE "Payment"
  ALTER COLUMN "amount" TYPE INTEGER
  USING ROUND("amount")::integer;
