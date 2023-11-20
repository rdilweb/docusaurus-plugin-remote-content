import { AxiosRequestConfig } from "axios"

/**
 * An optional function that modifies the file name and content of a downloaded file.
 *
 * @param filename The file's name.
 * @param content The file's content.
 * @returns undefined to leave the content/name as is, or an object containing the filename and the content.
 */
export type ModifyContentFunction = (
    filename: string,
    content: string
) => { filename?: string; content?: string } | undefined

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

    /**
     * An optional function that modifies the file name and content of a downloaded file.
     *
     * @param filename The file's name.
     * @param content The file's content.
     * @returns undefined to leave the content/name as is, or an object containing the filename and the content.
     */
    modifyContent?: ModifyContentFunction
}

// noinspection SpellCheckingInspection
/**
 * Some piece of content that can be fetched.
 */
export interface Fetchable {
    id: string
}
