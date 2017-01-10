*Web Components and Progessive Enhancement*

- Favour CSS enhancements over JS ones
- Use HTML building blocks
-- content structure
-- forms
-- links
-- buttons (any use case without JS?)
-- accessibility

- JS adds:
-- pure enhancements (usually cosmetic and ease of use, not adding anything new)
-- new functionailty

- Build the site without JS (and CSS?) first, using placeholder web component elements where the added functionality will be added (don't use JS at all)
- Don't attempt to build same functionality with JS disabled, just the basic purpose of the site
-- Progressive enhancement
--- CSS - look and feel
--- JS (enhancements or new functionality)
---- web components


- single page apps??

- An is component enhances a currently available component
- An is component should always work at a basic level without JS (generally asthetic enhancements) - e.g. rippling button
- A non-is component should provide a basic functionality not available with standard components
- A non-is component can be of two types
-- Provides functionality that shouldn't be displayed without JS (but the site should probably still work without it) - e.g. video capture
-- Provides functionality that does work with JS enabled - e.g. gallery
--- Uses slots to contain components
---
- Build complex functionality with nested components

- If a components can't be rendered without JS:
-- Define styles in shadow DOM only
-- Provide styling hooks
-- Hide component content in page CSS (make visible on JS available)

- If a component can be rendered without JS:
--
