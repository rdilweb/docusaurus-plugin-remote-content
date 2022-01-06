# Changelog

## v2.1.0 - 1/6/2022

Features:

-   Added the ability to customize the Axios request configuration (fixes #26).
-   Replaced `chalk` with `picocolors`, which has a smaller install size and faster API.
-   Improved the readability of the options section in the readme.
-   Reduced install size by excluding TypeScript build metadata.

Bug fixes:

-   Removed the optional marker from the type of the `documents` option.

## v2.0.0 - 12/02/2021

Breaking changes:

-   `docsIntegration` and `blogIntegration` have been removed in favor of just setting `outDir` (which is a lot more flexible).
-   `outputDirectory` has been renamed to `outDir`.
-   `name` is now a required option (dictates CLI command name).
-   Documents now must have proper file extensions, `.md` is no longer added by default.

Other changes:

-   Switch to yarn v3.1.1.
-   Updated dependencies.
-   Updated code style to use 4 spaces instead of 2.
-   Bug fix: documents with subdirectories in their paths will now automatically ensure the subdirectories are created (reported by @fill-the-fill).

## v1.2.0 - 8/10/2021

-   Update Axios to prevent security warnings
-   Require Node.js v12
-   Added `outputDirectory` option to control which folder the downloaded content is put in
-   Updated TypeScript compiler target to reduce polyfill bloat

## v1.1.0 - 2/3/2021

-   Internal refactoring to simplify code
-   Add more documentation and metadata
-   Throw an error if both integrations are enabled at the same time
