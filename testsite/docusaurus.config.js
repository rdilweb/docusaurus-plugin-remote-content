module.exports = {
    title: "My Site",
    tagline: "The tagline of my site",
    url: "https://your-docusaurus-test-site.com",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
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
            items: [
                {
                    to: "docs/",
                    activeBasePath: "docs",
                    label: "Docs",
                    position: "left",
                },
                { to: "blog", label: "Blog", position: "left" },
                {
                    href: "https://github.com/facebook/docusaurus",
                    label: "GitHub",
                    position: "right",
                },
            ],
        },
        footer: {
            style: "dark",
            links: [
                {
                    title: "Docs",
                    items: [
                        {
                            label: "Style Guide",
                            to: "docs/",
                        },
                        {
                            label: "Second Doc",
                            to: "docs/doc2/",
                        },
                    ],
                },
                {
                    title: "Community",
                    items: [
                        {
                            label: "Stack Overflow",
                            href: "https://stackoverflow.com/questions/tagged/docusaurus",
                        },
                        {
                            label: "Discord",
                            href: "https://discordapp.com/invite/docusaurus",
                        },
                        {
                            label: "Twitter",
                            href: "https://twitter.com/docusaurus",
                        },
                    ],
                },
                {
                    title: "More",
                    items: [
                        {
                            label: "Blog",
                            to: "blog",
                        },
                        {
                            label: "GitHub",
                            href: "https://github.com/facebook/docusaurus",
                        },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
        },
    },
    presets: [
        [
            "@docusaurus/preset-classic",
            {
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    editUrl:
                        "https://github.com/facebook/docusaurus/edit/master/website/",
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    editUrl:
                        "https://github.com/facebook/docusaurus/edit/master/website/blog/",
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            },
        ],
    ],
    // THIS IS YOUR PLUGIN'S ENTRYPOINT.
    // YOU CAN TEST IT OUT WITH DIFFERENT OPTIONS BY PASSING THEM IN THE OBJECT LITERAL
    plugins: [
        [
            require.resolve("../build/index.js"),
            {
                name: "docs",
                id: "basicTest",
                outDir: "docs",
                sourceBaseUrl:
                    "https://raw.githubusercontent.com/rdilweb/rdil.rocks/master/docs/docs",
                documents: ["api.md"],
            },
        ],
        [
            require.resolve("../build/index.js"),
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
            },
        ],
    ],
}
