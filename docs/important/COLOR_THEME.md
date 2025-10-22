# BOOK-KARO Color Theme Guide

## Official Color Palette

### Primary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Deep Navy Blue** | `#1e3a8a` | rgb(30, 58, 138) | Headers, primary text, navbar background |
| **Bright Royal Blue** | `#2563eb` | rgb(37, 99, 235) | Primary buttons, CTAs, links, active states |
| **White** | `#ffffff` | rgb(255, 255, 255) | Modal backgrounds, card backgrounds, text on dark |
| **Light Gray** | `#f3f4f6` | rgb(243, 244, 246) | Secondary buttons, disabled states, subtle backgrounds |

### Supporting Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Border Gray** | `#e5e7eb` | rgb(229, 231, 235) | Card borders, dividers, input borders |
| **Text Primary** | `#1f2937` | rgb(31, 41, 55) | Body text, form labels |
| **Text Secondary** | `#6b7280` | rgb(107, 114, 128) | Supporting text, metadata, timestamps |

### Semantic Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Success Green** | `#10b981` | rgb(16, 185, 129) | Success messages, completed status |
| **Error Red** | `#ef4444` | rgb(239, 68, 68) | Error messages, cancelled status, destructive actions |
| **Warning Orange** | `#f59e0b` | rgb(245, 158, 11) | Warning messages, pending status |
| **Info Blue** | `#3b82f6` | rgb(59, 130, 246) | Information messages, confirmed status |

---

## Usage Guidelines

### Modals & Dialogs

**Modal Structure:**
```
┌─────────────────────────────────┐
│ Header: Deep Navy Blue (#1e3a8a)│ ← Background
│ Title: White (#ffffff)          │ ← Text Color
├─────────────────────────────────┤
│ Body: White (#ffffff)           │ ← Background
│ Text: Text Primary (#1f2937)    │ ← Body Text
│ Icon: Semantic Color            │ ← Based on type
├─────────────────────────────────┤
│ Footer: White (#ffffff)         │ ← Background
│ Primary Button: Royal Blue      │ ← #2563eb
│ Secondary Button: Light Gray    │ ← #f3f4f6
└─────────────────────────────────┘
```

**Example CSS:**
```css
.modal-header {
  background-color: #1e3a8a; /* Deep Navy */
  color: #ffffff;            /* White text */
}

.modal-body {
  background-color: #ffffff; /* White */
  color: #1f2937;           /* Text Primary */
}

.modal-btn-primary {
  background-color: #2563eb; /* Royal Blue */
  color: #ffffff;            /* White text */
}

.modal-btn-secondary {
  background-color: #f3f4f6; /* Light Gray */
  color: #1e3a8a;           /* Deep Navy text */
  border: 2px solid #e5e7eb; /* Border Gray */
}
```

---

### Buttons

**Primary Action Button:**
- Background: `#2563eb` (Bright Royal Blue)
- Text: `#ffffff` (White)
- Hover: `#1d4ed8` (Darker Royal Blue)
- Use for: "Book Now", "Confirm", "Save", "Submit"

**Secondary Action Button:**
- Background: `#f3f4f6` (Light Gray)
- Text: `#1e3a8a` (Deep Navy Blue)
- Border: `2px solid #e5e7eb` (Border Gray)
- Hover: `#e5e7eb` (Slightly darker gray)
- Use for: "Cancel", "Back", "Skip"

**Destructive Action Button:**
- Background: `#ef4444` (Error Red)
- Text: `#ffffff` (White)
- Use for: "Delete", "Cancel Booking", "Remove"

---

### Cards & Containers

**Standard Card:**
```css
.card {
  background-color: #ffffff;      /* White background */
  border: 1px solid #e5e7eb;      /* Border Gray */
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  color: #1e3a8a;                 /* Deep Navy for titles */
  font-weight: 600;
}

.card-text {
  color: #1f2937;                 /* Text Primary */
}

.card-meta {
  color: #6b7280;                 /* Text Secondary */
  font-size: 0.875rem;
}
```

**Highlighted Card (Active/Selected):**
```css
.card-highlighted {
  border: 2px solid #2563eb;      /* Royal Blue border */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); /* Royal Blue glow */
}
```

---

### Navigation

**Navbar:**
- Background: `#1e3a8a` (Deep Navy Blue)
- Text: `#ffffff` (White)
- Active Link: `#2563eb` (Royal Blue) with underline or background
- Hover: Slightly lighter navy or royal blue tint

**Sidebar (Admin/Vendor):**
- Background: `#ffffff` (White)
- Active Item: `#2563eb` background with `#ffffff` text
- Hover: `#f3f4f6` (Light Gray)

---

### Status Badges

**Booking Statuses:**
```css
.status-pending {
  background-color: #fef3c7;      /* Light yellow */
  color: #92400e;                 /* Dark brown text */
  border: 1px solid #f59e0b;      /* Warning Orange */
}

.status-confirmed {
  background-color: #dbeafe;      /* Light blue */
  color: #1e40af;                 /* Dark blue text */
  border: 1px solid #3b82f6;      /* Info Blue */
}

.status-completed {
  background-color: #d1fae5;      /* Light green */
  color: #065f46;                 /* Dark green text */
  border: 1px solid #10b981;      /* Success Green */
}

.status-cancelled {
  background-color: #fee2e2;      /* Light red */
  color: #991b1b;                 /* Dark red text */
  border: 1px solid #ef4444;      /* Error Red */
}
```

---

### Forms & Inputs

**Input Fields:**
```css
.input {
  background-color: #ffffff;      /* White */
  border: 2px solid #e5e7eb;      /* Border Gray */
  color: #1f2937;                 /* Text Primary */
}

.input:focus {
  border-color: #2563eb;          /* Royal Blue */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.input:invalid,
.input-error {
  border-color: #ef4444;          /* Error Red */
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-label {
  color: #1f2937;                 /* Text Primary */
  font-weight: 500;
}

.input-helper-text {
  color: #6b7280;                 /* Text Secondary */
  font-size: 0.875rem;
}

.input-error-message {
  color: #ef4444;                 /* Error Red */
  font-size: 0.875rem;
}
```

---

### Links

**Standard Link:**
```css
.link {
  color: #2563eb;                 /* Royal Blue */
  text-decoration: none;
}

.link:hover {
  color: #1d4ed8;                 /* Darker Royal Blue */
  text-decoration: underline;
}
```

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:

- **Deep Navy (#1e3a8a) on White (#ffffff)**: 10.45:1 ✓ AAA
- **Royal Blue (#2563eb) on White (#ffffff)**: 4.86:1 ✓ AA
- **Text Primary (#1f2937) on White (#ffffff)**: 13.86:1 ✓ AAA
- **White (#ffffff) on Royal Blue (#2563eb)**: 4.86:1 ✓ AA
- **White (#ffffff) on Deep Navy (#1e3a8a)**: 10.45:1 ✓ AAA

### Focus States

Always include visible focus indicators:
```css
:focus-visible {
  outline: 3px solid #2563eb;     /* Royal Blue */
  outline-offset: 2px;
}
```

---

## Dark Mode (Future Enhancement)

For future dark mode implementation:

| Element | Light Mode | Dark Mode Alternative |
|---------|------------|----------------------|
| Background | `#ffffff` | `#111827` (Dark Navy) |
| Card Background | `#ffffff` | `#1f2937` |
| Text Primary | `#1f2937` | `#f9fafb` |
| Royal Blue | `#2563eb` | `#3b82f6` (Lighter) |

---

## Brand Guidelines

### DO:
✓ Use Royal Blue for primary actions and CTAs  
✓ Use Deep Navy for headers and important text  
✓ Maintain consistent button sizes and styles  
✓ Use semantic colors for status indicators  
✓ Ensure sufficient contrast for accessibility  

### DON'T:
✗ Mix brand colors with non-brand colors  
✗ Use low-contrast color combinations  
✗ Create custom button styles that break consistency  
✗ Use colors for decoration without semantic meaning  
✗ Ignore focus states for keyboard navigation  

---

## Implementation

### CSS Variables

Add these to your `:root` or global stylesheet:

```css
:root {
  /* Brand Colors */
  --navy-blue: #1e3a8a;
  --royal-blue: #2563eb;
  --white: #ffffff;
  --light-gray: #f3f4f6;
  
  /* Supporting Colors */
  --border-color: #e5e7eb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  
  /* Semantic Colors */
  --success: #10b981;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  
  /* Hover States */
  --navy-blue-hover: #1e3a8a;
  --royal-blue-hover: #1d4ed8;
  --light-gray-hover: #e5e7eb;
}
```

---

## Examples

### Modal Component
See: `frontend/src/components/Modal/Modal.js` and `Modal.css`

### Button Variants
See: `frontend/src/App.css` - `.btn`, `.btn-primary`, `.btn-outline`

### Status Badges
See: `frontend/src/pages/Bookings/Bookings.css` - `.booking-status`

---

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Maintained by**: BOOK-KARO Design Team
