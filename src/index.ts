import type { LoadContext, Plugin } from "@docusaurus/types"
import axios from "axios"
import { existsSync, writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { sync as delFile } from "rimraf"
import { timeIt } from "./utils"
import { Fetchable, RemoteContentPluginOptions } from "./types"

// noinspection JSUnusedGlobalSymbols
export default async function pluginRemoteContent(
    context: LoadContext,
    options: RemoteContentPluginOptions
): Promise<Plugin<void>> {
    let {
        name,
        sourceBaseUrl,
        outDir,
        documents,
        noRuntimeDownloads = false,
        performCleanup = true,
        requestConfig = {},
        modifyContent = () => undefined,
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

    async function findRemoteItems(): Promise<Fetchable[]> {
        const a: Fetchable[] = []

        const resolvedDocs =
            typeof documents === "function"
                ? documents()
                : ((await documents) as string[])

        for (const id of resolvedDocs) {
            a.push({ id })
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
        const c = await findRemoteItems()

        for (const { id } of c) {
            //#region Run modifyContent (and fetch the data)
            let content = (
                await axios({
                    baseURL: sourceBaseUrl,
                    url: id,
                    ...requestConfig,
                })
            ).data
            let newIdent = id

            const called = modifyContent?.(newIdent, content)

            let cont = called?.content
            if (cont && typeof cont === "string") {
                content = cont
            }

            let fn
            if ((fn = called?.filename) && typeof fn === "string") {
                newIdent = fn
            }
            //#endregion

            const checkIdent = newIdent.split("/").filter((seg) => seg !== "")
            checkIdent.pop()

            // if we are outputting to a subdirectory, make sure it exists
            if (checkIdent.length > 0) {
                mkdirSync(
                    join(await getTargetDirectory(), checkIdent.join("/")),
                    { recursive: true }
                )
            }

            writeFileSync(join(await getTargetDirectory(), newIdent), content)
        }
    }

    async function cleanContent(): Promise<void> {
        const c = await findRemoteItems()

        for (const { id } of c) {
            delFile(join(await getTargetDirectory(), id))
        }
    }

    if (!noRuntimeDownloads) {
        await fetchContent()
    }

    // noinspection JSUnusedGlobalSymbols
    return {
        name: `docusaurus-plugin-remote-content-${name}`,

        async postBuild(): Promise<void> {
            if (performCleanup) {
                return await cleanContent()
            }
        },

        extendCli(cli): void {
            cli.command(`download-remote-${name}`)
                .description(`Downloads the remote ${name} data.`)
                .action(async () => await timeIt(`fetch ${name}`, fetchContent))

            cli.command(`clear-remote-${name}`)
                .description(
                    `Removes the local copy of the remote ${name} data.`
                )
                .action(async () => await timeIt(`clear ${name}`, cleanContent))
        },
    }
}

export * from "./types"
