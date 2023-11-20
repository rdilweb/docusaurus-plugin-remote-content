/** @type {import("@docusaurus/types").DocusaurusConfig} */
module.exports = {
    title: "My Site",
    tagline: "The tagline of my site",
    url: "https://your-docusaurus-test-site.com",
    baseUrl: "/",
    onBrokenLinks: "log",
    onBrokenMarkdownLinks: "log",
    favicon: "img/favicon.ico",
    organizationName: "rdilweb", // Usually your GitHub org/user name.
    projectName: "docusaurus-plugin-remote-content", // Usually your repo name.
    themeConfig: {
        navbar: {
            title: "My Site",
            logo: {
                alt: "My Site Logo",
                src: "img/logo.svg",
            },
        },
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                },
                blog: {
                    showReadingTime: true,
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            },
        ],
    ],
    plugins: [
        [
            require.resolve("docusaurus-plugin-remote-content"),
            {
                name: "docs",
                id: "basicTest",
                outDir: "docs",
                sourceBaseUrl:
                    "https://raw.githubusercontent.com/PowerShell/PowerShell/master/docs",
                documents: ["FAQ.md"],
            },
        ],
        [
            require.resolve("docusaurus-plugin-remote-content"),
            {
                name: "powershell-docs",
                id: "outputDirectoryTest",
                sourceBaseUrl:
                    "https://raw.githubusercontent.com/PowerShell/PowerShell/master",
                documents: ["README.md", "CODE_OF_CONDUCT.md"],
                outDir: "docs/output-dir-testing",
                requestConfig: {
                    headers: {
                        "Hello-World": "ThisIsAHeader",
                    },
                },
                modifyContent(filename, content) {
                    if (filename.includes("CODE_OF_CONDUCT")) {
                        return {
                            filename,
                            content: `---
title: Code of Conduct with Front Matter
---

${content}`,
                        }
                    }

                    return undefined
                },
            },
        ],
        [
            require.resolve("docusaurus-plugin-remote-content"),
            {
                name: "github-labels",
                id: "pathSlashesTest",
                sourceBaseUrl:
                    "https://api.github.com/repos/rdilweb/docusaurus-plugin-remote-content",
                documents: ["labels"],
                outDir: "docs/output-dir-testing/_data",
                requestConfig: {
                    responseType: "arraybuffer",
                },
            },
        ],
    ],
}
