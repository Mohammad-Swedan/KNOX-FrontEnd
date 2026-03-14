import re

with open('src/features/universities/components/DataEditor.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Strip style blocks
text = re.sub(r'<style>.*?</style>', '', text, flags=re.DOTALL)

# Convert classes
text = text.replace('className="ed-input"', 'className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"')
text = text.replace('className="ed-btn"', 'className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"')
text = text.replace('className="ed-select"', 'className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"')

# There might be string concatenation for classes: className={ed-input }
text = re.sub(r'className=\{ed-input([^]*)\}', r'className={lex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2\1}', text)

# Just save it directly
with open('src/features/universities/components/DataEditor.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Done replacing classes.")
