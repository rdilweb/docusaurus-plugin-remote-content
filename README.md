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
You can also use `docusaurus clear-remote-X` to remove the downloaded files.

## Alright, so how do I use this???

Okay. Assuming you want to use constant sync, follow these steps:

1. In your `docusaurus.config.js`, if you don't already, create a plugin array, and add this plugin. For example:

```javascript
module.exports = {
  // ...
  plugins: [
    [
      "docusaurus-plugin-remote-content",
      {
        // options here
      },
    ],
  ],
}
```

2. Configure the plugin - see the list of options below.

## Options

- `sourceBaseUrl`: (_required_) `string` - The base URL that your remote docs are located.
  All the IDs specified in the `documents` option will be resolved relative to this.
  For example, if you have 2 docs located at https://example.com/content/hello.md and https://example.com/content/thing.md,
  the `sourceBaseUrl` would need to be set to https://example.com/content/
- `documents`: (_required_) `string array or a function that returns a string array` - The documents to fetch.
  Following the previous example, if you had set `sourceBaseUrl` to https://example.com/content/,
  and wanted to fetch thing.md and hello.md, you would just set `documents` to `["hello", "thing"]`
- `blogIntegration`: (optional) `boolean` - If the documents specified should be downloaded to the blog directory.
- `docsIntegration`: (optional) `boolean` - If the documents specified should be downloaded to the docs directory.
- `performCleanup`: (optional) `boolean` - If the documents downloaded should be deleted after the build is completed. Defaults to true.
- `noRuntimeDownloads`: (optional) `boolean` - If you only want to use the CLI to download the remote content, you should change this to true.
- `outputDirectory`: (optional) `string` - The subfolder to emit the downloaded content to (e.g. `docs/<subfolder>/<downloaded file.md>` - the prefix is set based on if you have the docs or blog integrations active).

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
2. In the second shell, `Control+C` the running Docusaurus dev server, and re-run `yarn start`.
