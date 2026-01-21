# Self-Service Reservation API Documentation

This document covers the public API endpoints needed to build a user-facing self-service reservation webpage for leih.lokal.

## Base URL

```
https://your-pocketbase-instance.com
```

---

## Available Endpoints

### 1. List Available Items

Fetch all items available for reservation.

```
GET /api/collections/item/records
```

**Authentication:** None required (public)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filter` | string | Filter expression (e.g., `status='instock'`) |
| `sort` | string | Sort by field (e.g., `-created` for newest first) |
| `page` | number | Page number (default: 1) |
| `perPage` | number | Items per page (default: 30, max: 500) |
| `expand` | string | Expand relations |
| `fields` | string | Select specific fields |

**Example Request:**
```javascript
// Fetch all in-stock items
fetch('/api/collections/item/records?filter=status="instock"&sort=name')
```

**Response:**
```json
{
  "page": 1,
  "perPage": 30,
  "totalItems": 150,
  "totalPages": 5,
  "items": [
    {
      "id": "abc123",
      "iid": 42,
      "name": "Bohrmaschine",
      "description": "Profi-Bohrmaschine mit Schlagwerk",
      "status": "instock",
      "deposit": 50,
      "synonyms": "Bohrer, Schlagbohrer",
      "category": "Werkzeuge",
      "brand": "Bosch",
      "model": "PSB 750 RCE",
      "packaging": "Koffer",
      "manual": true,
      "parts": 3,
      "copies": 2,
      "images": ["filename.jpg"],
      "added_on": "2024-01-15",
      "created": "2024-01-15T10:30:00Z",
      "updated": "2024-06-20T14:22:00Z"
    }
  ]
}
```

**Item Status Values:**
| Status | Description | Available for Reservation? |
|--------|-------------|---------------------------|
| `instock` | Available | Yes |
| `reserved` | Reserved for pickup | No |
| `rented` | Currently rented out | No |
| `outofstock` | Out of stock | No |
| `onbackorder` | On backorder | No |
| `repairing` | Under repair | No |
| `lost` | Lost | No |
| `forsale` | For sale | No |
| `deleted` | Deleted (hidden) | No |

**Note:** Items with `status='deleted'` are automatically filtered out and never returned.

---

### 2. Get Single Item

Fetch details for a specific item.

```
GET /api/collections/item/records/{id}
```

**Authentication:** None required (public)

**Example Request:**
```javascript
fetch('/api/collections/item/records/abc123')
```

---

### 3. Create Reservation

Submit a new reservation request.

```
POST /api/collections/item/records
```

**Authentication:** None required (public)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "customer_name": "Max Mustermann",
  "customer_email": "max@example.com",
  "customer_phone": "+491234567890",
  "items": ["item_id_1", "item_id_2"],
  "pickup": "2025-02-15 16:00:00",
  "comments": "Optional comment about the reservation"
}
```

**Required Fields:**
| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `customer_name` | string | Full name | Required |
| `customer_email` | string | Email address | Required, valid email format |
| `customer_phone` | string | Phone number | Required, pattern: `^\+?\d{10,}$` |
| `items` | array | Array of item IDs | Required, at least 1 item |
| `pickup` | datetime | Pickup date/time | Required, must be in future, within opening hours |

**Optional Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `comments` | string | Additional notes |
| `customer_iid` | number | Existing customer ID (for returning customers) |

**Validation Rules:**
- All items must have `status='instock'`
- Pickup datetime must be in the future
- Pickup datetime must fall within opening hours

**Opening Hours:**
| Day | Hours |
|-----|-------|
| Monday | 15:00 - 19:00 |
| Thursday | 15:00 - 19:00 |
| Friday | 15:00 - 19:00 |
| Saturday | 10:00 - 14:00 |
| Tuesday | Closed |
| Wednesday | Closed |
| Sunday | Closed |

**Success Response (200):**
```json
{
  "id": "reservation_id",
  "created": "2025-01-21T10:30:00Z",
  "updated": "2025-01-21T10:30:00Z"
}
```

**Note:** For unauthenticated requests, most fields are hidden in the response for privacy. The customer will receive a confirmation email with full details and a cancellation link.

**Error Response (400):**
```json
{
  "code": 400,
  "message": "Failed to create record.",
  "data": {
    "customer_email": {
      "code": "validation_invalid_email",
      "message": "Must be a valid email address."
    }
  }
}
```

**Common Validation Errors:**
| Error | Cause |
|-------|-------|
| `validation_required` | Required field missing |
| `validation_invalid_email` | Invalid email format |
| `item not available` | Item is not in stock |
| `pickup time outside opening hours` | Selected time is when location is closed |
| `pickup must be in the future` | Past date selected |

---

### 4. Cancel Reservation

Cancel an existing reservation using the cancellation token (sent via email).

```
GET /reservation/cancel?token={cancel_token}
```

**Authentication:** None required (public, token-based)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Cancellation token from confirmation email |

**Response:** HTML confirmation page

**Note:** This endpoint returns an HTML page, not JSON. It's meant to be opened directly in a browser from the email link. Upon successful cancellation:
- The reservation is deleted
- Reserved items become available again
- A cancellation confirmation email is sent

---

### 5. Street Autocomplete

Get street name suggestions for address input.

```
GET /api/autocomplete/street?q={query}
```

**Authentication:** None required (public)

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (minimum 3 characters) |

**Example Request:**
```javascript
fetch('/api/autocomplete/street?q=karl')
```

**Response:**
```json
["Karlsruher Straße", "Karl-Theodor-Str.", "Karlsplatz"]
```

**Caching:** Response is cached for 1 hour (`Cache-Control: max-age=3600`)

---

## Integration Examples

### Complete Reservation Flow (JavaScript)

```javascript
const API_BASE = 'https://your-pocketbase-instance.com';

// 1. Fetch available items
async function getAvailableItems() {
  const response = await fetch(
    `${API_BASE}/api/collections/item/records?filter=status="instock"&sort=name`
  );
  const data = await response.json();
  return data.items;
}

// 2. Create a reservation
async function createReservation(formData) {
  const response = await fetch(
    `${API_BASE}/api/collections/reservation/records`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        items: formData.selectedItemIds,
        pickup: formData.pickupDateTime,
        comments: formData.comments || '',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Reservation failed');
  }

  return response.json();
}

// 3. Display items with availability
async function renderItemCatalog() {
  const items = await getAvailableItems();

  items.forEach(item => {
    console.log(`
      ${item.name} (${item.category})
      ${item.description}
      Deposit: ${item.deposit}€
      ${item.copies > 1 ? `${item.copies} copies available` : ''}
    `);
  });
}
```

### Form Validation Example

```javascript
function validateReservationForm(data) {
  const errors = {};

  // Name validation
  if (!data.customer_name?.trim()) {
    errors.customer_name = 'Name is required';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.customer_email)) {
    errors.customer_email = 'Valid email is required';
  }

  // Phone validation (optional +, minimum 10 digits)
  const phoneRegex = /^\+?\d{10,}$/;
  const cleanPhone = data.customer_phone.replace(/[\s\-\/]/g, '');
  if (!phoneRegex.test(cleanPhone)) {
    errors.customer_phone = 'Valid phone number required (min 10 digits)';
  }

  // Items validation
  if (!data.items?.length) {
    errors.items = 'Select at least one item';
  }

  // Pickup date validation
  const pickup = new Date(data.pickup);
  if (pickup <= new Date()) {
    errors.pickup = 'Pickup must be in the future';
  }

  // Opening hours validation
  const day = pickup.getDay();
  const hour = pickup.getHours();
  const openingHours = {
    1: { open: 15, close: 19 }, // Monday
    4: { open: 15, close: 19 }, // Thursday
    5: { open: 15, close: 19 }, // Friday
    6: { open: 10, close: 14 }, // Saturday
  };

  if (!openingHours[day]) {
    errors.pickup = 'We are closed on this day';
  } else if (hour < openingHours[day].open || hour >= openingHours[day].close) {
    errors.pickup = `Please select a time between ${openingHours[day].open}:00 and ${openingHours[day].close}:00`;
  }

  return Object.keys(errors).length ? errors : null;
}
```

### Date Picker Helper

```javascript
// Generate valid pickup slots for the next 4 weeks
function getValidPickupSlots() {
  const slots = [];
  const now = new Date();
  const fourWeeksLater = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

  const openingHours = {
    1: { open: 15, close: 19 }, // Monday
    4: { open: 15, close: 19 }, // Thursday
    5: { open: 15, close: 19 }, // Friday
    6: { open: 10, close: 14 }, // Saturday
  };

  let current = new Date(now);
  current.setHours(0, 0, 0, 0);

  while (current <= fourWeeksLater) {
    const day = current.getDay();
    if (openingHours[day]) {
      const { open, close } = openingHours[day];
      for (let hour = open; hour < close; hour++) {
        const slot = new Date(current);
        slot.setHours(hour, 0, 0, 0);
        if (slot > now) {
          slots.push({
            date: slot.toISOString().split('T')[0],
            time: `${hour}:00`,
            datetime: slot.toISOString(),
            label: slot.toLocaleDateString('de-DE', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            }),
          });
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}
```

---

## Item Images

Item images are stored as PocketBase files. To get the image URL:

```
GET /api/files/item/{record_id}/{filename}
```

**Example:**
```javascript
function getItemImageUrl(item) {
  if (!item.images?.length) return null;
  return `${API_BASE}/api/files/item/${item.id}/${item.images[0]}`;
}

// With thumbnail (100x100)
function getItemThumbnailUrl(item) {
  if (!item.images?.length) return null;
  return `${API_BASE}/api/files/item/${item.id}/${item.images[0]}?thumb=100x100`;
}
```

---

## CORS Configuration

If your frontend is hosted on a different domain, ensure CORS is configured on the PocketBase server. Standard PocketBase CORS headers should allow cross-origin requests from any origin by default.

---

## Error Handling

All API errors follow this format:

```json
{
  "code": 400,
  "message": "Human readable error message",
  "data": {
    "field_name": {
      "code": "validation_error_code",
      "message": "Field-specific error message"
    }
  }
}
```

**Common HTTP Status Codes:**
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Validation error / Bad request |
| 404 | Record not found |
| 500 | Server error |

---

## What Happens After Reservation

1. Customer receives **confirmation email** with:
   - Reservation details
   - Pickup date/time
   - List of reserved items
   - **Cancellation link** (contains unique token)

2. Items are marked as `reserved` and unavailable for other reservations

3. Customer can cancel anytime before pickup using the email link

4. Staff processes the reservation and converts it to a rental at pickup
