/**
 * Contains all the information about the links
 */
interface Link {
    name: string;
    link: string;
    proxy: boolean;
}

const links: Link[] = [
    {
        name: 'Home',
        link: '/home',
        proxy: false,
    },
    {
        name: 'Example-based Search',
        link: '/example-based-search',
        proxy: true,
    },
    {
        name: 'XPath Search',
        link: '/xpath-search',
        proxy: false,
    },
    {
        name: 'Multi Word Expressions',
        link: '/mwe-search',
        proxy: false,
    },
    {
        name: 'Documentation',
        link: '/documentation',
        proxy: false,
    },



];
const mainLinksName = [
    'Home',
    'Example-based Search',
    'XPath Search',
    'Multi Word Expressions',
    'Documentation'
];

const mainLinks: Link[] = links.filter(route => mainLinksName.includes(route.name));


export { Link, links, mainLinks };
