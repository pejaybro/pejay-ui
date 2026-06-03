export default function PageOne() {
  return <div>Page One</div>;
}

/*
# NOTE: FRAMEWORK-LEVEL META & PRERENDERING CONFIGURATION (SEO)

If you are using React Router v7 and want static HTML files compiled for SEO search crawlers, follow these steps:

-------------------------------------------------------------------------------------

1. ROUTE META EXPORT (Add this inside this page file):
```typescript
import type { MetaFunction } from "react-router-dom";

export const meta: MetaFunction = () => {
  return [
    { title: "Page One Analytics | My App" },
    { name: "description", content: "Analyze product sales and user logs." },
  ];
};
```

-------------------------------------------------------------------------------------

2. PRERENDER SETTINGS (Add this in your react-router.config.ts / vite.config.ts):
```typescript
export default {
  async prerender() {
    return ["/", "/page_one", "/page_two"]; // Routes to generate as static HTML pages
  },
};
```

-------------------------------------------------------------------------------------

3. HOW THE BUILD CHANGES (Build output comparison):

OLD BUILD (Standard Single Page Application):
- Outputs only a single empty "index.html" page.
- Crawlers see no initial page HTML or titles when visiting "/page_one" until JS loads.

NEW BUILD (Prerendered SPA):
- Outputs directory folders containing index.html files:
  dist/
    ├── index.html            <- for "/"
    ├── page_one/
    │   └── index.html        <- for "/page_one" (contains pre-rendered metadata)
    └── page_two/
        └── index.html        <- for "/page_two" (contains pre-rendered metadata)

-------------------------------------------------------------------------------------

4. SERVER SETTINGS (VPS Deployment):

For a standard VPS server (like Nginx), configure it to serve static files from your build directory. 
Nginx will look for the folder-based index files (e.g., /page_one/index.html) first.

NGINX VPS CONFIGURATION EXAMPLE (/etc/nginx/sites-available/default):
```nginx
server {
    listen 80;
    server_name your-app.com;

    # Point to your build distribution directory on the VPS
    root /var/www/your-app/dist; 

    index index.html;

    location / {
        # 1. Checks if exact file exists ($uri)
        # 2. Checks if a directory index.html exists ($uri/) -> Serves pre-rendered SEO pages!
        # 3. Falls back to root index.html if route is handled client-side
        try_files $uri $uri/ /index.html;
    }

    # Optional: Proxy API requests directly to your Laravel Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8000; # Address where your Laravel backend runs
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
*/