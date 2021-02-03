import type { LoadContext } from "@docusaurus/types"
import type commander from "commander"
import axios from "axios"
import { writeFileSync } from "fs"
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
   * CLI only mode
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
   * The base url for the source of the content.
   */
  sourceBaseUrl: string
  /**
   * Specify the document paths from the sourceBaseUrl
   * in a string array or function that returns a string array.
   */
  documents?: string[] | (() => string[])
}

export type LoadableContent = void

interface Collectable {
  url: string
  identifier: string
}

export default function pluginRemoteContent(
  context: LoadContext,
  options: RemoteContentPluginOptions
): any {
  let {
    blogIntegration,
    docsIntegration,
    sourceBaseUrl,
    documents,
    noRuntimeDownloads,
    performCleanup,
  } = options

  if (![blogIntegration, docsIntegration].includes(true)) {
    throw new Error(
      "No integrations enabled! Please enable either the blogIntegration or docsIntegration fields in your remote-content plugin options."
    )
  }

  if (documents === undefined) {
    throw new Error(
      "The documents field is undefined, so I don't know what to fetch!"
    )
  }

  if (sourceBaseUrl === undefined) {
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
      ;((typeof documents == "function"
        ? documents.call(context.siteConfig)
        : documents) as string[]).forEach((d) => {
        if (d.endsWith("md")) {
          a.push({ url: `${sourceBaseUrl}/${d}`, identifier: d })
        } else {
          a.push({ url: `${sourceBaseUrl}/${d}.md`, identifier: `${d}.md` })
        }
      })
    }

    return a
  }

  function getTargetDirectory(): string {
    if (docsIntegration) {
      return join(context.siteDir, "docs")
    }

    if (blogIntegration) {
      return join(context.siteDir, "blog")
    }

    return ""
  }

  // 'this' is a huge mess in JS, so we avoid that where we can, such as here.
  const pluginReturn = {
    name: `docusaurus-plugin-remote-content-${
      [blogIntegration && "blog", docsIntegration && "docs"].filter(Boolean)[0]
    }`,

    async loadContent(): Promise<LoadableContent> {
      if ([false, undefined].includes(noRuntimeDownloads)) {
        return await pluginReturn.fetchContent()
      }
    },

    async postBuild(): Promise<void> {
      if (performCleanup !== false) {
        return await pluginReturn.cleanContent()
      }
    },

    async fetchContent(): Promise<void> {
      const c = findCollectables()

      for (let i = 0; i < c.length; i++) {
        writeFileSync(
          join(getTargetDirectory(), c[i].identifier),
          await (await axios({ url: c[i].url })).data
        )
      }
    },

    async cleanContent(): Promise<void> {
      const c = findCollectables()

      for (let i = 0; i < c.length; i++) {
        delFile(join(getTargetDirectory(), c[i].identifier))
      }
    },

    extendCli(cli: commander.CommanderStatic): void {
      const t = [blogIntegration && "blog", docsIntegration && "docs"].filter(
        Boolean
      )[0]

      cli
        .command(`download-remote-${t}`)
        .description(`Downloads the remote ${t} data.`)
        .action(() => {
          ;(async () => {
            const startTime = new Date()
            await pluginReturn.fetchContent()
            console.log(
              chalk`{green Successfully fetched content in} {white ${milli(
                (new Date() as any) - (startTime as any)
              )}}{green !}`
            )
          })()
        })

      cli
        .command(`clear-remote-${t}`)
        .description(`Removes the local copy of the remote ${t} data.`)
        .action(() => {
          ;(async () => {
            const startTime = new Date()
            await pluginReturn.cleanContent()
            console.log(
              chalk`{green Successfully deleted content in} {white ${milli(
                (new Date() as any) - (startTime as any)
              )}}{green !}`
            )
          })()
        })
    },
  }

  return pluginReturn
}
