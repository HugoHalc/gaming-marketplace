# Mobile Menu Safari Portal Hotfix

Root cause:
The mobile fixed drawer was rendered inside the sticky header, which uses backdrop-filter/backdrop-blur. Mobile Safari can treat that ancestor as a containing block for fixed descendants, clipping the drawer to the header area.

Fix:
- render overlay/drawer with React `createPortal(..., document.body)`
- use `h-[100dvh]`
- lock both html and body scrolling while open
- preserve the existing BoostingPedia mobile menu design and content
