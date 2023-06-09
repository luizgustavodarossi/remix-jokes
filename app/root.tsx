import type { LinksFunction, V2_MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";

import globalLargeStylesUrl from "./styles/global-large.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalStylesUrl from "./styles/global.css";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: globalStylesUrl,
    },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen and (min-width: 1024px)",
    },
  ];
};

export const meta: V2_MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;
  return [
    { charset: "utf-8" },
    { description },
    { keywords: "Remix,jokes" },
    { "twitter:image": "https://remix-jokes.lol/social.png" },
    { "twitter:card": "summary_large_image" },
    { "twitter:creator": "@remix_run" },
    { "twitter:site": "@remix_run" },
    { "twitter:title": "Remix Jokes" },
    { "twitter:description": description }
  ];
};

function Document({
  children,
  title = `Remix: So great, it's funny!`,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error))
    return (
      <Document
        title={`${error.status} ${error.statusText}`}
      >
        <div className="error-container">
          <h1>Oops</h1>
          <p>Status: {error.status}</p>
          <pre>{error.data.message}</pre>
        </div>
      </Document>
    );


  return (
    <Document title="Uh-oh!">
      <div className="error-container">
        <h4>App Error</h4>
        <pre>Unknown error</pre>
      </div>
    </Document>
  )
}
