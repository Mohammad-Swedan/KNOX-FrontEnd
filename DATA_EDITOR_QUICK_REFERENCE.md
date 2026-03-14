# DataEditor Component - Quick Reference Guide

## 🎨 Visual Design Improvements

### Spacing & Layout

```
Section Cards:    24px padding (px-6) on top/bottom
Content Area:     6px spacing from tab bar (py-6)
Course Cards:     12px gap between cards (gap-3)
Input/Label:      8px spacing (space-y-2)
Row Components:   4px gap (gap-4)
```

### Color Scheme

```
Primary:          Indigo (#6366F1)
Secondary:        Muted backgrounds (#f5f5f5 / dark mode equivalent)
Accent:           Blue (#60A5FA) for semester badges
Destructive:      Red (#EF4444) for delete actions
Category Colors:  Dynamic from category config
```

### Scrollbars

```
Width:            8px
Color:            Indigo with transparency (rgba(99, 102, 241, 0.4))
Hover Color:      Darker indigo (rgba(99, 102, 241, 0.7))
Border Radius:    4px
Transition:       0.2s smooth
```

### Buttons

```
Primary Button:   Gradient bg-linear-to-r from-indigo-500 to-purple-500
Outline Button:   Border with hover bg-accent
Ghost Button:     Transparent with hover effects
Icon Buttons:     Size sm (h-8 w-8) or lg (h-10 w-10)
States:           Disabled, loading, hover, focus
```

### Cards

```
Course Card:
  - Left border: 4px solid (category color)
  - Background: bg-background/50 with backdrop blur
  - Padding: 16px (p-4)
  - Hover: shadow-md transition
  - Border radius: 8px

Section Card:
  - Background: bg-card
  - Border: border-border
  - Radius: 12px
  - Padding: 24px (via CardContent)
```

### Typography

```
Section Title:    text-lg font-bold
Card Title:       font-semibold (CardTitle)
Label:            text-sm font-medium
Input Placeholder: text-muted-foreground
Small Text:       text-xs text-muted-foreground
```

## 🎯 Key Features

### Tab Navigation

- Clean system Tabs component
- Icon + label for each section
- Smooth transition between sections
- Active state styling with primary color

### Course Card Features

- **Move Buttons**: Chevron up/down for reordering
- **Delete Button**: Trash icon with hover effects
- **Color Indicator**: Left border shows category color
- **Category Select**: Dropdown with color dots
- **Credits Input**: Number input with unit label
- **Type Toggle**: Checkbox for main/secondary
- **Prerequisites**: Comma-separated input

### Category Management

- Color picker with visual preview
- ID field (read-only or editable)
- Label field
- Default toggle
- Delete option
- Flexible wrapping layout

## 📱 Responsive Behavior

```
Desktop:          2-column layout for title inputs, full-width courses
Tablet:           Single column for title inputs, adjusted card width
Mobile:           Stack layout, scrollable course cards
```

## 🔄 State Management

```
activeSection:    0 = Title, 1 = Categories, 2 = Courses
titleMain:        Main title text
titleSub:         Subtitle text
categories:       Array of category objects
courses:          Array of course objects
saving:           Boolean for save button loading state
```

## 🎬 Animations

```
Section Entry:    slideIn animation (0.3s ease-out)
Button Hover:     bg-transition (0.2s)
Card Hover:       shadow-transition (0.15s)
Scrollbar Thumb:  color-transition (0.2s)
```

## ♿ Accessibility

- All buttons have aria-label
- All form inputs have associated labels or titles
- Color inputs have title attributes
- Proper heading hierarchy (h1, h2, h3)
- Keyboard navigation support
- Focus states on all interactive elements

## 🚀 Performance Optimizations

- Memo components for category/course lists
- Efficient event handlers (no closures in render)
- CSS transitions instead of JS animations
- Lazy scrolling for large course lists

## 🛠️ Customization Points

```
Colors:           Modify Tailwind theme colors in config
Spacing:          Adjust gap-X and padding-X values
Scrollbar:        Modify CSS in <style> tag
Animations:       Adjust @keyframes slideIn
Icons:            Replace lucide-react icons
```

## 📊 Component Structure

```
DataEditor
├── Top Bar (Header)
│   ├── Logo & Title
│   ├── Cancel Button
│   └── Save Button (with loading state)
├── Tab Navigation
│   ├── Title Tab
│   ├── Categories Tab
│   └── Courses Tab
└── Content Area
    ├── Section 0: Title Editor
    │   ├── Main Title Input
    │   ├── Sub Title Input
    │   └── Live Preview
    ├── Section 1: Categories Manager
    │   └── Category List
    │       ├── Color Picker
    │       ├── ID Input
    │       ├── Label Input
    │       ├── Default Toggle
    │       └── Delete Button
    └── Section 2: Course Editor
        └── Column Container (Horizontal Scroll)
            └── Course Cards
                ├── Move Controls
                ├── Delete Button
                ├── Name Inputs
                ├── Category Select
                ├── Credits Input
                ├── Type Toggle
                └── Prerequisites Input
```

## 🎓 Usage Example

```tsx
<DataEditor
  initialData={{
    TITLE: { main: "البرنامج", sub: "الوصف" },
    CATEGORIES: {
      core: { label: "أساسي", color: "#6366F1", showByDefault: true },
    },
    COURSES: [
      {
        id: "C001",
        name: "مادة البرمجة",
        nameEn: "Programming",
        cat: "core",
        credits: 3,
        isMain: true,
        col: 1,
        prereqs: [],
      },
    ],
  }}
  onSave={(data) => console.log(data)}
  onCancel={() => console.log("Cancelled")}
  saving={false}
/>
```

## 🐛 Known Issues

- ESLint may flag color input element with false positive about duplicate IDs (this is a linting issue, not a functional one)
- Long course names may wrap awkwardly on very small screens

## 📝 Future Enhancements

1. Add form validation with error states
2. Add confirmation dialog for deletes
3. Add keyboard shortcuts (Ctrl+S, Esc)
4. Add undo/redo with history
5. Add drag-and-drop for course reordering
6. Add import/export functionality
7. Add field-level autosave
