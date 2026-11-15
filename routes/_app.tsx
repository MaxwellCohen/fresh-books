import { Partial } from 'fresh/runtime';
import { define } from '../utils.ts';

const description =
  'Browse two million Goodreads books with Fresh, Preact, server-rendered search, and URL-driven filters.';

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||((t==="system"||!t)&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

const coverErrorScript = `document.addEventListener("error",function(e){var i=e.target;if(i&&i.tagName==="IMG"&&i.hasAttribute("data-cover")){i.hidden=true;var f=i.nextElementSibling;if(f)f.hidden=false;}},true);`;

export default define.page(function App({ Component }) {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Fresh Books</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Fresh Books" />
        <meta property="og:title" content="Fresh Books" />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: coverErrorScript }} />
      </head>
      <body f-client-nav>
        <Partial name="body">
          <Component />
        </Partial>
      </body>
    </html>
  );
});
