# Snip design language

A dark, quiet interface with a warm creative glow. Use generous spacing, high contrast, and restrained borders so the URL form remains the visual focus.

## Tokens

- **Background:** `#0c0c0f`; elevated surface `#151519`; raised surface `#1b1b20`
- **Text:** `#f7f4ef`; muted `#a09da5`; faint `#6f6c75`
- **Accent:** coral `#ff806d`, pink `#f45f9a`, orange `#ffb36b`; gradient `linear-gradient(110deg, #ff806d, #f45f9a 52%, #ffb36b)`
- **Font:** `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- **Type:** hero `clamp(2.8rem, 8vw, 6.5rem)`, section `2rem`, body `0.95rem`, label `0.7rem` uppercase
- **Spacing:** 8px base; page gutters `24px`; section gaps `48px`; hero breathing room `96px`
- **Radii:** input `18px` (pill-like), cards `14px`, small controls `10px`
- **Borders:** `1px solid rgba(255, 255, 255, 0.1)`; dividers `rgba(255, 255, 255, 0.07)`
- **Shadows/glow:** `0 24px 70px rgba(0, 0, 0, 0.34)`; warm glow `0 0 100px rgba(255, 111, 126, 0.2)`

## Snip mapping

- **Page header:** centered hero with eyebrow, bold headline, and muted subline over the warm full-width glow.
- **URL form:** the centerpiece chat-style pill; input fills the surface and the gradient action is attached on the right.
- **Result/error notices:** compact raised surfaces with green success or coral error accents.
- **Links table:** a single bordered, rounded surface below the hero; muted headers and bright short-link accents keep it scannable.
