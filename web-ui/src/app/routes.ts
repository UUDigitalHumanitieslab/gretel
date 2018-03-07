import {HomePageComponent} from "./pages/home-page/home-page.component";
import {Route, Routes} from "@angular/router";
import {DocumentationComponent} from "./pages/documentation/documentation.component";

interface RouteWrapper {
  name: string,
  link: string,
  proxy: boolean
  route: Route,
}


const wrappedRoutes: RouteWrapper[] = [
    {
      name: 'home',
      link: '/home',
      proxy: false,
      route: {
        path: 'home',
        component: HomePageComponent
      }

    },

  {
    name: 'example-based-search',
    link: '/gretel/ebs/input.php',
    proxy: true,
    route: {
      path: 'example-based-search',
      component: DocumentationComponent
    },
  },
  {
    name: 'x-path-search',
    link: '/gretel/xps/input.php',
    proxy: true,
    route: {
      path: 'x-path-search',
      component: DocumentationComponent
    }

},
  {
    name: 'documentation',
    link: '/documentation',
    proxy: false,
    route: {
      path: 'documentation',
      component: DocumentationComponent
    },

  },


];


const routes: Routes = wrappedRoutes.map(route => route.route);

const mainRoutesNames = [
  "home",
  "example-based-search",
  "x-path-search",
  "documentation"
];

const mainRoutes : RouteWrapper[] =  wrappedRoutes.filter(route => mainRoutesNames.includes(route.name));


export {RouteWrapper, routes, wrappedRoutes, mainRoutes}

