-- ============================================================================
-- Script d'initialisation de la base de données — CarPlayActiv
-- À exécuter dans Supabase : SQL Editor → New query → coller tout ce fichier → Run.
--
-- Si tu avais déjà exécuté une version précédente de ce script, lance d'abord
-- supabase-reset.sql pour repartir sur une base propre (le schéma a évolué).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Types énumérés
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'CLIENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "Formula" AS ENUM ('FILES_ONLY', 'PHYSICAL_CARD');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM (
    'PENDING_PAYMENT', 'PAID', 'PREPARING', 'SHIPPED', 'CANCELED', 'REFUNDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'PAYPAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ----------------------------------------------------------------------------
-- 2. "User" — comptes admin + comptes clients
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "User" (
  "id"           TEXT NOT NULL,
  "email"        TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "firstName"    TEXT NOT NULL,
  "lastName"     TEXT NOT NULL,
  "phone"        TEXT,
  "role"         "Role" NOT NULL DEFAULT 'CLIENT',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- ----------------------------------------------------------------------------
-- 3. "Settings" — réglages globaux (une seule ligne), dont les moyens de paiement
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Settings" (
  "id"            TEXT NOT NULL,
  "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
  "paypalEnabled" BOOLEAN NOT NULL DEFAULT true,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- 4. "Vehicle" — le catalogue (infos et prix ; les fichiers sont dans les tables
--    suivantes, séparés par formule pour les PDF et les fichiers d'activation)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Vehicle" (
  "id"                  TEXT NOT NULL,
  "brand"               TEXT NOT NULL,
  "model"               TEXT NOT NULL,
  "year"                TEXT NOT NULL,
  "description"         TEXT,
  "priceFilesCents"     INTEGER NOT NULL,
  "pricePhysicalCents"  INTEGER NOT NULL,
  "active"              BOOLEAN NOT NULL DEFAULT true,
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Vehicle_brand_model_idx" ON "Vehicle"("brand", "model");

-- ----------------------------------------------------------------------------
-- 5. "VehicleImage" — photos, communes aux deux formules
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VehicleImage" (
  "id"        TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "data"      BYTEA NOT NULL,
  "mimeType"  TEXT NOT NULL,
  "fileName"  TEXT,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VehicleImage_vehicleId_idx" ON "VehicleImage"("vehicleId");

-- ----------------------------------------------------------------------------
-- 6. "VehiclePdf" — PDF de guide, séparés par formule (étapes différentes)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VehiclePdf" (
  "id"        TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "formula"   "Formula" NOT NULL,
  "data"      BYTEA NOT NULL,
  "fileName"  TEXT NOT NULL,
  "title"     TEXT,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VehiclePdf_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VehiclePdf_vehicleId_idx" ON "VehiclePdf"("vehicleId");
CREATE INDEX IF NOT EXISTS "VehiclePdf_vehicleId_formula_idx" ON "VehiclePdf"("vehicleId", "formula");

-- ----------------------------------------------------------------------------
-- 7. "VehicleActivationFile" — fichiers bootables, séparés par formule.
--    FILES_ONLY = livrés au client. PHYSICAL_CARD = usage interne admin uniquement.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "VehicleActivationFile" (
  "id"        TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "formula"   "Formula" NOT NULL,
  "data"      BYTEA NOT NULL,
  "fileName"  TEXT NOT NULL,
  "position"  INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VehicleActivationFile_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VehicleActivationFile_vehicleId_idx" ON "VehicleActivationFile"("vehicleId");
CREATE INDEX IF NOT EXISTS "VehicleActivationFile_vehicleId_formula_idx" ON "VehicleActivationFile"("vehicleId", "formula");

-- ----------------------------------------------------------------------------
-- 8. "Order" — les commandes
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "Order" (
  "id"                 TEXT NOT NULL,
  "orderNumber"        TEXT NOT NULL,
  "userId"             TEXT,
  "vehicleId"          TEXT,
  "vehicleBrand"       TEXT NOT NULL,
  "vehicleModel"       TEXT NOT NULL,
  "vehicleYear"        TEXT NOT NULL,
  "formula"            "Formula" NOT NULL,
  "priceCents"         INTEGER NOT NULL,
  "status"             "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "paymentMethod"      "PaymentMethod",
  "paymentRef"         TEXT,
  "email"              TEXT NOT NULL,
  "firstName"          TEXT NOT NULL,
  "lastName"           TEXT NOT NULL,
  "phone"              TEXT NOT NULL,
  "address"            TEXT,
  "addressComp"        TEXT,
  "postalCode"         TEXT,
  "city"               TEXT,
  "country"            TEXT NOT NULL DEFAULT 'France',
  "trackingNumber"     TEXT,
  "shippedAt"          TIMESTAMP(3),
  "downloadToken"      TEXT,
  "downloadExpiresAt"  TIMESTAMP(3),
  "downloadCount"      INTEGER NOT NULL DEFAULT 0,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key"   ON "Order"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_downloadToken_key" ON "Order"("downloadToken");
CREATE INDEX IF NOT EXISTS "Order_userId_idx"    ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_vehicleId_idx" ON "Order"("vehicleId");

-- ----------------------------------------------------------------------------
-- 9. "OrderPdf" / "OrderActivationFile" — copie figée, au paiement, du contenu
--    livré au client (jamais le contenu "live" du véhicule)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "OrderPdf" (
  "id"       TEXT NOT NULL,
  "orderId"  TEXT NOT NULL,
  "data"     BYTEA NOT NULL,
  "fileName" TEXT NOT NULL,
  "title"    TEXT,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "OrderPdf_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OrderPdf_orderId_idx" ON "OrderPdf"("orderId");

CREATE TABLE IF NOT EXISTS "OrderActivationFile" (
  "id"       TEXT NOT NULL,
  "orderId"  TEXT NOT NULL,
  "data"     BYTEA NOT NULL,
  "fileName" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "OrderActivationFile_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "OrderActivationFile_orderId_idx" ON "OrderActivationFile"("orderId");

-- ----------------------------------------------------------------------------
-- 10. Clés étrangères
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "VehiclePdf" ADD CONSTRAINT "VehiclePdf_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "VehicleActivationFile" ADD CONSTRAINT "VehicleActivationFile_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "OrderPdf" ADD CONSTRAINT "OrderPdf_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "OrderActivationFile" ADD CONSTRAINT "OrderActivationFile_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================================
-- Terminé. Prochaine étape : npm run db:seed (compte admin + véhicules de démo)
-- ============================================================================
