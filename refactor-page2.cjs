const fs = require("fs");
let text = fs.readFileSync("src/features/universities/pages/CurriculumTreePage.tsx", "utf8");

text = text.replace(/style=\{\{(.*?)(?:color|background|backgroundColor):\s*"#(0F172A|1E293B|F1F5F9|334155|475569|64748B|94A3B8|CBD5E1)"(.*?)}} /gi, (match, before, colorHex, after) => {
    return match.replace(colorHex, ""); // I will just use a simpler replace
});

// A faster approach is just to string match and replace hex codes with currentColor or var(--background)
const map = {
    "#0F172A": "var(--background)",
    "#1E293B": "var(--card)",
    "#F1F5F9": "var(--foreground)",
    "#334155": "var(--border)",
    "#475569": "var(--muted-foreground)",
    "#64748B": "var(--muted-foreground)",
    "#94A3B8": "var(--muted-foreground)",
    "#CBD5E1": "var(--foreground)"
};

text = text.replace(/(color|background|backgroundColor|fill):\s*"(#(?:0F172A|1E293B|F1F5F9|334155|475569|64748B|94A3B8|CBD5E1))"/gi, (match, prop, hex) => {
    const val = map[hex.toUpperCase()];
    if (val) {
        return `${prop}: "${val}"`;
    }
    return match;
});

// Same for JSX fills which don t have quotes around the object:
text = text.replace(/fill="(#(?:0F172A|1E293B|F1F5F9|334155|475569|64748B|94A3B8|CBD5E1))"/gi, (match, hex) => {
    const val = map[hex.toUpperCase()];
    if (val) {
        return `fill="${val}"`;
    }
    return match;
});

fs.writeFileSync("src/features/universities/pages/CurriculumTreePage.tsx", text, "utf8");
console.log("Done");
