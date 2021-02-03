import type { LoadContext, Props } from "@docusaurus/types"
import type commander from "commander"
import axios from "axios"
import { writeFileSync } from "fs"
import { join } from "path"

/**
 * The plugin's options.
 */
export interface RemoteContentPluginOptions {
    /**
     * Delete local content after everything?
     */
    performCleanup?: boolean

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

// @ts-ignore
export default class PluginRemoteContent extends Plugin<LoadableContent, RemoteContentPluginOptions> {
    name = "docusaurus-plugin-remote-content"

    options: RemoteContentPluginOptions
    context: LoadContext

    constructor(context: LoadContext, options: RemoteContentPluginOptions) {
        super(options, context)

        this.options = options
        this.context = context

        this.onLoad()
    }

    onLoad(): void {
        let { blogIntegration, docsIntegration, sourceBaseUrl, documents } = this.options

        if (!([blogIntegration, docsIntegration].includes(true))) {
            throw new Error("No integrations enabled! Please enable one of the blogIntegration, docsIntegration, or pagesIntegration fields in your remote-content plugin options.")
        }

        if (documents === undefined) {
            throw new Error("The documents field is undefined, so I don't know what to fetch!")
        }

        if (sourceBaseUrl === undefined) {
            throw new Error("The sourceBaseUrl field is undefined, so I don't know where to fetch from!")
        }

        if (!sourceBaseUrl.endsWith("/")) {
            sourceBaseUrl = `${sourceBaseUrl}/`
        }
    }

    findCollectables(): Collectable[] {
        const { documents, sourceBaseUrl } = this.options
        const a: Collectable[] = []

        if (this.options.docsIntegration === true) {
            (
                (typeof documents == "function" ? documents.call(this.context.siteConfig) : documents) as string[]
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

    async loadContent(): Promise<LoadableContent> {
        const c = this.findCollectables()
        let loc = ""

        if (this.options.docsIntegration) {
            loc = join(this.context.siteDir, "docs")
        }

        if (this.options.blogIntegration) {
            loc = join(this.context.siteDir, "blog")
        }

        for (let i = 0; i < c.length; i++) {
            writeFileSync(join(loc, c[i].identifier), await (await axios({ url: c[i].url })).data)
        }
    }

    async contentLoaded(): Promise<void> {
        // The contentLoaded hook is done after loadContent hook is done.
    }

    async postBuild(props: Props): Promise<void> {
        // After docusaurus <build> finish.
    }

    extendCli(cli: commander.CommanderStatic): void {
        cli
            .command("dothing")
            .description("Does something")
            .action(() => {})
    }
}
