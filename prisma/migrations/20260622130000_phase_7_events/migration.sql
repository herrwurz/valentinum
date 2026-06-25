-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('KONZERT', 'KABARETT', 'BALL', 'AUSSTELLUNG', 'VORTRAG', 'KINDER', 'VEREIN', 'GEMEINDE', 'SONSTIGE');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "category" "EventCategory" NOT NULL DEFAULT 'SONSTIGE',
    "organizerName" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "admissionAt" TIMESTAMP(3),
    "ticketUrl" TEXT,
    "imageUrl" TEXT,
    "publicVisible" BOOLEAN NOT NULL DEFAULT false,
    "publishOrganizer" BOOLEAN NOT NULL DEFAULT false,
    "publishTicketLink" BOOLEAN NOT NULL DEFAULT false,
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_bookingId_key" ON "Event"("bookingId");
CREATE INDEX "Event_publicVisible_startsAt_endsAt_idx" ON "Event"("publicVisible", "startsAt", "endsAt");
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
