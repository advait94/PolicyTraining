# AA Plus Design System

Derived from "Regulatory Compliance" Landing Page Analysis.

## 1. Color Palette

### Core Colors
- **Background**: `bg-[#0B0F19]` (Deep Obsidian)
- **Surface**: `bg-[#151A29]` (Dark Slate)
- **Surface Highlight**: `bg-[#1E2538]`
- **Text Primary**: `text-white`
- **Text Secondary**: `text-slate-400`

### Brand Accents (Gradients)
- **Primary Gradient**: `from-[#A855F7] to-[#EC4899]` (Purple to Pink)
  - Used in: Hero Headlines ("Regulatory Compliance"), Primary Buttons, Active States.
- **Secondary Accent**: `text-[#22D3EE]` (Cyan)
  - Used in: Data markers, chart lines, "98%" compliance scores.
- **Tertiary Accent**: `text-[#C084FC]` (Violet)
  - Used in: Glow effects, borders.

## 2. Typography

**Font Family**: `Inter` or `Plus Jakarta Sans` (Modern, geometric sans-serif).

### Styles
- **Hero Heading**:
  - Size: `text-6xl` or `text-7xl`
  - Weight: `font-bold` or `font-extrabold`
  - Style: White text for standard words, **Gradient Text** for key value proposition.
- **Section Heading**: `text-3xl font-bold text-white`
- **Body Text**: `text-lg text-slate-400 leading-relaxed`
- **Nav Links**: `text-sm font-medium text-slate-300 hover:text-white uppercase tracking-wide`

## 3. UI Components

### Buttons
1.  **Primary Action (Pill)**:
    - Shape: `rounded-full`
    - Bg: `bg-white text-black` (High contrast) or Gradient `bg-gradient-to-r from-purple-600 to-pink-600 text-white`
    - Hover: Scale up slightly, shadow glow.
    - Example: "Start Briefing ->"

2.  **Secondary Action (Outline)**:
    - Shape: `rounded-full`
    - Bg: `bg-transparent`
    - Border: `border border-slate-700`
    - Text: `text-white`
    - Example: "Explore Services"

### Cards (Glassmorphism)
- **Container**: `bg-white/5` (5% opacity white)
- **Backdrop**: `backdrop-blur-xl`
- **Border**: `border border-white/10`
- **Shadow**: `shadow-2xl shadow-purple-500/20` (Colored glow shadow)
- **Radius**: `rounded-2xl` or `rounded-3xl`

### Data Visualization (Dashboard Preview)
- **Charts**: Neon lines (`stroke-cyan-400`, `stroke-purple-400`) against dark backgrounds.
- **Stats**: Large numbers (`text-3xl font-bold`) with small labels.

## 4. Visual Effects
- **Glows**: Soft radial gradients behind hero images or cards to create depth.
  - `bg-purple-900/30 blur-3xl rounded-full`
- **Reflection**: Subtle top-border highlight (`border-t-white/20`) on cards.

## 5. Usage in Project (Tailwind)

```tsx
// Example Hero Component
<section className="bg-[#0B0F19] min-h-screen flex items-center">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12">
    
    {/* Text Content */}
    <div className="space-y-8">
      <h1 className="text-6xl font-extrabold tracking-tight text-white leading-tight">
        The Fastest Way to <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Regulatory Compliance.
        </span>
      </h1>
      <p className="text-xl text-slate-400 max-w-lg">
        AA Plus Architects policy for...
      </p>
      <div className="flex gap-4">
        <Button className="rounded-full bg-white text-black hover:bg-slate-200 px-8 py-4 text-lg font-semibold cursor-pointer">
          Start Briefing ->
        </Button>
      </div>
    </div>

    {/* Hero Image / Dashboard */}
    <div className="relative">
      {/* Glow Effect */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-3xl rounded-full opacity-50" />
      
      <div className="relative bg-[#151A29]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
        {/* Dashboard Content */}
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-white font-semibold">Telecom Regulatory Compliance</h3>
        </div>
      </div>
    </div>
    
  </div>
</section>
```
