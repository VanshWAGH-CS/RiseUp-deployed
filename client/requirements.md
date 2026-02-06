## Packages
framer-motion | Complex animations for page transitions and interactions
recharts | Data visualization for dashboards (analytics)
lucide-react | Iconography (already in base, but emphasizing need)
react-hook-form | Form handling
@hookform/resolvers | Form validation with Zod
zod | Schema validation
clsx | Class name conditional logic
tailwind-merge | Class merging utility
date-fns | Date formatting

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Outfit', sans-serif"],
  body: ["'DM Sans', sans-serif"],
}

Tailwind Config - extend colors:
colors: {
  primary: {
    DEFAULT: "hsl(221 83% 53%)",
    foreground: "hsl(210 40% 98%)",
  },
  accent: {
    DEFAULT: "hsl(24 95% 53%)", // Orange accent
    foreground: "hsl(0 0% 100%)",
  }
}
