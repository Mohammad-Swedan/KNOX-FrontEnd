const fs = require("fs");
let text = fs.readFileSync("src/features/universities/components/DataEditor.tsx", "utf8");

const map = {
    "#0F172A": "var(--background)",
    "#1E293B": "var(--card)",
    "#F1F5F9": "var(--foreground)",
    "#334155": "var(--border)",
    "#475569": "var(--muted-foreground)",
    "#64748B": "var(--muted-foreground)",
    "#94A3B8": "var(--muted-foreground)",
    "#E2E8F0": "var(--foreground)"
};

text = text.replace(/(color|background|backgroundColor|fill):\s*"(#(?:0F172A|1E293B|F1F5F9|334155|475569|64748B|94A3B8|E2E8F0))"/gi, (match, prop, hex) => {
    const val = map[hex.toUpperCase()];
    if (val) {
        return `${prop}: "${val}"`;
    }
    return match;
});

// Replace "rgba(255,255,255,x)" in style objects
text = text.replace(/rgba\(255,255,255,0\.0[0-9]\)/gi, "var(--background)");
text = text.replace(/rgba\(255,255,255,0\.1\)/gi, "var(--border)");
text = text.replace(/rgba\(255,255,255,0\.0[3-8]\)/gi, "var(--muted)");

fs.writeFileSync("src/features/universities/components/DataEditor.tsx", text, "utf8");
console.log("Done");
