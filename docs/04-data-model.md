# Datenmodell

## 1. Kernentitäten

- User
- Organization
- OrganizationMember
- Resource
- ResourceGroup
- ResourceGroupMember
- Booking
- BookingResource
- BookingStatusHistory
- Event
- EventCategory
- BlackoutPeriod
- HandoverProtocol
- ReturnProtocol
- DamageReport
- Fee
- Document
- NotificationLog
- AuditLog
- SystemSetting

## 2. User

Repräsentiert Benutzer mit Login.

Wichtige Felder:

- id
- name
- email
- role
- active
- createdAt
- updatedAt

## 3. Organization

Repräsentiert Verein, Firma oder sonstigen Veranstalter.

Felder:

- id
- name
- type
- contactName
- email
- phone
- address

## 4. Resource

Alle buchbaren Objekte.

Felder:

- id
- name
- type
- description
- location
- capacity
- areaSqm
- active
- publicVisible
- bufferBeforeMinutes
- bufferAfterMinutes

## 5. ResourceGroup

Logische Gruppierung für Raumkombinationen.

Beispiele:

- Lounge + Foyer
- Foyer + Großer Saal
- Gesamtes Valentinum

## 6. Booking

Felder:

- id
- title
- status
- startAt
- endAt
- requesterName
- requesterEmail
- requesterPhone
- organizationId
- purpose
- locationText
- publicVisible
- internalNote
- createdById
- updatedById

## 7. BookingResource

N:M Verbindung zwischen Booking und Resource.

## 8. Event

Öffentlich sichtbare Veranstaltung, optional mit Buchung verknüpft.

Felder:

- id
- bookingId
- title
- subtitle
- description
- category
- organizerName
- startsAt
- endsAt
- admissionAt
- ticketUrl
- imageUrl
- publicVisible
- cancelled

## 9. BlackoutPeriod

Blockierende Sperrzeit für Ressourcen.

## 10. HandoverProtocol / ReturnProtocol

Protokolle für Kühlwagen und später andere Ressourcen.

## 11. AuditLog

Speichert relevante Änderungen revisionsnah.
