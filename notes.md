# CS 260 Notes
I learned how to use Github to 

[My startup - Simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

My IP address is: 54.81.96.130
Launching my AMI I initially put it on a private subnet. Even though it had a public IP address and the security group was right, I wasn't able to connect to it.

## Caddy

No problems worked just like it said in the [instruction](https://github.com/webprogramming260/.github/blob/main/profile/webServers/https/https.md).

## HTML

This was easy. I was careful to use the correct structural elements such as header, footer, main, nav, and form. The links between the three views work great using the `a` element.

The part I didn't like was the duplication of the header and footer code. This is messy, but it will get cleaned up when I get to React.

## CSS

This took a couple hours to get it how I wanted. It was important to make it responsive and Bootstrap helped with that. It looks great on all kinds of screen sizes.

Bootstrap seems a bit like magic. It styles things nicely, but is very opinionated. You either do, or you do not. There doesn't seem to be much in between.

I did like the navbar it made it super easy to build a responsive header.

```html
      <nav class="navbar navbar-expand-lg bg-body-tertiary">
        <div class="container-fluid">
          <a class="navbar-brand">
            <img src="logo.svg" width="30" height="30" class="d-inline-block align-top" alt="" />
            Calmer
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <a class="nav-link active" href="play.html">Play</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="about.html">About</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="index.html">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
```

I also used SVG to make the icon and logo for the app. This turned out to be a piece of cake.

```html
<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#0066aa" rx="10" ry="10" />
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="72" font-family="Arial" fill="white">C</text>
</svg>
```

## React Part 1: Routing

Setting up Vite and React was pretty simple. I had a bit of trouble because of conflicting CSS. This isn't as straight forward as you would find with Svelte or Vue, but I made it work in the end. If there was a ton of CSS it would be a real problem. It sure was nice to have the code structured in a more usable way.

## React Part 2: Reactivity

This was a lot of fun to see it all come together. I had to keep remembering to use React state instead of just manipulating the DOM directly.

Handling the toggling of the checkboxes was particularly interesting.

```jsx
<div className="input-group sound-button-container">
  {calmSoundTypes.map((sound, index) => (
    <div key={index} className="form-check form-switch">
      <input
        className="form-check-input"
        type="checkbox"
        value={sound}
        id={sound}
        onChange={() => togglePlay(sound)}
        checked={selectedSounds.includes(sound)}
      ></input>
      <label className="form-check-label" htmlFor={sound}>
        {sound}
      </label>
    </div>
  ))}
</div>
```


# CS260 Comprehensive Exam Notes

## Table of Contents
1. [HTML Fundamentals](#html-fundamentals)
2. [CSS Fundamentals](#css-fundamentals)
3. [JavaScript Basics](#javascript-basics)
4. [DOM Manipulation](#dom-manipulation)
5. [Command Line](#command-line)
6. [Networking & Web](#networking--web)
7. [Asynchronous JavaScript](#asynchronous-javascript)

---

## HTML Fundamentals

### Link Element (`<link>`)
**Purpose:** Connects external resources to HTML document

**Syntax:**
```html
<link rel="stylesheet" href="styles.css">
```

**Key Points:**
- Goes in `<head>` section
- Self-closing tag
- `rel` attribute defines relationship (usually "stylesheet")
- `href` attribute specifies file path
- Most commonly used for CSS stylesheets

---

### Div Tag (`<div>`)
**Purpose:** Container element for grouping content

**Characteristics:**
- **Block-level element** (takes full width, creates new line)
- No semantic meaning (just for layout/styling)
- Used to group elements for CSS/JavaScript targeting
- Can contain any other HTML elements

**Example:**
```html
<div class="container">
  <p>Content here</p>
</div>
```

---

### Document Type Declaration
**Syntax:**
```html
<!DOCTYPE html>
```

**Key Points:**
- **Must be first line** of HTML document
- Declares this is an HTML5 document
- Tells browser how to render the page
- Not case-sensitive (but uppercase is convention)
- Not an HTML tag (it's a declaration)

---

### HTML Element Tags

| Element | Opening Tag | Description |
|---------|-------------|-------------|
| Paragraph | `<p>` | Text paragraph |
| Ordered List | `<ol>` | Numbered list |
| Unordered List | `<ul>` | Bulleted list |
| List Item | `<li>` | Item in ol/ul |
| First Level Heading | `<h1>` | Largest heading |
| Second Level Heading | `<h2>` | Second largest |
| Third Level Heading | `<h3>` | Third largest |
| Span | `<span>` | Inline container |
| Anchor | `<a>` | Hyperlink |
| Image | `<img>` | Image (self-closing) |

---

### Image with Hyperlink
**How to create:** Wrap `<img>` inside `<a>` tag

**Syntax:**
```html
<a href="https://example.com">
  <img src="image.jpg" alt="Description">
</a>
```

**Key Points:**
- `<a>` creates the clickable link
- `<img>` displays the image
- `href` = destination URL
- `src` = image file path
- `alt` = alternative text (accessibility)

---

### Including JavaScript in HTML
**Method 1: External File**
```html
<script src="script.js"></script>
```

**Method 2: Inline**
```html
<script>
  // JavaScript code here
  console.log('Hello');
</script>
```

**Key Points:**
- Can place in `<head>` or before `</body>`
- Before `</body>` is preferred (page loads faster)
- External files are better for organization
- `<script>` tag is used for JavaScript

---

## CSS Fundamentals

### Selectors: ID vs Class

#### ID Selector (`#`)
**Purpose:** Target ONE specific element

**Syntax:**
```css
#title {
  color: blue;
}
```

**HTML:**
```html
<h1 id="title">Hello</h1>
```

**Rules:**
- ID must be unique on the page
- Use `#` in CSS
- Use `id="name"` in HTML
- Higher specificity than classes

#### Class Selector (`.`)
**Purpose:** Target MULTIPLE elements

**Syntax:**
```css
.grid {
  display: grid;
}
```

**HTML:**
```html
<div class="grid">Content 1</div>
<div class="grid">Content 2</div>
```

**Rules:**
- Classes are reusable
- Use `.` in CSS
- Use `class="name"` in HTML
- Multiple classes: `class="grid container"`

#### Element Selector
**Purpose:** Target all elements of a type

**Syntax:**
```css
div {
  background-color: red;
}
```

**Targets:** ALL `<div>` elements on the page

---

### Padding vs Margin

#### Visual Representation
```
[margin [border [padding CONTENT padding] border] margin]
```

#### Padding
**Definition:** Space INSIDE element (between content and border)

**Syntax:**
```css
padding: 10px;              /* All sides */
padding: 10px 20px;         /* Vertical | Horizontal */
padding: 10px 20px 15px 25px; /* Top Right Bottom Left (clockwise) */
padding-top: 10px;          /* Individual side */
```

**Effect:** Makes element bigger, pushes content inward

#### Margin
**Definition:** Space OUTSIDE element (between border and other elements)

**Syntax:**
```css
margin: 10px;              /* All sides */
margin: 10px 20px;         /* Vertical | Horizontal */
margin: 10px 20px 15px 25px; /* Top Right Bottom Left */
margin-left: 10px;         /* Individual side */
```

**Effect:** Creates space between elements, doesn't change element size

---

### CSS Box Model
**Order from INSIDE to OUTSIDE:**

1. **Content** - The actual text, images, etc.
2. **Padding** - Space around content, inside border
3. **Border** - Edge of the element
4. **Margin** - Space outside border

**Mnemonic:** **C**ontent **P**adding **B**order **M**argin (inside → outside)

**Visual:**
```
┌─────────────────────────────┐
│        Margin               │
│  ┌───────────────────────┐  │
│  │      Border           │  │
│  │  ┌─────────────────┐  │  │
│  │  │    Padding      │  │  │
│  │  │  ┌───────────┐  │  │  │
│  │  │  │  Content  │  │  │  │
│  │  │  └───────────┘  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

### Flexbox

**Purpose:** Create flexible, responsive layouts

**Basic Syntax:**
```css
.container {
  display: flex;
}
```

**Common Properties:**

**On Container (Parent):**
```css
.container {
  display: flex;
  flex-direction: row;        /* row | column | row-reverse | column-reverse */
  justify-content: center;    /* Alignment along main axis */
  align-items: center;        /* Alignment along cross axis */
  flex-wrap: wrap;            /* Allow items to wrap */
  gap: 10px;                  /* Space between items */
}
```

**justify-content values:**
- `flex-start` - items at start
- `flex-end` - items at end
- `center` - items centered
- `space-between` - space between items
- `space-around` - space around items
- `space-evenly` - equal space between

**align-items values:**
- `flex-start` - align to top/left
- `flex-end` - align to bottom/right
- `center` - center items
- `stretch` - stretch to fill (default)

**On Items (Children):**
```css
.item {
  flex-grow: 1;     /* How much item grows */
  flex-shrink: 1;   /* How much item shrinks */
  flex-basis: 100px; /* Base size */
}
```

---

### Display Properties

**Common Display Values:**

| Value | Behavior | Example Element |
|-------|----------|-----------------|
| `block` | Full width, new line | `<div>`, `<p>`, `<h1>` |
| `inline` | Only needed width, no new line | `<span>`, `<a>`, `<strong>` |
| `inline-block` | Like inline but can set width/height | - |
| `flex` | Flexible box layout | - |
| `grid` | Grid layout | - |
| `none` | Hidden, removed from layout | - |

**Default for `<span>`:** `inline`

**Default for `<div>`:** `block`

---

### Targeting Specific Elements

**Example HTML:**
```html
<div>
  <span class="trouble">trouble</span>
  <span>double</span>
</div>
```

**Make "trouble" green, leave "double" unaffected:**
```css
.trouble {
  color: green;
}
```

**Key Strategy:** Use classes or IDs to target specific elements

---

## JavaScript Basics

### Arrow Functions

**Traditional Function:**
```javascript
function add(a, b) {
  return a + b;
}
```

**Arrow Function Equivalents:**
```javascript
// Full syntax
const add = (a, b) => {
  return a + b;
};

// Implicit return (no curly braces)
const add = (a, b) => a + b;

// Single parameter (parentheses optional)
const square = x => x * x;

// No parameters
const greet = () => console.log('Hello');
```

**Key Differences:**
- More concise syntax
- Implicit return when no `{}`
- Different `this` binding (not covered in depth here)
- Cannot be used as constructors

---

### Array Methods

#### map()
**Purpose:** Transform each element in array, create new array

**Syntax:**
```javascript
const newArray = array.map(callback);
```

**Examples:**
```javascript
const numbers = [1, 2, 3, 4];
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8]

const names = ['alice', 'bob'];
const upper = names.map(name => name.toUpperCase());
console.log(upper); // ['ALICE', 'BOB']
```

**Key Points:**
- Creates a NEW array (doesn't modify original)
- Returns array of SAME length
- Each element is transformed by callback function

#### Other Common Array Methods
```javascript
// filter - keep elements that pass test
[1, 2, 3, 4].filter(x => x > 2); // [3, 4]

// reduce - reduce to single value
[1, 2, 3, 4].reduce((sum, x) => sum + x, 0); // 10

// forEach - execute function for each element
[1, 2, 3].forEach(x => console.log(x));

// find - return first element that matches
[1, 2, 3, 4].find(x => x > 2); // 3
```

---

### Loops

#### For Loop
**Syntax:**
```javascript
for (initialization; condition; increment) {
  // code
}
```

**Example:**
```javascript
for (let i = 0; i < 3; i++) {
  console.log(i);
}
// Output: 0, 1, 2
```

**Key Points:**
- `let i = 0` - runs once at start
- `i < 3` - checked before each iteration
- `i++` - runs after each iteration
- Loop runs while condition is true

#### While Loop
**Syntax:**
```javascript
while (condition) {
  // code
}
```

**Example:**
```javascript
let i = 0;
while (i < 3) {
  console.log(i);
  i++;
}
// Output: 0, 1, 2
```

---

### Conditional Statements

#### If/Else
**Syntax:**
```javascript
if (condition) {
  // code if true
} else if (anotherCondition) {
  // code if first false, this true
} else {
  // code if all false
}
```

**Example:**
```javascript
const age = 20;
if (age < 18) {
  console.log('Minor');
} else if (age < 65) {
  console.log('Adult');
} else {
  console.log('Senior');
}
// Output: Adult
```

#### Switch Statement
**Syntax:**
```javascript
switch (expression) {
  case value1:
    // code
    break;
  case value2:
    // code
    break;
  default:
    // code if no match
}
```

**Example:**
```javascript
const day = 'Monday';
switch (day) {
  case 'Monday':
    console.log('Start of week');
    break;
  case 'Friday':
    console.log('End of week');
    break;
  default:
    console.log('Middle of week');
}
// Output: Start of week
```

**Key Points:**
- `break` prevents fall-through
- `default` is optional (like `else`)
- Matches use strict equality (`===`)

---

### JavaScript Objects

#### Creating Objects
**Object Literal Syntax:**
```javascript
const person = {
  name: "John",
  age: 25,
  city: "Provo"
};
```

**Alternative Syntax:**
```javascript
const person = new Object();
person.name = "John";
```

#### Accessing Properties
```javascript
const person = { name: "John", age: 25 };

// Dot notation
console.log(person.name); // "John"

// Bracket notation
console.log(person['age']); // 25

// Bracket notation with variable
const prop = 'name';
console.log(person[prop]); // "John"
```

#### Adding Properties
**YES, you can add properties to existing objects:**

```javascript
const obj = { name: "Alice" };

// Add new property
obj.age = 30;
obj.city = "Provo";

console.log(obj); // { name: "Alice", age: 30, city: "Provo" }

// Modify existing property
obj.name = "Bob";

// Delete property
delete obj.city;
```

**Key Points:**
- Objects are dynamic and mutable
- Can add, modify, or delete properties anytime
- Properties can be any data type

---

### JSON (JavaScript Object Notation)

**Definition:** Text-based data format for storing and exchanging data

**Valid JSON:**
```json
{
  "name": "John",
  "age": 25,
  "active": true,
  "hobbies": ["reading", "coding"],
  "address": {
    "city": "Provo",
    "zip": "84604"
  }
}
```

**JSON Rules:**
- Keys MUST be in **double quotes** `"key"`
- String values in double quotes
- No trailing commas
- Supports: strings, numbers, booleans, arrays, objects, null
- Does NOT support: functions, undefined, dates, comments

**JSON vs JavaScript Object:**

| Feature | JSON | JavaScript Object |
|---------|------|-------------------|
| Keys | Must use "double quotes" | Can be unquoted |
| String values | Must use "double quotes" | Can use 'single' or "double" |
| Functions | NOT allowed | Allowed |
| Trailing commas | NOT allowed | Allowed |
| Comments | NOT allowed | Allowed |

**Converting:**
```javascript
// Object → JSON string
const obj = { name: "John", age: 25 };
const jsonString = JSON.stringify(obj);
console.log(jsonString); // '{"name":"John","age":25}'

// JSON string → Object
const json = '{"name":"John","age":25}';
const parsed = JSON.parse(json);
console.log(parsed.name); // "John"
```

---

## DOM Manipulation

### What is the DOM?

**DOM (Document Object Model):** Programming interface for HTML documents

**Key Concepts:**
- Represents HTML as a tree of objects/nodes
- Each HTML element is a node
- JavaScript can manipulate these nodes
- Browser creates DOM when page loads
- Language-independent (but commonly used with JS)

**True Statements about DOM:**
- ✅ Represents HTML as a tree structure
- ✅ JavaScript can add, delete, modify elements
- ✅ Each HTML element becomes a node
- ✅ Created by browser when page loads
- ✅ Can be manipulated in real-time

---

### Selecting Elements

#### getElementById()
**Purpose:** Get element by its ID

**Syntax:**
```javascript
const element = document.getElementById('myId');
```

**Example:**
```html
<div id="header">Hello</div>
```
```javascript
const header = document.getElementById('header');
console.log(header.textContent); // "Hello"
```

**Key Points:**
- Returns single element (IDs are unique)
- Returns `null` if not found
- Don't include `#` in the ID string

#### querySelector()
**Purpose:** Get first element matching CSS selector

**Syntax:**
```javascript
const element = document.querySelector('selector');
```

**Examples:**
```javascript
// By ID (use #)
document.querySelector('#myId');

// By class (use .)
document.querySelector('.myClass');

// By element
document.querySelector('div');

// Complex selector
document.querySelector('div.container > p');
```

**Key Points:**
- Returns first matching element
- Returns `null` if not found
- Use CSS selector syntax
- More flexible than getElementById

#### querySelectorAll()
**Purpose:** Get ALL elements matching selector

```javascript
const elements = document.querySelectorAll('.myClass');
// Returns NodeList (array-like)
```

---

### Event Handling

#### addEventListener()
**Purpose:** Attach event handler to element

**Syntax:**
```javascript
element.addEventListener(eventType, callback);
```

**Example:**
```javascript
const button = document.getElementById('myButton');

button.addEventListener('click', function() {
  console.log('Button clicked!');
});

// With arrow function
button.addEventListener('click', () => {
  console.log('Clicked!');
});
```

**Common Event Types:**
- `'click'` - element is clicked
- `'mouseover'` - mouse enters element
- `'mouseout'` - mouse leaves element
- `'keydown'` - key is pressed
- `'keyup'` - key is released
- `'submit'` - form is submitted
- `'load'` - page/image finishes loading
- `'change'` - input value changes
- `'focus'` - element receives focus
- `'blur'` - element loses focus

**Complete Example:**
```html
<button id="btn">Click Me</button>
```
```javascript
const btn = document.getElementById('btn');

btn.addEventListener('click', function() {
  console.log('Button was clicked!');
});

// Output (when button clicked): Button was clicked!
```

---

### Modifying Elements

#### Changing Text Content
```javascript
// Get element
const element = document.getElementById('myId');

// Change text
element.textContent = 'New text';

// Alternative (includes HTML)
element.innerHTML = '<strong>Bold text</strong>';
```

**textContent vs innerHTML:**
- `textContent` - plain text only, safer
- `innerHTML` - can include HTML tags

#### Changing Styles
```javascript
const element = document.getElementById('byu');

// Change single style
element.style.color = 'green';
element.style.backgroundColor = 'yellow';
element.style.fontSize = '20px';

// Note: CSS properties use camelCase
// background-color → backgroundColor
// font-size → fontSize
```

#### Changing Attributes
```javascript
const img = document.querySelector('img');

// Get attribute
const src = img.getAttribute('src');

// Set attribute
img.setAttribute('src', 'new-image.jpg');
img.setAttribute('alt', 'New description');

// Direct property access
img.src = 'new-image.jpg';
```

#### Adding/Removing Classes
```javascript
const element = document.querySelector('.box');

// Add class
element.classList.add('active');

// Remove class
element.classList.remove('inactive');

// Toggle class (add if absent, remove if present)
element.classList.toggle('highlight');

// Check if has class
if (element.classList.contains('active')) {
  console.log('Element is active');
}
```

---

### Practical DOM Examples

#### Example 1: Change Specific Text
**HTML:**
```html
<div>
  <span class="animal">fish</span>
  <span>fish</span>
</div>
```

**Task:** Change "animal" to "crow", leave other "fish" unaffected

**JavaScript:**
```javascript
document.querySelector('.animal').textContent = 'crow';
```

#### Example 2: Change Text Color
**HTML:**
```html
<div id="byu">Go Cougars!</div>
```

**Task:** Make text green

**JavaScript:**
```javascript
// Method 1
const element = document.getElementById('byu');
element.style.color = 'green';

// Method 2
document.querySelector('#byu').style.color = 'green';
```

#### Example 3: Button Click Counter
**HTML:**
```html
<button id="btn">Click me</button>
<p id="count">0</p>
```

**JavaScript:**
```javascript
let counter = 0;
const button = document.getElementById('btn');
const countDisplay = document.getElementById('count');

button.addEventListener('click', () => {
  counter++;
  countDisplay.textContent = counter;
});
```

---

## Command Line

### Command Reference Table

| Command | Full Name | Purpose | Example |
|---------|-----------|---------|---------|
| `chmod` | Change Mode | Change file permissions | `chmod 755 file.txt` |
| `pwd` | Print Working Directory | Show current directory path | `pwd` |
| `cd` | Change Directory | Navigate to different folder | `cd /home/user` |
| `ls` | List | Show files/folders in directory | `ls -la` |
| `vim` | Vi Improved | Open Vim text editor | `vim file.txt` |
| `nano` | Nano | Open Nano text editor (simpler) | `nano file.txt` |
| `mkdir` | Make Directory | Create new folder | `mkdir newfolder` |
| `mv` | Move | Move or rename files/folders | `mv old.txt new.txt` |
| `rm` | Remove | Delete files or directories | `rm file.txt` |
| `man` | Manual | Display command documentation | `man ls` |
| `ssh` | Secure Shell | Create remote shell session | `ssh user@host` |
| `ps` | Process Status | Show running processes | `ps aux` |
| `wget` | Web Get | Download files from internet | `wget url.com/file` |
| `sudo` | Superuser Do | Run command with admin privileges | `sudo apt install` |

---

### Important Commands Detail

#### ssh - Secure Shell
**Purpose:** Creates a REMOTE SHELL SESSION

**Syntax:**
```bash
ssh username@hostname
```

**Example:**
```bash
ssh student@byu.edu
```

**What it does:**
- Connects to remote computer securely
- Allows you to control remote machine
- Encrypted connection (secure)
- Commonly used for server management

---

#### ls - List Files

**Basic Usage:**
```bash
ls
```

**With `-la` Parameters:**
```bash
ls -la
```

**What `-la` does:**
- `-l` = **Long format** (detailed information)
- `-a` = **All files** (including hidden files starting with `.`)

**Output includes:**
```
drwxr-xr-x  2 user group 4096 Oct 19 10:30 folder
-rw-r--r--  1 user group  256 Oct 19 10:25 file.txt
```

**Reading the output:**
- `d` = directory, `-` = file
- `rwxr-xr-x` = permissions (read, write, execute)
- `2` = number of links
- `user` = owner
- `group` = group owner
- `4096` = size in bytes
- `Oct 19 10:30` = last modified date/time
- `folder` or `file.txt` = name

---

#### cd - Change Directory

**Common usage:**
```bash
cd /path/to/directory  # Go to specific path
cd ..                  # Go up one level
cd ~                   # Go to home directory
cd -                   # Go to previous directory
cd                     # Go to home directory (no argument)
```

---

#### mkdir - Make Directory

**Usage:**
```bash
mkdir foldername        # Create single folder
mkdir -p path/to/folder # Create nested folders
```

---

#### mv - Move/Rename

**Usage:**
```bash
mv oldname.txt newname.txt    # Rename file
mv file.txt /path/to/folder/  # Move file
mv *.txt folder/              # Move all .txt files
```

---

#### rm - Remove

**Usage:**
```bash
rm file.txt           # Delete file
rm -r foldername      # Delete folder and contents (recursive)
rm -f file.txt        # Force delete (no confirmation)
rm -rf foldername     # Force delete folder (DANGEROUS!)
```

**⚠️ WARNING:** `rm` is permanent - no recycle bin!

---

## Networking & Web

### Domain Name Structure

**Example:** `banana.fruit.bozo.click`

**Breaking it down (right to left):**

1. **`.click`** = **Top Level Domain (TLD)**
   - Examples: .com, .org, .edu, .net, .click
   - Rightmost part of domain

2. **`bozo.click`** = **Root Domain** (apex domain)
   - The main domain you register
   - Consists of: name + TLD

3. **`fruit.bozo.click`** = **Subdomain**
   - Subdivision of root domain
   - Can create unlimited subdomains

4. **`banana.fruit.bozo.click`** = **Subdomain of subdomain**
   - Subdomain can have subdomains
   - Can nest as deep as needed

**Structure Formula:**
```
subdomain.subdomain.rootdomain.TLD
```

**More Examples:**
- `www.google.com` - www = subdomain, google = root, com = TLD
- `mail.google.com` - mail = subdomain
- `docs.google.com` - docs = subdomain
- `api.v2.example.com` - api.v2 = nested subdomain

---

### HTTPS and Web Certificates

**Question:** Is a web certificate necessary to use HTTPS?
**Answer:** **YES**

**HTTP vs HTTPS:**

| Protocol | Port | Encryption | Certificate |
|----------|------|------------|-------------|
| HTTP | 80 | None | Not needed |
| HTTPS | 443 | SSL/TLS | Required |

**What is a Web Certificate?**
- Digital certificate issued by Certificate Authority (CA)
- Validates server identity
- Enables encrypted communication
- Browser shows padlock icon 🔒

**Why Certificate is Necessary:**
- HTTPS = HTTP + SSL/TLS encryption
- Encryption requires certificate
- Certificate contains public key
- Without certificate, cannot establish secure connection

**What Certificate Contains:**
- Domain name
- Organization details
- Public key
- Expiration date
- Certificate Authority signature

---

### DNS A Record

**Question:** Can a DNS A record point to an IP address or another A record?
**Answer:** **A record points to an IP ADDRESS only**

**DNS Record Types:**

| Type | Points To | Example |
|------|-----------|---------|
| **A** | IPv4 address | example.com → 192.168.1.1 |
| **AAAA** | IPv6 address | example.com → 2001:0db8::1 |
| **CNAME** | Another domain name | www → example.com |
| **MX** | Mail server | mail.example.com |
| **TXT** | Text information | Verification codes |
| **NS** | Name server | ns1.example.com |

**A Record Example:**
```
example.com.  3600  IN  A  93.184.216.34
```
- `example.com` = domain
- `3600` = TTL (Time To Live in seconds)
- `IN` = Internet class
- `A` = record type
- `93.184.216.34` = IPv4 address

**Key Point:** If you want to point one domain to another domain, use **CNAME**, not A record.

---

### Port Numbers and Protocols

**Standard Ports to Memorize:**

| Port | Protocol | Purpose | Encrypted? |
|------|----------|---------|------------|
| **80** | HTTP | Web traffic | ❌ No |
| **443** | HTTPS | Secure web traffic | ✅ Yes |
| **22** | SSH | Secure shell (remote access) | ✅ Yes |
| 21 | FTP | File transfer | ❌ No |
| 25 | SMTP | Sending email | ❌ No |
| 53 | DNS | Domain name resolution | ❌ No |
| 3306 | MySQL | MySQL database | ❌ No |
| 5432 | PostgreSQL | PostgreSQL database | ❌ No |

**Key Points:**
- Port 80 = HTTP (unencrypted)
- Port 443 = HTTPS (encrypted with SSL/TLS)
- Port 22 = SSH (secure remote access)

**URL Examples:**
```
http://example.com        → Port 80 (default)
https://example.com       → Port 443 (default)
http://example.com:8080   → Port 8080 (explicit)
```

---

## Asynchronous JavaScript

### Promises

**Definition:** Object representing eventual completion (or failure) of asynchronous operation

**Three States:**
1. **Pending** - Initial state, neither fulfilled nor rejected
2. **Fulfilled** - Operation completed successfully
3. **Rejected** - Operation failed

---

### Creating a Promise

**Basic Syntax:**
```javascript
const myPromise = new Promise((resolve, reject) => {
  // Asynchronous operation
  if (success) {
    resolve('Success value');
  } else {
    reject('Error message');
  }
});
```

**Example:**
```javascript
const fetchData = new Promise((resolve, reject) => {
  setTimeout(() => {
    const data = { name: 'John', age: 25 };
    resolve(data);
  }, 1000);
});
```

---

### Using Promises

**Syntax:**
```javascript
promise
  .then(result => {
    // Handle success
    console.log(result);
  })
  .catch(error => {
    // Handle error
    console.log(error);
  })
  .finally(() => {
    // Always runs (optional)
    console.log('Done');
  });
```

**Example:**
```javascript
fetchData
  .then(data => {
    console.log(data.name); // "John"
    return data.age;
  })
  .then(age => {
    console.log(age); // 25
  })
  .catch(error => {
    console.log('Error:', error);
  });
```

---

### Promise Chaining

**Example:**
```javascript
Promise.resolve(5)
  .then(x => x * 2)      // 10
  .then(x => x + 3)      // 13
  .then(x => x / 2)      // 6.5
  .then(x => console.log(x)); // Output: 6.5
```

**Key Points:**
- Each `.then()` returns a new promise
- Return value becomes input to next `.then()`
- Chain can be as long as needed

---

### Promise Execution Order

**CRITICAL CONCEPT:** Promises are asynchronous

**Example:**
```javascript
console.log('1');

Promise.resolve().then(() => {
  console.log('2');
});

console.log('3');

// Output:
// 1
// 3
// 2
```

**Why this order?**
1. `console.log('1')` - runs immediately (synchronous)
2. `Promise.resolve().then()` - callback goes to **microtask queue**
3. `console.log('3')` - runs immediately (synchronous)
4. After synchronous code finishes, microtasks run
5. `console.log('2')` - runs from microtask queue

**Rule:** Synchronous code ALWAYS runs before Promise callbacks

---

### Common Promise Patterns

#### Pattern 1: Simple Promise
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => resolve('Done!'), 1000);
});

promise.then(result => console.log(result));
// Output (after 1 second): Done!
```

#### Pattern 2: Promise with Error
```javascript
const promise = new Promise((resolve, reject) => {
  const success = false;
  if (success) {
    resolve('Success!');
  } else {
    reject('Failed!');
  }
});

promise
  .then(result => console.log(result))
  .catch(error => console.log(error));
// Output: Failed!
```

#### Pattern 3: Chained Operations
```javascript
fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

---

### Promise Methods

#### Promise.resolve()
**Creates immediately resolved promise**
```javascript
Promise.resolve(42)
  .then(value => console.log(value)); // 42
```

#### Promise.reject()
**Creates immediately rejected promise**
```javascript
Promise.reject('Error!')
  .catch(error => console.log(error)); // Error!
```

#### Promise.all()
**Wait for all promises to resolve**
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(results => console.log(results)); // [1, 2, 3]
```
- If ANY promise rejects, entire thing rejects

#### Promise.race()
**Returns first promise to settle**
```javascript
const p1 = new Promise(resolve => setTimeout(() => resolve('slow'), 100));
const p2 = new Promise(resolve => setTimeout(() => resolve('fast'), 50));

Promise.race([p1, p2])
  .then(result => console.log(result)); // 'fast'
```

---

### Async/Await (Alternative Syntax)

**Converting Promises to Async/Await:**

**Promise Style:**
```javascript
function getData() {
  return fetch('https://api.example.com')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
}
```

**Async/Await Style:**
```javascript
async function getData() {
  try {
    const response = await fetch('https://api.example.com');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

**Key Points:**
- `async` keyword before function
- `await` keyword before promise
- `try/catch` for error handling
- Makes async code look synchronous

---

## Quick Reference Cheat Sheet

### HTML Quick Reference
```
<!DOCTYPE html>                  Declare HTML5
<link rel="stylesheet" href="">  Link CSS file
<div>                           Block container
<span>                          Inline container (default: inline)
<a href=""><img src=""></a>     Image with link
<script src=""></script>        Include JavaScript
```

### CSS Quick Reference
```
#id          Select by ID (unique)
.class       Select by class (multiple)
element      Select by tag name

Box Model (inside → out): Content → Padding → Border → Margin

display: block        Full width, new line
display: inline       No new line, width as needed
display: flex         Flexible layout
```

### CSS Selectors Priority
```
1. Inline styles (highest)
2. IDs (#id)
3. Classes (.class), attributes, pseudo-classes
4. Elements (div, p, span)
```

### JavaScript Quick Reference
```javascript
// Arrow functions
const func = (x) => x * 2;

// Array map
[1, 2, 3].map(x => x * 2) // [2, 4, 6]

// Objects
const obj = { key: "value" };
obj.newKey = "new"; // Can add properties

// JSON
JSON.stringify(obj)  // Object → String
JSON.parse(string)   // String → Object
```

### DOM Quick Reference
```javascript
// Select elements
document.getElementById('id')
document.querySelector('.class')
document.querySelectorAll('.class')

// Modify elements
element.textContent = 'text'
element.style.color = 'red'
element.classList.add('class')

// Events
element.addEventListener('click', () => {})
```

### Command Line Quick Reference
```bash
ssh user@host    Remote shell session
ls -la           List all files with details
pwd              Show current directory
cd path          Change directory
mkdir name       Create directory
mv old new       Move/rename
rm file          Delete file
```

### Networking Quick Reference
```
Domain: subdomain.root.TLD
  - .com, .org, etc = TLD
  - example.com = root domain
  - www.example.com = subdomain

Ports:
  - 80  = HTTP (unencrypted)
  - 443 = HTTPS (encrypted, needs certificate)
  - 22  = SSH (secure shell)

DNS A Record → IP Address (not another domain)
HTTPS requires web certificate (YES)
```

### Promise Quick Reference
```javascript
// Create promise
new Promise((resolve, reject) => {
  if (success) resolve(value);
  else reject(error);
});

// Use promise
promise
  .then(result => {})
  .catch(error => {})
  .finally(() => {});

// Execution order
Synchronous code runs first
Promise callbacks run after (microtask queue)
```

---

## Common Exam Traps & Tips

### HTML/CSS Traps
❌ Forgetting `<!DOCTYPE html>` is first line
❌ Using `id` instead of `class` for multiple elements
❌ Confusing padding (inside) with margin (outside)
❌ Wrong box model order
✅ Remember: Content → Padding → Border → Margin

### JavaScript Traps
❌ Forgetting `const`/`let`/`var` in declarations
❌ Using `=` (assignment) instead of `===` (comparison)
❌ Forgetting `return` in functions
❌ Not understanding map creates NEW array
✅ Arrow functions: `x => x * 2` for implicit return

### DOM Traps
❌ Forgetting `#` with querySelector for IDs
❌ Using `getElementById('#id')` - no # needed!
❌ Confusing `textContent` vs `innerHTML`
❌ Not checking if element exists before manipulating
✅ Always select element before modifying

### Promise Traps
❌ Thinking promises run synchronously
❌ Forgetting synchronous code runs first
❌ Not handling errors with `.catch()`
✅ Remember: sync code → then microtasks (promises)

### Command Line Traps
❌ Confusing `ssh` with other commands
❌ Not knowing `-la` means "list all with details"
❌ Forgetting `rm` is permanent (no undo!)
✅ ssh = remote shell, ls -la = all files detailed

### Networking Traps
❌ Thinking A record points to domains (it's IP addresses!)
❌ Confusing TLD with subdomain
❌ Not knowing HTTPS requires certificate
❌ Mixing up port numbers
✅ 80=HTTP, 443=HTTPS, 22=SSH

---

## Practice Question Patterns

### Pattern Recognition Tips

**When you see HTML with class/id:**
→ Think about CSS selectors (. vs #)

**When you see padding/margin:**
→ Think inside vs outside

**When you see array.map():**
→ New array, same length, transformed values

**When you see Promise code:**
→ Check execution order (sync first, then async)

**When you see getElementById:**
→ No # symbol needed in the parameter

**When you see querySelector:**
→ Use # for id, . for class

**When you see domain name:**
→ Read right to left: TLD → root → subdomain

**When you see port number:**
→ 80=HTTP, 443=HTTPS, 22=SSH

**When you see ls -la:**
→ All files including hidden, with details

**When you see box model:**
→ Inside to out: Content → Padding → Border → Margin

---

## Study Strategy

### Before the Exam:
1. ✅ Review each section of these notes
2. ✅ Write out common syntax from memory
3. ✅ Quiz yourself on key differences (# vs ., padding vs margin)
4. ✅ Practice execution order with Promise examples
5. ✅ Memorize port numbers (80, 443, 22)
6. ✅ Memorize box model order
7. ✅ Review command line commands and what they do

### During the Exam:
1. Read each question carefully
2. Eliminate obviously wrong answers first
3. Look for keywords:
   - "ID" → think #
   - "class" → think .
   - "inside" → think padding
   - "outside" → think margin
   - "remote" → think SSH
   - "secure" → think HTTPS/443 or SSH/22
4. For code execution questions, trace through line by line
5. For Promise questions, identify sync vs async code first

### Memory Tricks:

**Box Model:** "**C**an **P**andas **B**e **M**ean?" = Content, Padding, Border, Margin

**Ports:** "**8**0 is **H**TTP, **4**43 is **HTTPS** (4 letters), **22** is **S**SH"

**Selectors:** "**#** looks like number = **one** ID", "**.** looks like multiple points = **many** classes"

**Padding vs Margin:** "**P**adding **P**ushes in, **M**argin **M**akes space out"

**Domain:** "Read domains backwards: **.com** came first (TLD), then **example**, then **www**"

**Promises:** "**S**ync **B**efore **A**sync" (Synchronous Before Asynchronous)

---

## Final Checklist

Before exam, make sure you can answer:

### HTML
- [ ] What does `<link>` do?
- [ ] What does `<div>` do?
- [ ] How to declare HTML5 document?
- [ ] What are the heading tags (h1, h2, h3)?
- [ ] How to create image with hyperlink?
- [ ] How to include JavaScript in HTML?

### CSS
- [ ] Difference between # and . selectors?
- [ ] Difference between padding and margin?
- [ ] Box model order (inside to outside)?
- [ ] What is default display for `<span>`?
- [ ] How to select all divs and change their background?
- [ ] How does flexbox work?

### JavaScript
- [ ] Arrow function syntax?
- [ ] What does array.map() do?
- [ ] How to create an object?
- [ ] Can you add properties to objects?
- [ ] What is valid JSON?
- [ ] Syntax for if/else, for, while, switch?

### DOM
- [ ] What is the DOM?
- [ ] How to use getElementById?
- [ ] How to use querySelector with # selector?
- [ ] How to use addEventListener?
- [ ] How to change element text color?
- [ ] How to change specific element's text?

### Command Line
- [ ] What does each command do (chmod, pwd, cd, ls, vim, etc.)?
- [ ] Which command creates remote shell session?
- [ ] What does ls -la show?

### Networking
- [ ] In a domain name, which is TLD, root, subdomain?
- [ ] Is certificate necessary for HTTPS?
- [ ] Can A record point to another A record?
- [ ] Which ports for HTTP, HTTPS, SSH?

### Promises
- [ ] What will Promise code output?
- [ ] Synchronous vs asynchronous execution order?
- [ ] How to use .then() and .catch()?

---

**Good luck on your exam! 🎓**

Remember: These notes cover everything you need. Take your time, read questions carefully, and trust your preparation!