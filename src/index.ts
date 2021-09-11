import type { LoadContext, Plugin } from "@docusaurus/types"
import axios from "axios"
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
   * Is this instance for the docs plugin?
   */
  docsIntegration?: boolean

  /**
   * Is this instance for the blog plugin?
   */
  blogIntegration?: boolean

  /**
   * The base URL for the source of the content.
   */
  sourceBaseUrl: string

  /**
   * Specify the document paths from the sourceBaseUrl
   * in a string array or function that returns a string array.
   */
  documents?: string[] | (() => string[])

  /**
   * The name of the subfolder within the destination (e.g. docs/myfolder/<output here>) to save the content to.
   */
  outputDirectory?: string
}

export type LoadableContent = void

interface Collectable {
  url: string
  identifier: string
}

export default function pluginRemoteContent(
  context: LoadContext,
  options: RemoteContentPluginOptions
): Plugin<LoadableContent> {
  let {
    blogIntegration,
    docsIntegration,
    sourceBaseUrl,
    documents,
    noRuntimeDownloads,
    performCleanup,
    outputDirectory,
  } = options

  if (![blogIntegration, docsIntegration].includes(true)) {
    throw new Error(
      "No integrations enabled! Please enable either the blogIntegration or docsIntegration fields in your remote-content plugin options."
    )
  }

  if (blogIntegration === true && docsIntegration === true) {
    throw new Error(
      "You can only have one integration enabled per plugin instance!"
    )
  }

  if (!documents) {
    throw new Error(
      "The documents field is undefined, so I don't know what to fetch!"
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

  function findCollectables(): Collectable[] {
    const a: Collectable[] = []

    if (docsIntegration === true || blogIntegration === true) {
      ;(
        (typeof documents == "function"
          ? documents.call(context.siteConfig)
          : documents) as string[]
      ).forEach((d) => {
        if (d.endsWith("md")) {
          a.push({ url: `${sourceBaseUrl}/${d}`, identifier: d })
        } else {
          a.push({ url: `${sourceBaseUrl}/${d}.md`, identifier: `${d}.md` })
        }
      })
    }

    return a
  }

  async function getTargetDirectory(): Promise<string> {
    let returnValue = undefined

    if (docsIntegration) {
      returnValue = join(context.siteDir, "docs")
    }

    if (blogIntegration) {
      returnValue = join(context.siteDir, "blog")
    }

    if (!returnValue) {
      throw new Error(
        "Fell through! No integrations are enabled! Please check the documentation."
      )
    }

    if (outputDirectory) {
      returnValue = join(returnValue, outputDirectory)
    }

    if (!existsSync(returnValue)) {
      mkdirSync(returnValue)
    }

    return returnValue
  }

  async function fetchContent(): Promise<void> {
    const c = findCollectables()

    for (let i = 0; i < c.length; i++) {
      writeFileSync(
        join(await getTargetDirectory(), c[i].identifier),
        (await axios({ url: c[i].url })).data
      )
    }
  }

  async function cleanContent(): Promise<void> {
    const c = findCollectables()

    for (let i = 0; i < c.length; i++) {
      delFile(join(await getTargetDirectory(), c[i].identifier))
    }
  }

  return {
    name: `docusaurus-plugin-remote-content-${
      [blogIntegration && "blog", docsIntegration && "docs"].filter(Boolean)[0]
    }`,

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
      const t = [blogIntegration && "blog", docsIntegration && "docs"].filter(
        Boolean
      )[0]

      cli
        .command(`download-remote-${t}`)
        .description(`Downloads the remote ${t} data.`)
        .action(async () => {
          const startTime = new Date()
          await fetchContent()
          console.log(
            chalk`{green Successfully fetched content in} {white ${milli(
              (new Date() as any) - (startTime as any)
            )}}{green !}`
          )
        })

      cli
        .command(`clear-remote-${t}`)
        .description(`Removes the local copy of the remote ${t} data.`)
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
