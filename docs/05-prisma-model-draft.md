# Prisma Model Draft

```prisma
enum UserRole {
  ADMIN
  STAFF
  USER
}

enum ResourceType {
  ROOM
  VEHICLE
  EQUIPMENT
}

enum BookingStatus {
  DRAFT
  REQUESTED
  OPTION
  APPROVED
  REJECTED
  CANCELLED
  COMPLETED
  ARCHIVED
}

enum OrganizationType {
  PRIVATE
  CLUB
  COMPANY
  MUNICIPAL
  OTHER
}

enum EventCategory {
  KONZERT
  KABARETT
  BALL
  AUSSTELLUNG
  VORTRAG
  KINDER
  VEREIN
  GEMEINDE
  SONSTIGE
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  role      UserRole @default(USER)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookingsCreated Booking[] @relation("BookingCreatedBy")
  auditLogs       AuditLog[]
}

model Organization {
  id          String           @id @default(cuid())
  name        String
  type        OrganizationType @default(OTHER)
  contactName String?
  email       String?
  phone       String?
  address     String?
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  bookings    Booking[]
}

model Resource {
  id                  String       @id @default(cuid())
  name                String
  type                ResourceType
  description         String?
  location            String?
  capacity            Int?
  areaSqm             Decimal?
  active              Boolean      @default(true)
  publicVisible       Boolean      @default(true)
  bufferBeforeMinutes Int          @default(0)
  bufferAfterMinutes  Int          @default(0)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  bookings            BookingResource[]
  blackoutPeriods     BlackoutPeriod[]
  groupMembers        ResourceGroupMember[]
}

model ResourceGroup {
  id          String   @id @default(cuid())
  name        String
  description String?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  members     ResourceGroupMember[]
}

model ResourceGroupMember {
  id              String @id @default(cuid())
  resourceGroupId String
  resourceId      String

  resourceGroup   ResourceGroup @relation(fields: [resourceGroupId], references: [id], onDelete: Cascade)
  resource        Resource      @relation(fields: [resourceId], references: [id], onDelete: Cascade)

  @@unique([resourceGroupId, resourceId])
}

model Booking {
  id              String        @id @default(cuid())
  title           String
  status          BookingStatus @default(REQUESTED)
  startAt         DateTime
  endAt           DateTime
  requesterName   String
  requesterEmail  String
  requesterPhone  String?
  organizationId  String?
  purpose         String?
  locationText    String?
  publicVisible   Boolean       @default(false)
  internalNote    String?
  createdById     String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  organization    Organization? @relation(fields: [organizationId], references: [id])
  createdBy       User?         @relation("BookingCreatedBy", fields: [createdById], references: [id])
  resources       BookingResource[]
  history         BookingStatusHistory[]
  event           Event?
  handover        HandoverProtocol?
  returnProtocol  ReturnProtocol?
  fees            Fee[]
}

model BookingResource {
  id         String @id @default(cuid())
  bookingId  String
  resourceId String

  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  resource   Resource @relation(fields: [resourceId], references: [id])

  @@unique([bookingId, resourceId])
}

model BookingStatusHistory {
  id          String        @id @default(cuid())
  bookingId   String
  fromStatus  BookingStatus?
  toStatus    BookingStatus
  reason      String?
  changedById String?
  changedAt   DateTime      @default(now())

  booking     Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Event {
  id            String        @id @default(cuid())
  bookingId     String?       @unique
  title         String
  subtitle      String?
  description   String?
  category      EventCategory @default(SONSTIGE)
  organizerName String?
  startsAt      DateTime
  endsAt        DateTime
  admissionAt   DateTime?
  ticketUrl     String?
  imageUrl      String?
  publicVisible Boolean       @default(false)
  cancelled     Boolean       @default(false)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  booking       Booking?      @relation(fields: [bookingId], references: [id])
}

model BlackoutPeriod {
  id          String   @id @default(cuid())
  resourceId  String
  title       String
  reason      String?
  startAt     DateTime
  endAt       DateTime
  createdAt   DateTime @default(now())

  resource    Resource @relation(fields: [resourceId], references: [id])
}

model HandoverProtocol {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  handedOverAt DateTime
  condition   String?
  accessories String?
  notes       String?
  createdAt   DateTime @default(now())

  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model ReturnProtocol {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  returnedAt   DateTime
  condition    String?
  cleaned      Boolean  @default(false)
  damages      String?
  notes        String?
  createdAt    DateTime @default(now())

  booking      Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model Fee {
  id          String   @id @default(cuid())
  bookingId   String
  label       String
  amountCents Int
  createdAt   DateTime @default(now())

  booking     Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
}

model AuditLog {
  id          String   @id @default(cuid())
  userId      String?
  entityType  String
  entityId    String
  action      String
  oldValue    Json?
  newValue    Json?
  createdAt   DateTime @default(now())

  user        User?    @relation(fields: [userId], references: [id])
}

model SystemSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```
