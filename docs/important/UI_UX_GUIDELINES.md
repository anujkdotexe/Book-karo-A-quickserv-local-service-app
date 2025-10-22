# BOOK-KARO UI/UX Guidelines

## Overview

This document outlines comprehensive UI/UX standards for the BOOK-KARO platform, ensuring a professional, consistent, and delightful user experience across all modules (User, Vendor, Admin).

---

## 1. Cards, Lists, and Visual Hierarchy

### Card Design Standards

**Service Cards:**
```css
.service-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: all 0.3s ease;
}

.service-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}
```

**Card Structure:**
- **Header**: Service name, category badge, favorite icon
- **Body**: Description (120 chars max), location, rating
- **Footer**: Price, "Book Now" CTA button

**Visual Hierarchy:**
1. **Primary**: Service name (1.25rem, bold, deep navy)
2. **Secondary**: Description (1rem, regular, text primary)
3. **Tertiary**: Metadata (0.875rem, text secondary)

---

### List Design Standards

**Booking List:**
- Group by status (tabs: All, Pending, Confirmed, Completed, Cancelled)
- Show most recent first
- Include skeleton loaders during fetch
- Empty state with illustration and CTA

**Address List:**
- Default address highlighted with badge
- Edit/Delete buttons always visible on hover
- Confirmation modal for destructive actions

---

### Badge & Chip Standards

**Status Badges:**
- Rounded corners (16px border-radius)
- Semantic colors (see COLOR_THEME.md)
- Icon + text for clarity
- Consistent sizing (24px height)

**Category Chips:**
- Pill-shaped (9999px border-radius)
- Royal blue background for active
- Light gray background for inactive
- Hover effect: slightly darker

---

## 2. Navigation and Routing

### Navbar Requirements

**Desktop Navbar:**
- Sticky on scroll (position: sticky, top: 0)
- Deep navy background (#1e3a8a)
- Logo on left, navigation links center, profile/cart on right
- Active page indicator (underline + royal blue color)

**Mobile Navbar:**
- Hamburger menu (3 lines, 24x24px)
- Slide-out sidebar from left
- Touch-friendly targets (min 44x44px)
- Search bar full-width when active

**Navbar Structure:**
```
┌────────────────────────────────────────────┐
│ [Logo]  Home  Services  Bookings  [Profile]│
│                                     [Cart] │
└────────────────────────────────────────────┘
```

---

### Sidebar (Vendor/Admin)

**Structure:**
- Fixed left sidebar (240px width)
- Collapsible on mobile
- Group related actions (Dashboard, Bookings, Services, Analytics)
- Active section highlighted (royal blue background, white text)

**Navigation Item States:**
- Default: Text primary, no background
- Hover: Light gray background
- Active: Royal blue background, white text
- Disabled: Text secondary, cursor not-allowed

---

## 3. Feedback, Actions, and Empty States

### Modal System (Primary Feedback Mechanism)

**Modal Types:**

**Success Modal:**
- Green checkmark icon
- Title: "Success"
- Message: Clear confirmation of action
- Single "OK" button (royal blue)

**Error Modal:**
- Red X icon
- Title: "Error"
- Message: What went wrong + suggestion
- "Try Again" button (royal blue) + "Cancel" (light gray)

**Confirmation Modal:**
- Blue info icon or warning triangle
- Title: "Confirm Action"
- Message: "Are you sure you want to [action]?"
- "Confirm" (royal blue) + "Cancel" (light gray)

**Example Usage:**
```javascript
// Success
modal.success('Service added to favorites successfully');

// Error
modal.error('Failed to create booking. Please check your payment details.');

// Confirm
modal.confirm('Are you sure you want to cancel this booking?', {
  onConfirm: () => cancelBooking(),
  confirmText: 'Yes, Cancel',
  cancelText: 'No, Keep It'
});
```

---

### Empty States

**Empty State Structure:**
```
┌─────────────────────────────────┐
│        [Large Icon 120x120]     │
│                                 │
│      No Items Yet              │
│                                 │
│  Descriptive message explaining │
│  the empty state                │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Why use this feature?     │ │
│  │ ✓ Benefit 1               │ │
│  │ ✓ Benefit 2               │ │
│  │ ✓ Benefit 3               │ │
│  └───────────────────────────┘ │
│                                 │
│     [Primary Action Button]    │
│                                 │
└─────────────────────────────────┘
```

**Empty State Examples:**

**No Bookings:**
- Icon: Calendar
- Title: "No Bookings Yet"
- Message: "Start exploring our services and book your first appointment!"
- Benefits: 165+ services, verified providers, real-time tracking
- CTA: "Browse Services"

**No Favorites:**
- Icon: Heart
- Title: "No Favorites Yet"
- Message: "Save your favorite services for quick access!"
- Benefits: Quick access, special offers, easy comparison
- CTA: "Find Services to Favorite"

**No Search Results:**
- Icon: Search with slash
- Title: "No Services Found"
- Message: "We couldn't find any services matching your criteria."
- Suggestions: Check spelling, adjust filters, try different keywords
- CTAs: "Clear Filters" + "Request a Service"

---

### Skeleton Loaders

**Purpose**: Prevent layout jitter, improve perceived performance

**Implementation:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #e5e7eb 0%,
    #f3f4f6 50%,
    #e5e7eb 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

**Usage:**
- Service cards: 6-9 skeleton cards during initial load
- Bookings: 6 skeleton rows
- Tables: Skeleton rows matching column structure

---

## 4. Forms and Validation

### Input Field Standards

**Text Input:**
```jsx
<div className="form-group">
  <label className="form-label" htmlFor="email">
    Email Address
    <span className="required">*</span>
  </label>
  <input
    type="email"
    id="email"
    name="email"
    className="form-input"
    placeholder="you@example.com"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby={hasError ? 'email-error' : undefined}
  />
  {hasError && (
    <span className="form-error" id="email-error" role="alert">
      Please enter a valid email address
    </span>
  )}
</div>
```

**Field-Level Validation:**
- Real-time validation on blur
- Error message appears below field
- Red border + error icon for invalid
- Green border + checkmark for valid
- Clear, actionable error messages

**Validation Messages:**
- ❌ BAD: "Invalid input"
- ✅ GOOD: "Email must be in format: you@example.com"

---

### Password Fields

**Requirements:**
- Show/hide password toggle (eye icon)
- Password strength indicator
- Clear requirements list (8 chars, 1 uppercase, 1 number, 1 special)
- Confirm password field with live matching indicator

---

### Multi-Step Forms

**Booking Flow Example:**
1. Select Service → 2. Choose Date/Time → 3. Add Address → 4. Confirm & Pay

**Implementation:**
- Progress indicator at top (numbered steps)
- "Back" and "Next" buttons always visible
- Save progress (auto-save to localStorage)
- Validation before proceeding to next step

---

## 5. Mobile and Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
.component {
  /* Base styles for mobile (< 640px) */
}

@media (min-width: 640px) {
  /* Tablet (640px - 768px) */
}

@media (min-width: 768px) {
  /* Desktop (768px - 1024px) */
}

@media (min-width: 1024px) {
  /* Large Desktop (> 1024px) */
}
```

---

### Touch Targets

**Minimum Size:** 44x44px (iOS Human Interface Guidelines)

**Examples:**
- Buttons: 48px height minimum
- Icons: 24x24px with 44x44px touch area
- Links in lists: Full row clickable

---

### Grid Layouts

**Service Grid:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns

**Booking Cards:**
- Mobile: Stacked vertically
- Tablet: 2 columns
- Desktop: 1 column (list view preferred)

---

## 6. Accessibility (A11Y)

### Semantic HTML

**DO:**
```html
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/services">Services</a></li>
  </ul>
</nav>

<button type="button" aria-label="Add to favorites">
  <svg aria-hidden="true">...</svg>
</button>
```

**DON'T:**
```html
<div onclick="navigate()">Services</div> <!-- Not keyboard accessible -->
<img src="icon.png"> <!-- Missing alt text -->
```

---

### Keyboard Navigation

**Tab Order:**
1. Logo/Home link
2. Main navigation links
3. Search input
4. Profile/Cart
5. Main content
6. Footer links

**Keyboard Shortcuts:**
- `/` : Focus search bar
- `Esc` : Close modal/drawer
- `Enter` : Activate button/link
- `Space` : Toggle checkbox/radio
- Arrow keys: Navigate dropdowns/tabs

---

### ARIA Labels

**Required for:**
- Icon-only buttons
- Form fields (aria-required, aria-invalid)
- Live regions (aria-live for notifications)
- Modal dialogs (aria-modal="true", role="dialog")

---

### Color Contrast

**Minimum Requirements (WCAG 2.1 AA):**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+): 3:1 contrast ratio

**Our Colors (All Compliant):**
- Deep Navy on White: 10.45:1 ✓ AAA
- Royal Blue on White: 4.86:1 ✓ AA
- Text Primary on White: 13.86:1 ✓ AAA

---

## 7. Consistency

### Typography Scale

```css
:root {
  --font-xs: 0.75rem;    /* 12px - Captions */
  --font-sm: 0.875rem;   /* 14px - Helper text */
  --font-base: 1rem;     /* 16px - Body text */
  --font-lg: 1.125rem;   /* 18px - Subheadings */
  --font-xl: 1.25rem;    /* 20px - Card titles */
  --font-2xl: 1.5rem;    /* 24px - Section headers */
  --font-3xl: 1.875rem;  /* 30px - Page titles */
  --font-4xl: 2.25rem;   /* 36px - Hero text */
}
```

**Font Weights:**
- Regular: 400 (body text)
- Medium: 500 (labels, subheadings)
- Semibold: 600 (buttons, card titles)
- Bold: 700 (page headers)

---

### Spacing Scale

```css
:root {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
}
```

**Usage:**
- Component internal padding: `var(--spacing-md)` (16px)
- Section vertical spacing: `var(--spacing-2xl)` (48px)
- Page margins: `var(--spacing-xl)` (32px)

---

### Border Radius Scale

```css
:root {
  --radius-sm: 4px;    /* Input fields */
  --radius-md: 8px;    /* Buttons */
  --radius-lg: 12px;   /* Cards */
  --radius-xl: 16px;   /* Modals */
  --radius-full: 9999px; /* Pills, badges */
}
```

---

## 8. Review, Ratings, and Social Proof

### Star Rating Display

**5-Star System:**
```jsx
<div className="rating">
  <div className="stars">
    {[1,2,3,4,5].map(star => (
      <svg
        key={star}
        className={star <= rating ? 'star-filled' : 'star-empty'}
        fill={star <= rating ? 'gold' : 'none'}
        stroke="gold"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ))}
  </div>
  <span className="rating-value">{rating.toFixed(1)}</span>
  <span className="rating-count">({reviewCount} reviews)</span>
</div>
```

**Placement:**
- Service cards: Below service name
- Service detail page: Prominent in hero section
- Review list: Individual review rating + overall average

---

### Review Cards

**Structure:**
```
┌─────────────────────────────────┐
│ [Avatar] John Doe       ★★★★★  │
│ 2 days ago                      │
│                                 │
│ "Excellent service! Very        │
│ professional and on time..."    │
│                                 │
│ 👍 Helpful (12)   Report        │
└─────────────────────────────────┘
```

**Components:**
- User avatar (default if not provided)
- User name (first name + last initial for privacy)
- Rating (stars)
- Timestamp (relative: "2 days ago")
- Review text (truncate at 200 chars, "Read More" link)
- Helpful button (count)
- Report abuse link

---

## 9. Performance and Perceived Quality

### Loading States

**Page Load Sequence:**
1. Navbar appears immediately (static)
2. Skeleton loaders for dynamic content
3. Fade-in animation when data loads
4. Remove skeleton, show actual content

**Transition Timing:**
- Fast: 150ms (hover effects)
- Normal: 300ms (page transitions, modals)
- Slow: 500ms (complex animations)

---

### Image Optimization

**Service Images:**
- Lazy load below the fold
- Blur placeholder until loaded
- WebP format with JPG fallback
- Responsive sizes (srcset)

**Avatars:**
- Default avatar SVG if user has no photo
- 40x40px (small), 80x80px (medium), 120x120px (large)

---

### Animation Best Practices

**DO:**
- Fade in content on load
- Slide up modals from bottom
- Scale buttons slightly on hover
- Smooth scroll to anchors

**DON'T:**
- Animate position on scroll (janky)
- Use slow animations (> 500ms)
- Animate too many elements at once
- Disable animations without user preference check

---

## 10. Safety Features

### Confirmation Modals

**Required for:**
- Delete address
- Cancel booking
- Remove from favorites
- Logout (optional, but recommended)

**Example:**
```javascript
modal.confirm('Are you sure you want to cancel this booking?', {
  title: 'Cancel Booking',
  message: 'This action cannot be undone. You may be charged a cancellation fee.',
  confirmText: 'Yes, Cancel Booking',
  cancelText: 'No, Keep Booking',
  onConfirm: () => cancelBooking()
});
```

---

### Undo Actions

**Non-destructive Actions:**
- "Added to favorites" → Show "Undo" button for 5 seconds
- "Removed from cart" → Show "Undo" button
- "Filter applied" → Show "Clear Filters" button

---

### Error Recovery

**Network Errors:**
- Show error modal with "Try Again" button
- Auto-retry with exponential backoff
- Offline indicator in navbar

**Form Errors:**
- Highlight invalid fields
- Scroll to first error
- Focus first invalid input
- Show specific error messages

---

## 11. Design System Implementation

### Component Library Structure

```
/components
  /Button
    - Button.js
    - Button.css
    - Button.stories.js (Storybook)
  /Modal
    - Modal.js
    - Modal.css
  /Card
    - Card.js
    - Card.css
  /Input
    - Input.js
    - Input.css
  ...
```

---

### Design Tokens (CSS Variables)

**All tokens defined in:**
- `frontend/src/index.css` (global)
- See COLOR_THEME.md for complete list

**Usage:**
```css
.button {
  background-color: var(--royal-blue);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-size: var(--font-base);
}
```

---

## 12. Testing & Quality Assurance

### Visual Regression Testing

**Test Checklist:**
- [ ] All pages render correctly
- [ ] No console errors/warnings
- [ ] Responsive on mobile (375px), tablet (768px), desktop (1280px)
- [ ] All interactive elements have hover/focus states
- [ ] Modals center correctly
- [ ] Forms validate properly
- [ ] Images load with placeholders

---

### Accessibility Testing

**Tools:**
- axe DevTools (Chrome extension)
- Lighthouse (Chrome DevTools)
- WAVE (Web Accessibility Evaluation Tool)

**Manual Tests:**
- Tab through entire page (keyboard only)
- Test with screen reader (NVDA/JAWS)
- Zoom to 200% (readability)
- Check color contrast ratios

---

## 13. Future Enhancements

### Dark Mode

**Implementation Plan:**
1. Add `prefers-color-scheme` media query detection
2. Define dark mode color palette (see COLOR_THEME.md)
3. Add toggle in user settings
4. Store preference in localStorage
5. Apply theme class to `<body>`

---

### Micro-Interactions

**Ideas:**
- Confetti animation on booking confirmation
- Heart "pop" animation when favoriting
- Progress ring for profile completion
- Celebration when reaching booking milestones

---

### Personalization

**Features:**
- "Recently Viewed" services
- "Recommended for You" based on bookings
- Saved filters and search preferences
- Favorite categories quick access

---

## Resources

### Design Tools
- Figma (wireframes, mockups)
- Adobe Color (color palette testing)
- Coolors.co (color scheme generator)

### Code Resources
- MDN Web Docs (HTML/CSS/JS reference)
- A11y Project (accessibility checklist)
- Web.dev (performance optimization)

### Inspiration
- Dribbble (UI designs)
- Awwwards (award-winning websites)
- UIMovement (micro-interactions)

---

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Maintained by**: BOOK-KARO Design & Development Team
