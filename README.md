# CIDR Studio

A small, visual IPv4 inventory and subnet planner. No backend, packages, API keys or build step.

## What it does

- Set a parent IPv4 network.
- Enter existing reserved subnets individually or paste `CIDR, Name` lines.
- Explore a zoomable address-space map with equal-size CIDR tiles, breadcrumbs and overview navigation.
- See total IP addresses, unallocated addresses, reserved addresses and tracked occupied host IPs in each view.
- Compare total and completely free block counts for every prefix from the current network through /32. Counts describe alternative subdivisions and must not be added together.
- Change tile size (up to 256 blocks at once), inspect reserved host IPs, or reserve a free view.
- Track occupied host IPs inside each reserved subnet, by pasting a list or clicking the address grid.
- See exact free host ranges and browse address grids in 256-address pages.
- Request a new subnet by prefix or usable host count.
- Get a free, aligned suggestion, or a clear message if no suitable contiguous block exists.
- Save automatically in the current browser; export/import JSON backups, export CSV, and undo changes.

All interface text is English. Use **Load example** to explore a fictional network.

## Two levels of availability

A reserved subnet occupies its entire CIDR in the parent network, even if it has no tracked occupied IPs. Free IPs inside it remain part of that reservation; they are not candidates for another subnet. The subnet finder searches only unallocated parent-network space.

IP occupancy is a manual inventory, not a live network scan. No entered plan is sent to a server. Each browser keeps its own local plan; this is not a shared multi-user IPAM database. Export JSON before changing browsers or clearing local storage. Data from the older split-only planner is not automatically interpreted as reservations.

## Allocation rules

- Reserved subnets must be aligned, contained by the parent, and non-overlapping.
- Subnet recommendations choose the smallest fitting free CIDR block, breaking ties by lowest network address. This preserves larger blocks where possible.
- Total free space alone is insufficient: a valid aligned contiguous block must exist.
- Prefix requests support /0 through /32.
- Host-count requests use one /32 for one host, otherwise traditional IPv4 sizing with network and broadcast excluded. Request /31 explicitly for point-to-point use.
- /31 allows both addresses; /32 allows its single address. Other subnets exclude network and broadcast from host tracking.
- Cloud-provider-specific reserved addresses are not modeled.
- Maximum 1,000 subnet reservations, 10,000 tracked IPs per subnet, 5 MB imported JSON. Browser storage quotas may be lower; export JSON if local saving is unavailable.

## Run locally

Open `dist/index.html` in a modern browser. For a stable browser origin and local storage, serve it:

```bash
python3 -m http.server 8080 --directory dist
```

Then open `http://localhost:8080`.

## Test

Node.js 22 is used in CI. No npm install is required.

```bash
node --check dist/app.js
node --test tests/network.test.cjs
```

Tests cover IPv4 boundaries, /0, /31, /32, containment, overlapping reservations, host validation, fragmented free space and randomized comparisons against an exhaustive allocation oracle.

## Publish with GitHub Pages

1. Create a GitHub repository (suggested name: `cidr-studio`) with a `main` branch. Initialize it with a README if an assistant will upload the files through the GitHub connector.
2. Upload this project's files, including `.github/workflows/pages.yml`.
3. In the repository, select **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Push to `main`, or select **Actions → Test and deploy CIDR Studio → Run workflow** after enabling Pages.
5. Use the URL returned by the completed deployment. A workflow file alone does not mean the site is deployed.

GitHub Free supports Pages from public repositories. Private-repository Pages availability depends on the GitHub plan. The application itself requires only static hosting.

Official setup: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Project layout

- `dist/index.html` — interface
- `dist/style.css` — responsive styling
- `dist/network.js` — pure IPv4 arithmetic and validation
- `dist/app.js` — local state and interactions
- `dist/zoom.js` — drill-down map and subnet capacity cards
- `tests/network.test.cjs` — allocation tests
- `.github/workflows/pages.yml` — test and static deployment workflow

## Verification status

The calculation tests and JavaScript syntax checks pass locally. Browser-based visual QA and the GitHub Pages deployment have not been run in this environment.
