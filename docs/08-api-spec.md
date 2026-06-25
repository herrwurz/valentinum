# API-/Server-Action-Spezifikation

Die konkrete Umsetzung kann mit Next.js Server Actions oder API Routes erfolgen. Fachlogik bleibt in Services.

## Resources

### listResources()
Gibt aktive Ressourcen zurück.

### createResource(input)
Nur ADMIN.

### updateResource(id, input)
Nur ADMIN.

### deactivateResource(id)
Nur ADMIN.

## Bookings

### createBookingRequest(input)
PUBLIC, USER, STAFF, ADMIN.

Validierung:
- startAt < endAt
- Kontaktdaten vorhanden
- Ressourcen vorhanden
- Zeitraum nicht in Vergangenheit

Ergebnis:
- Booking mit REQUESTED

### approveBooking(id)
STAFF, ADMIN.

Regeln:
- Konfliktprüfung zwingend
- Statushistorie schreiben
- Audit schreiben

### rejectBooking(id, reason)
STAFF, ADMIN.

### cancelBooking(id, reason)
USER eigene Buchung, STAFF, ADMIN.

### listBookings(filter)
Je Rolle unterschiedliche Daten.

### getBooking(id)
Je Rolle mit DTO-Trennung.

## Calendar

### getPublicCalendarEvents(range)
Gibt nur Public DTO zurück.

### getAdminCalendarEvents(range)
STAFF, ADMIN. Gibt Detaildaten.

### getUserCalendarEvents(range)
USER. Nur eigene Buchungen.

## Events

### createEvent(input)
STAFF, ADMIN.

### updateEvent(id, input)
STAFF, ADMIN.

### publishEvent(id)
STAFF, ADMIN.

### unpublishEvent(id)
STAFF, ADMIN.

## Blackout

### createBlackoutPeriod(input)
STAFF, ADMIN.

### deleteBlackoutPeriod(id)
STAFF, ADMIN.

## Vehicle Protocols

### createHandoverProtocol(bookingId, input)
STAFF, ADMIN.

### createReturnProtocol(bookingId, input)
STAFF, ADMIN.

## Documents

### generateBookingConfirmation(bookingId)
STAFF, ADMIN.

### exportBookingsCsv(filter)
STAFF, ADMIN.

## DTO-Regel

Public DTO darf enthalten:

- id
- title, wenn public event
- start
- end
- category
- public description
- resource label „belegt“

Public DTO darf nicht enthalten:

- requesterName
- requesterEmail
- requesterPhone
- internalNote
- fees
- protocol data
