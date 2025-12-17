# MrGreen App - Design Guidelines

## Brand Identity & Visual Language
**Design Philosophy**: Clean, modern, premium with a calm "garden/outdoor" vibe. Emphasize whitespace, large photography placeholders, rounded cards, and soft shadows to create a welcoming, trustworthy experience for booking local services.

---

## Color System

### Primary Palette
- **Brand Green**: `#1F7A3B` - Primary actions, branding
- **Dark Green**: `#145228` - Pressed states, emphasis
- **Accent Orange**: `#F28C28` - CTAs, highlights, progress indicators
- **Background**: `#FFFFFF` - Main app background
- **Surface**: `#F6F8F6` - Card backgrounds, elevated surfaces
- **Text Primary**: `#0F172A` - Headings, primary content
- **Text Secondary**: `#475569` - Supporting text, metadata
- **Border**: `#E2E8F0` - Dividers, input borders
- **Error**: `#DC2626` - Validation errors, destructive actions

---

## Typography
- **Headings**: Bold weight, clear hierarchy
- **Body Text**: Regular weight, readable sizes
- **Minimum Touch Targets**: Follow accessibility standards for button text

---

## Spacing & Layout
- **Grid System**: 8pt base unit
- **Component Padding**: Use multiples of 8 (8, 16, 24, 32px)
- **Card Spacing**: 16px internal padding
- **Screen Margins**: 16-24px horizontal margins

---

## Component Specifications

### Buttons
- **Border Radius**: 12-16px
- **States**: Default, Pressed (use Dark Green for primary), Disabled (reduced opacity)
- **Variants**: 
  - Primary (filled Brand Green)
  - Secondary (outlined)
  - Text-only
- **Proper Hit Areas**: Minimum 44x44pt touch targets

### Cards
- **Border Radius**: 16px
- **Shadow**: Subtle, soft shadows for elevation
- **Background**: Surface color (#F6F8F6)

### Input Fields
- **Border**: Border color (#E2E8F0)
- **Focus State**: Brand Green border
- **Error State**: Error color border with inline message
- **Labels**: Text Secondary color above field

### Status Chips/Tags
- **Border Radius**: 8-12px
- **Status Colors**:
  - Requested: Orange accent
  - Confirmed: Brand Green
  - Completed: Text Secondary
  - Canceled: Error color
- **Size**: Compact, pill-shaped

---

## Navigation Architecture

### Root Navigation
**Bottom Tabs** (3 tabs after authentication):
1. **Home** - Service browsing
2. **Bookings** - Booking management
3. **Profile** - User settings

### Pre-Auth Flow
Stack navigation for:
1. Onboarding (3 screens with progress dots)
2. Authentication (Phone → OTP)

### Modal Screens
- Booking creation flow (multi-step)
- Booking detail view

---

## Screen-by-Screen Specifications

### 1. Onboarding Screens (3 screens)
**Layout**:
- Full-screen with centered content
- Large illustration/photo placeholder at top
- Heading + description text in center
- Progress dots at bottom center
- Skip button (top-right)
- "Next"/"Get Started" button at bottom

**Safe Area**: 
- Top: `insets.top + 24px`
- Bottom: `insets.bottom + 24px`

### 2. Phone Authentication
**Layout**:
- Centered vertical layout
- App logo/brand at top
- Heading: "Enter your phone number"
- Phone input with UK flag (+44 prefix)
- "Send Code" button below
- Format validation inline

**OTP Screen**:
- 6-digit OTP input (large, spaced digits)
- Resend code option
- Auto-advance on completion

### 3. Home Screen
**Header**:
- Greeting text + user area
- Transparent background
- No navigation buttons

**Content**:
- Scrollable service list/grid
- Pull-to-refresh capability
- Service cards show:
  - Icon/illustration placeholder (large, top)
  - Service name (bold)
  - Short description (2 lines max)
  - Duration + price label
  - "Book" button (Brand Green)

**Safe Area**:
- Top: `headerHeight + 16px`
- Bottom: `tabBarHeight + 16px`

### 4. Booking Creation Flow
**Multi-step with indicator**:
- Step counter (e.g., "2 of 4")
- Back button in header
- Form fields with validation
- "Continue" button at bottom
- Summary card on review step

**Address Form**:
- Full name (optional)
- Phone (read-only, from auth)
- Address line 1
- Address line 2 (optional)
- City
- Postcode (UK format validation)

**Schedule Selection**:
- Date picker (future dates only)
- Time picker or time window selector
- Clear visual feedback for selection

### 5. Bookings Screen
**Tabs**: Upcoming / Past

**List Items**:
- Service name (bold)
- Date + time
- Status chip (top-right)
- Address (truncated)
- Tap to view details

**Detail Screen**:
- Full booking information
- Cancel button (if status is requested/confirmed)
- Confirmation alert for cancellation

### 6. Profile Screen
**Layout**:
- User phone number (read-only)
- Chosen area (editable)
- Default address card
- Edit profile button
- Support section (WhatsApp/email placeholders)
- Sign out button (bottom)

**Safe Area**:
- Top: `headerHeight + 16px`
- Bottom: `tabBarHeight + 16px`

---

## Visual Feedback & States

### Loading States
- Skeleton placeholders for lists
- Loading spinner for actions
- Disabled state for buttons during processing

### Error Handling
- Toast notifications for network errors
- Inline validation errors (red text below field)
- Error banners for critical issues

### Success States
- Success banner/toast after booking creation
- Visual confirmation (checkmark) on completed actions

### Empty States
- Friendly illustration placeholder
- Helpful message
- Action button if applicable

---

## Accessibility Requirements
- **Text Sizes**: Readable at default system size, scalable
- **Touch Targets**: Minimum 44x44pt
- **Color Contrast**: WCAG AA compliant for text
- **Form Labels**: Clear, associated with inputs
- **Button Labels**: Descriptive, not just icons

---

## Asset Requirements

### Required Assets
- **Service Icons/Illustrations**: Garden/landscaping themed placeholders
- **Onboarding Illustrations**: 3 unique images showing value proposition
- **Empty State Illustrations**: Friendly, on-brand graphics
- **App Logo**: Green-themed, clean design

### Icon System
- Use React Native core icons or minimal icon library
- Consistent size (24px standard, 20px for small)
- Brand Green for primary icons
- Text Secondary for inactive states

---

## Interaction Patterns

### Form Validation
- Real-time validation on blur
- Clear error messages
- Required fields marked with asterisk

### List Interactions
- Swipe gestures (optional for delete/cancel)
- Tap to view details
- Pull-to-refresh

### Booking Flow
- Linear progression (can't skip steps)
- Back button to edit previous steps
- Review summary before confirmation

---

## Platform Considerations
- **Phone Format**: UK +44 standard
- **Postcode Validation**: UK format
- **Date/Time**: Future-only validation, clear timezone handling
- **SMS OTP**: 6-digit code, 60-second resend timer