import type { LoadContext, Plugin } from "@docusaurus/types"
import axios, { AxiosRequestConfig } from "axios"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { sync as delFile } from "rimraf"
import chalk from "chalk"
import milli from "pretty-ms"

/**
 * The plugin's options.
 */
export interface RemoteContentPluginOptions {
    /**
     * Delete local content after everything?
     */
    performCleanup?: boolean

    /**
     * CLI only mode.
     */
    noRuntimeDownloads?: boolean

    /**
     * The base URL for the source of the content.
     */
    sourceBaseUrl: string

    /**
     * The name you want to give to the data. Used by the CLI, and *must* be path safe.
     */
    name: string

    /**
     * The base output directory (e.g. "docs" or "blog").
     */
    outDir: string

    /**
     * Specify the document paths from the sourceBaseUrl
     * in a string array or function that returns a string array.
     */
    documents: string[] | Promise<string[]> | (() => string[])

    /**
     * Additional options for Axios.
     *
     * @see https://axios-http.com/docs/req_config
     */
    requestConfig?: Partial<AxiosRequestConfig>
}

type LoadableContent = void

export interface Collectable {
    url: string
    identifier: string
}

export default function pluginRemoteContent(
    context: LoadContext,
    options: RemoteContentPluginOptions
): Plugin<LoadableContent> {
    let {
        name,
        sourceBaseUrl,
        outDir,
        documents,
        noRuntimeDownloads = false,
        performCleanup = true,
        requestConfig = {},
    } = options

    if (!name) {
        throw new Error(
            "I need a name to work with! Please make sure it is path-safe."
        )
    }

    if (!outDir) {
        throw new Error(
            "No output directory specified! Please specify one in your docusaurus-plugin-remote-content config (e.g. to download to the 'docs' folder, set outDir to docs.)"
        )
    }

    if (!documents) {
        throw new Error(
            "The documents field is undefined, so I don't know what to fetch! It should be a string array, function that returns a string array, or promise that resolves with a string array."
        )
    }

    if (!sourceBaseUrl) {
        throw new Error(
            "The sourceBaseUrl field is undefined, so I don't know where to fetch from!"
        )
    }

    if (!sourceBaseUrl.endsWith("/")) {
        sourceBaseUrl = `${sourceBaseUrl}/`
    }

    async function findCollectables(): Promise<Collectable[]> {
        const a: Collectable[] = []

        const resolvedDocs =
            typeof documents === "function"
                ? documents()
                : ((await documents) as string[])

        for (const d of resolvedDocs) {
            a.push({ url: `${sourceBaseUrl}/${d}`, identifier: d })
        }

        return a
    }

    async function getTargetDirectory(): Promise<string> {
        const returnValue = join(context.siteDir, outDir)

        if (!existsSync(returnValue)) {
            mkdirSync(returnValue, { recursive: true })
        }

        return returnValue
    }

    async function fetchContent(): Promise<void> {
        const c = await findCollectables()

        for (const { identifier, url } of c) {
            const checkIdent = identifier.split("/").filter((seg) => seg !== "")
            checkIdent.pop()

            // if we are outputting to a subdirectory, and
            if (checkIdent.length > 0) {
                mkdirSync(
                    join(await getTargetDirectory(), checkIdent.join("/")),
                    { recursive: true }
                )
            }

            writeFileSync(
                join(await getTargetDirectory(), identifier),
                (await axios({ url, ...requestConfig })).data
            )
        }
    }

    async function cleanContent(): Promise<void> {
        const c = await findCollectables()

        for (const { identifier } of c) {
            delFile(join(await getTargetDirectory(), identifier))
        }
    }

    return {
        name: `docusaurus-plugin-remote-content-${name}`,

        async loadContent(): Promise<LoadableContent> {
            if (!noRuntimeDownloads) {
                return await fetchContent()
            }
        },

        async postBuild(): Promise<void> {
            if (performCleanup !== false) {
                return await cleanContent()
            }
        },

        extendCli(cli): void {
            cli.command(`download-remote-${name}`)
                .description(`Downloads the remote ${name} data.`)
                .action(async () => {
                    const startTime = new Date()
                    await fetchContent()
                    console.log(
                        chalk`{green Successfully fetched content in} {white ${milli(
                            (new Date() as any) - (startTime as any)
                        )}}{green !}`
                    )
                })

            cli.command(`clear-remote-${name}`)
                .description(
                    `Removes the local copy of the remote ${name} data.`
                )
                .action(async () => {
                    const startTime = new Date()
                    await cleanContent()
                    console.log(
                        chalk`{green Successfully deleted content in} {white ${milli(
                            (new Date() as any) - (startTime as any)
                        )}}{green !}`
                    )
                })
        },
    }
}
