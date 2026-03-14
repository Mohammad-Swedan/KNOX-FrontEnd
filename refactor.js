const fs = require('fs');
let text = fs.readFileSync('src/features/universities/components/DataEditor.tsx', 'utf8');

text = text.replace(/<style>[\s\S]*?<\/style>/g, '');

const inputClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
const btnClass = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2';
const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

text = text.replace(/className="ed-input"/g, `className="${inputClass}"`);
text = text.replace(/className="ed-btn"/g, `className="${btnClass}"`);
text = text.replace(/className="ed-select"/g, `className="${selectClass}"`);

text = text.replace(/className=\{`ed-btn([^`]*)`\}/g, "className={`" + btnClass + "$1`}");

const rgbaBgRegex = /background:\s*["']rgba\((255,255,255,\s*0\.0[1-9])\)["']/gi;
text = text.replace(rgbaBgRegex, 'background: ""');

text = text.replace(/color:\s*["']#(?:E2E8F0|F1F5F9)["']/gi, 'color: "currentColor"');
text = text.replace(/fill:\s*["']#(?:E2E8F0|F1F5F9)["']/gi, 'fill: "currentColor"');
text = text.replace(/style=\{\{\s*color:\s*["']#64748B["']\s*\}\}/g, 'className="text-muted-foreground"');

fs.writeFileSync('src/features/universities/components/DataEditor.tsx', text, 'utf8');
console.log("Done refactoring DataEditor");
