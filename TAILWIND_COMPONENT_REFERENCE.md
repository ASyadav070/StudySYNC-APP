# StudySync Tailwind Component Reference

Quick reference guide for maintaining consistent styling across the application.

## 🎨 Color System

### Primary Colors
```jsx
// Primary (Blue) - Main actions, links, highlights
bg-primary text-primary-foreground
hover:bg-primary/90

// Secondary (Gray) - Secondary actions
bg-secondary text-secondary-foreground
hover:bg-secondary/80

// Destructive (Red) - Delete, warnings, errors
bg-destructive text-destructive-foreground
hover:bg-destructive/90
```

### Background Colors
```jsx
// Page background
bg-background

// Card background
bg-card

// Muted background (for secondary elements)
bg-muted

// Accent background (for hover states)
bg-accent
```

### Text Colors
```jsx
// Default text
text-foreground

// Muted/secondary text
text-muted-foreground

// Primary text
text-primary

// Destructive text
text-destructive
```

### Border Colors
```jsx
// Default border
border border-border

// Input border
border border-input
```

## 📦 Layout Patterns

### Container
```jsx
<div className="max-w-7xl mx-auto px-4 py-6">
  {/* Content */}
</div>
```

### Sticky Header
```jsx
<div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10 shadow-sm">
  {/* Header content */}
</div>
```

### Responsive Grid
```jsx
// 1 column mobile, 2 tablet, 3 laptop, 4 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>

// 1 column mobile, 2 desktop
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Cards */}
</div>
```

### Flexbox Layouts
```jsx
// Horizontal with space between
<div className="flex items-center justify-between">
  {/* Content */}
</div>

// Vertical stack
<div className="flex flex-col gap-4">
  {/* Content */}
</div>

// Center content
<div className="flex items-center justify-center min-h-screen">
  {/* Content */}
</div>
```

## 🧩 Component Patterns

### Card
```jsx
<div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-foreground mb-2">Title</h3>
  <p className="text-sm text-muted-foreground">Description</p>
</div>
```

### Button (Primary)
```jsx
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Button Text</span>
</button>
```

### Button (Secondary)
```jsx
<button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
  Button Text
</button>
```

### Button (Destructive)
```jsx
<button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
  Delete
</button>
```

### Button (Ghost)
```jsx
<button className="p-2 hover:bg-accent rounded-md transition-colors">
  <Icon className="w-5 h-5 text-foreground" />
</button>
```

### Form Input
```jsx
<input
  type="text"
  placeholder="Enter text..."
  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
/>
```

### Textarea
```jsx
<textarea
  placeholder="Enter description..."
  rows={3}
  className="w-full px-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
/>
```

### Label
```jsx
<label className="block text-sm font-medium text-foreground mb-1">
  Field Name
</label>
```

### Error Message
```jsx
<p className="text-sm text-destructive mt-1">
  Error message here
</p>
```

### Modal Overlay
```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-card rounded-lg shadow-xl max-w-md w-full p-6">
    {/* Modal content */}
  </div>
</div>
```

### Empty State
```jsx
<div className="flex flex-col items-center justify-center text-center py-12">
  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
    <BookOpen className="w-8 h-8 text-primary" />
  </div>
  <h3 className="text-lg font-semibold text-foreground mb-2">No Items Yet</h3>
  <p className="text-muted-foreground mb-6">Get started by creating your first item</p>
  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
    Create Item
  </button>
</div>
```

### Loading State
```jsx
<div className="flex flex-col items-center justify-center py-12">
  <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
  <p className="text-muted-foreground">Loading...</p>
</div>
```

### Error State
```jsx
<div className="p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20">
  <div className="flex items-center gap-2">
    <AlertCircle className="w-5 h-5" />
    <p>Error message here</p>
  </div>
</div>
```

### Badge/Tag
```jsx
<span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md">
  Keyword
</span>
```

### Avatar Circle
```jsx
<div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
  A
</div>
```

### Divider
```jsx
<div className="border-t border-border my-6"></div>
```

## 🎭 Special Components

### Toast Notification
```jsx
// Success
<div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3">
  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
  <p className="text-sm text-foreground flex-1">Success message</p>
  <button className="text-muted-foreground hover:text-foreground">
    <X className="w-4 h-4" />
  </button>
</div>

// Error
<div className="bg-card border border-border rounded-lg shadow-lg p-4 flex items-start gap-3">
  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
  <p className="text-sm text-foreground flex-1">Error message</p>
  <button className="text-muted-foreground hover:text-foreground">
    <X className="w-4 h-4" />
  </button>
</div>
```

### Dropzone
```jsx
<div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
  <p className="text-sm text-foreground mb-1">Drop files here or click to upload</p>
  <p className="text-xs text-muted-foreground">PDF, TXT, or DOCX (max 10MB)</p>
</div>
```

### Progress Bar
```jsx
<div className="w-full bg-muted rounded-full h-2">
  <div 
    className="bg-primary h-2 rounded-full transition-all"
    style={{ width: '75%' }}
  ></div>
</div>
```

### Chat Message Bubble (Own)
```jsx
<div className="flex justify-end">
  <div className="max-w-[70%]">
    <div className="rounded-lg px-4 py-2 bg-primary text-primary-foreground">
      <p className="text-sm wrap-break-word">Message text</p>
    </div>
    <span className="text-xs text-muted-foreground mt-1 px-1">12:34 PM</span>
  </div>
</div>
```

### Chat Message Bubble (Other)
```jsx
<div className="flex justify-start gap-2">
  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm shrink-0">
    A
  </div>
  <div className="max-w-[70%]">
    <span className="text-xs text-muted-foreground mb-1 px-1">alice@test.com</span>
    <div className="rounded-lg px-4 py-2 bg-muted text-foreground">
      <p className="text-sm wrap-break-word">Message text</p>
    </div>
    <span className="text-xs text-muted-foreground mt-1 px-1">12:34 PM</span>
  </div>
</div>
```

### 3D Flip Card (Flashcards)
```jsx
<div className="perspective-1000 cursor-pointer" onClick={handleFlip}>
  <div className={`relative w-full h-64 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
    {/* Front */}
    <div className="absolute inset-0 backface-hidden bg-card border-2 border-primary rounded-lg p-8 flex items-center justify-center">
      <p className="text-lg text-center">Question</p>
    </div>
    {/* Back */}
    <div className="absolute inset-0 backface-hidden rotate-y-180 bg-primary text-primary-foreground rounded-lg p-8 flex items-center justify-center">
      <p className="text-lg text-center">Answer</p>
    </div>
  </div>
</div>
```

## 🎯 Utility Classes Reference

### Spacing
```
p-2, p-4, p-6, p-8     // Padding
px-4, py-2             // Padding horizontal/vertical
m-2, m-4, m-6          // Margin
mb-4, mt-6             // Margin bottom/top
gap-2, gap-3, gap-4    // Flex/Grid gap
```

### Typography
```
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl
font-normal, font-medium, font-semibold, font-bold
text-left, text-center, text-right
```

### Sizing
```
w-full, w-8, w-16      // Width
h-full, h-8, h-16      // Height
max-w-md, max-w-lg, max-w-2xl, max-w-7xl
min-h-screen
```

### Display
```
flex, grid, hidden, block, inline-block
flex-col, flex-row
items-center, items-start, items-end
justify-center, justify-between, justify-end
```

### Position
```
relative, absolute, fixed, sticky
inset-0, top-0, left-0
z-10, z-50
```

### Borders & Rounded
```
border, border-2, border-t, border-b
rounded, rounded-lg, rounded-full, rounded-md
```

### Effects
```
shadow-sm, shadow, shadow-lg, shadow-xl
hover:shadow-lg
transition-colors, transition-shadow, transition-all
opacity-50, opacity-100
```

### Responsive Prefixes
```
sm:grid-cols-2         // >= 640px
md:grid-cols-3         // >= 768px
lg:grid-cols-4         // >= 1024px
xl:grid-cols-5         // >= 1280px
```

### State Variants
```
hover:bg-primary/90
focus:outline-none
focus:ring-2
focus:ring-ring
disabled:opacity-50
disabled:cursor-not-allowed
```

## 🔄 Animations

### Spin (Loading)
```jsx
<Loader2 className="animate-spin" />
```

### Bounce (Dots)
```jsx
<span className="animate-bounce"></span>
<span className="animate-bounce" style={{ animationDelay: '150ms' }}></span>
<span className="animate-bounce" style={{ animationDelay: '300ms' }}></span>
```

### Custom (Slide In)
```jsx
<div className="animate-slide-in">
  {/* Content */}
</div>
```

## 📱 Responsive Patterns

### Mobile-First Approach
```jsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row gap-4">
  <div className="lg:w-1/2">Left</div>
  <div className="lg:w-1/2">Right</div>
</div>

// Hide on mobile, show on desktop
<span className="hidden sm:inline">Desktop Only</span>

// Show on mobile, hide on desktop
<span className="sm:hidden">Mobile Only</span>
```

## 🎨 Dark Mode Support

All components are ready for dark mode. To enable, add `.dark` class to root element:

```jsx
document.documentElement.classList.add('dark');
```

Colors automatically switch based on CSS variables defined in `index.css`.

---

**Last Updated**: January 2025  
**Tailwind Version**: v4.1.16  
**Project**: StudySync
