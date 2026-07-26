-- ============================================================================
-- Réinitialisation de la base — à exécuter avant supabase-init.sql
-- si tu obtiens une erreur du type "column ... does not exist" ou si tu veux
-- repartir de zéro après une mise à jour du schéma.
-- Sans danger tant qu'aucune vraie commande n'a encore été passée sur le site.
-- ============================================================================

DROP TABLE IF EXISTS "OrderActivationFile" CASCADE;
DROP TABLE IF EXISTS "OrderPdf" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "VehicleActivationFile" CASCADE;
DROP TABLE IF EXISTS "VehicleImage" CASCADE;
DROP TABLE IF EXISTS "VehiclePdf" CASCADE;
DROP TABLE IF EXISTS "Vehicle" CASCADE;
DROP TABLE IF EXISTS "VehicleFile" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "Settings" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "Formula" CASCADE;
DROP TYPE IF EXISTS "ProductType" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "PaymentMethod" CASCADE;

-- Terminé : la base est vide. Exécute maintenant supabase-init.sql.
