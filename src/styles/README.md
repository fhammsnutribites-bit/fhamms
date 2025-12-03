# CSS Structure - BEM Methodology

This project follows BEM (Block Element Modifier) naming convention for CSS.

## Directory Structure

```
styles/
├── components/          # Component-specific CSS
│   ├── navbar.css
│   └── footer.css
├── pages/              # Page-specific CSS
│   ├── home.css
│   ├── products.css
│   ├── product-detail.css
│   ├── cart.css
│   ├── orders.css
│   ├── order-detail.css
│   ├── account.css
│   ├── login.css
│   ├── register.css
│   └── checkout.css
└── global.css          # Global styles and utilities
```

## BEM Naming Convention

- **Block**: Standalone component (e.g., `.navbar`, `.products`)
- **Element**: Part of a block (e.g., `.navbar__logo`, `.products__card`)
- **Modifier**: Variation of a block/element (e.g., `.navbar__nav-link--active`, `.products__category-button--active`)

## Usage Example

```css
/* Block */
.products { }

/* Element */
.products__card { }
.products__card-image { }

/* Modifier */
.products__card--featured { }
.products__category-button--active { }
```

## Responsive Breakpoints

- Mobile: `max-width: 480px`
- Tablet: `max-width: 768px`
- Desktop: `> 768px`

