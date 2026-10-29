<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All 61 admin navigation destinations come from the single registry in `src/lib/nav-registry.ts`; sidebar, breadcrumbs, titles and the `/$group/$page` route read from it so paths never drift.
- The app is frontend-only (browser-local data, no backend) per the project brief; never present simulated actions as real.
