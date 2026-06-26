-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('DEPOSIT', 'RENTAL', 'CLEANING', 'DAMAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "DamageSeverity" AS ENUM ('MINOR', 'MODERATE', 'SEVERE');

-- CreateTable
CREATE TABLE "VehicleHandoverProtocol" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "handedOverAt" TIMESTAMP(3) NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "odometer" INTEGER,
    "fuelLevel" INTEGER,
    "condition" TEXT NOT NULL,
    "accessories" TEXT,
    "depositAmount" DECIMAL(65,30),
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleHandoverProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleReturnProtocol" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "returnedAt" TIMESTAMP(3) NOT NULL,
    "returnLocation" TEXT NOT NULL,
    "odometer" INTEGER,
    "fuelLevel" INTEGER,
    "cleaningOk" BOOLEAN NOT NULL DEFAULT true,
    "condition" TEXT NOT NULL,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleReturnProtocol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageReport" (
    "id" TEXT NOT NULL,
    "returnProtocolId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "DamageSeverity" NOT NULL DEFAULT 'MINOR',
    "estimatedCost" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fee" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "returnProtocolId" TEXT,
    "type" "FeeType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleHandoverProtocol_bookingId_key" ON "VehicleHandoverProtocol"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "VehicleReturnProtocol_bookingId_key" ON "VehicleReturnProtocol"("bookingId");

-- CreateIndex
CREATE INDEX "DamageReport_returnProtocolId_idx" ON "DamageReport"("returnProtocolId");

-- CreateIndex
CREATE INDEX "Fee_bookingId_idx" ON "Fee"("bookingId");

-- CreateIndex
CREATE INDEX "Fee_returnProtocolId_idx" ON "Fee"("returnProtocolId");

-- AddForeignKey
ALTER TABLE "VehicleHandoverProtocol" ADD CONSTRAINT "VehicleHandoverProtocol_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleHandoverProtocol" ADD CONSTRAINT "VehicleHandoverProtocol_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleReturnProtocol" ADD CONSTRAINT "VehicleReturnProtocol_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VehicleReturnProtocol" ADD CONSTRAINT "VehicleReturnProtocol_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageReport" ADD CONSTRAINT "DamageReport_returnProtocolId_fkey" FOREIGN KEY ("returnProtocolId") REFERENCES "VehicleReturnProtocol"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fee" ADD CONSTRAINT "Fee_returnProtocolId_fkey" FOREIGN KEY ("returnProtocolId") REFERENCES "VehicleReturnProtocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;
