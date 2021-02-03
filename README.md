# docusaurus-plugin-remote-content

A Docusaurus v2 plugin that downloads content from remote sources.

With this plugin, you can write the Markdown for your **docs** and **blog** somewhere else, and use them on your Docusaurus site.

## Installing

Run this in a terminal:

```bash
yarn add docusaurus-plugin-remote-content
```

## Choosing a Mode

This plugin has 2 modes, and you can choose which to use depending on your needs.

### Constant Sync

This is the default mode.
You will want to gitignore the docs/blog directory that the plugin downloads content to,
as every time you run `docusaurus build` or `docusaurus start`, the content is downloaded,
(and optionally but enabled by default, when it stops, the local copy of the content is deleted).

### CLI Sync

This is the secondary mode. You can use the Docusaurus CLI to update the content when needed.
All you need to do is run `docusaurus download-remote-X`, where X is either `blog` or `docs`.

## Contributing

It isn't really that hard. Follow these simple steps!:

1. Clone a fork of this repository locally using your IDE of choice.
2. Edit the source.
3. Run `yarn build`.
4. Open a second terminal, and make the working directory the `testsite`.
5. Start the test site (`yarn start`).
6. You now have the test site running the plugin.

When you update the plugin, in order to preview your changes on the test site, you need to:

1. Use the first shell you opened to re-run `yarn build` (in the repository's _root_ directory).
2. In the second shell, `Control+C` (or `Command+C` on macOS) the running Docusaurus dev server, and re-run `yarn start`.
