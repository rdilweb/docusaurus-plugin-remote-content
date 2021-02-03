# template-docusaurus-plugin

A Docusaurus plugin template.

## Alright, how do I use this?

It isn't really that hard. Follow these simple steps!:

1. Make a new repository using this template.
2. Clone that repository locally using your IDE of choice.
3. Edit `src/index.ts`.
4. Run `yarn build`.
5. Open a second terminal, and make the working directory the `testsite`.
6. Start the test site.
7. You now have the test site running your plugin.

When you update the plugin, in order to preview your changes on the test site, you need to:

1. Use the first shell you opened to re-run `yarn build` (in the repository's _root_ directory).
2. In the second shell, `Control+C` (or `Command+C` on macOS) the running Docusaurus dev server, and re-run `yarn start`.
