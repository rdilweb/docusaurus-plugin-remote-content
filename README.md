# docusaurus-plugin-remote-content

A Docusaurus plugin that downloads content from remote sources.

With this plugin, you can write the Markdown for your content somewhere else, and use them on your Docusaurus site, without copying and pasting.

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
(and when it stops, the local copy of the content is deleted - this is configurable).

### CLI Sync

This is the secondary mode. You can use the Docusaurus CLI to update the content when needed.
All you need to do is run `docusaurus download-remote-X`, where X is the `name` option given to the plugin.
You can also use `docusaurus clear-remote-X` to remove the downloaded files.

To enable CLI Sync set `noRuntimeDownloads: true` in the options.

## Alright, so how do I use this??

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
                name: "some-content", // used by CLI, must be path safe
                sourceBaseUrl: "https://my-site.com/content/", // the base url for the markdown (gets prepended to all of the documents when fetching)
                outDir: "docs", // the base directory to output to.
                documents: ["my-file.md", "README.md"], // the file names to download
            },
        ],
    ],
}
```

2. Configure the plugin - see the list of options below.

## Options

### `name`

(_Required_) `string`

The name of this plugin instance. Set to `content` if you aren't sure what this does. (used by CLI)

### `sourceBaseUrl`

(_Required_) `string`

The base URL that your remote docs are located.
All the IDs specified in the `documents` option will be resolved relative to this.
For example, if you have 2 docs located at https://example.com/content/hello.md and https://example.com/content/thing.md,
the `sourceBaseUrl` would need to be set to https://example.com/content/.

### `outDir`

(_Required_) `string`

The folder to emit the downloaded content to.

### `documents`

(_Required_) `string[]` or `Promise<string[]>`

The documents to fetch. Must be file names (e.g. end in `.md`)
Following the previous example, if you had set `sourceBaseUrl` to https://example.com/content/,
and wanted to fetch thing.md and hello.md, you would just set `documents` to `["hello.md", "thing.md"]`

### `performCleanup`

(Optional) `boolean` - default = `true`

If the documents downloaded should be deleted after the build is completed. Defaults to true.

### `noRuntimeDownloads`

(Optional) `boolean` - default = `false`

If you only want to use the Docusaurus CLI to download the remote content, you should change this to true.

### `requestConfig`

(optional) [`AxiosRequestConfig`](https://axios-http.com/docs/req_config)

Additional configuration options for the network requests that fetch the content.
See the documentation for details: https://axios-http.com/docs/req_config

### `modifyContent`

(optional) `(filename: string, content: string) => { filename?: string, content?: string }}`

This option accepts a function that gets the name of the output file and the content of it as a string,
and can return a modified version of either. The return value must be either undefined (which means "skip modifying this thing"),
or an object containing the keys `filename` and/or `content`, containing the values you want to use.

For example, this would add front matter to files that have the word "README" in their names:

```js
// in the plugin's options:
modifyContent(filename, content) {
    if (filename.includes("README")) {
        return {
            content: `---
description: We are now adding a front matter field to any README files!
---

${content}`, // <-- this last part adds in the rest of the content, which would otherwise be discarded
        }
    }

    // we don't want to modify this item, since it doesn't contain "README" in the name
    return undefined
},
```

## Fetching Images
To fetch images you need to have 2 instances of the plugin - 1 for markdown, and the other for images. With the images one, you would add `requestConfig: { responseType: "arraybuffer" }`

### Example
```javascript
module.exports = {
    // ...
    plugins: [
        [
            "docusaurus-plugin-remote-content",
            {
                // options here
                name: "markdown-content", // used by CLI, must be path safe
                sourceBaseUrl: "https://my-site.com/content/", // the base url for the markdown (gets prepended to all of the documents when fetching)
                outDir: "docs", // the base directory to output to.
                documents: ["my-file.md", "README.md"], // the file names to download
            },
        ],
        [
            "docusaurus-plugin-remote-content",
            {
                // options here
                name: "images-content", // used by CLI, must be path safe
                sourceBaseUrl: "https://my-site.com/content/", // the base url for the markdown (gets prepended to all of the documents when fetching)
                outDir: "docs", // the base directory to output to.
                documents: ["my-image.png", "cool.gif"], // the file names to download
                requestConfig: { responseType: "arraybuffer" }
            },
        ],
    ],
}
```


## Contributing

It isn't really that hard. Follow these simple steps!:

1. Clone a fork of this repository locally using your IDE of choice.
2. Edit the source.
3. Run `yarn build`.
4. Start the test site (`yarn testsite:start`).
5. You now have the test site running the plugin.

When you update the plugin, in order to preview your changes on the test site, you need to:

1. Quit the dev server.
2. Make your changes.
3. Rerun `yarn build`.
4. Restart the test site (`yarn testsite:start`).
