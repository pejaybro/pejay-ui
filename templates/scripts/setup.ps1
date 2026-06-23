$ErrorActionPreference = "Stop"

function Show-MultiSelect {
    param([string[]]$Options, [string]$Title)

    $selected = @($false) * $Options.Length
    $cursor = 0

    while ($true) {
        Clear-Host
        Write-Host $Title

        for ($i = 0; $i -lt $Options.Length; $i++) {
            $checkbox = if ($selected[$i]) { "[x]" } else { "[ ]" }
            if ($i -eq $cursor) {
                Write-Host " > $checkbox $($Options[$i])" -ForegroundColor Cyan
            } else {
                Write-Host "   $checkbox $($Options[$i])"
            }
        }

        $key = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

        switch ($key.VirtualKeyCode) {
            38 { if ($cursor -gt 0) { $cursor-- } }
            40 { if ($cursor -lt $Options.Length - 1) { $cursor++ } }
            32 { $selected[$cursor] = !$selected[$cursor] }
            13 {
                $result = @()
                for ($i = 0; $i -lt $Options.Length; $i++) {
                    if ($selected[$i]) { $result += $Options[$i] }
                }
                Clear-Host
                return $result
            }
        }
    }
}

# rest of your script below...
<#
   The following command prompts for the project name
#>

Write-Output "Enter project name:"
$projectName = Read-Host

if (Test-Path $projectName) {
    Write-Output "Project '$projectName' already exists. Exiting."
    exit 1
}

Write-Output "Initializing vite project '$projectName' " 
npm create vite@latest $projectName -- --template react-ts

Set-Location $projectName

<#
   The following command installs all the required dependencies
#>

Write-Output "Installing dependencies"


$availablePackages = @(
    "@tailwindcss/vite",
    "tailwindcss",
    "tailwind-merge",
    "clsx",
    "react-hook-form",
    "react-router-dom",
    "@tanstack/react-query",
    "@tanstack/react-router",
    "@reduxjs/toolkit",
    "react-redux",
    "redux-persist",
    "lucide-react",
    "react-icons",
    "axios",   
    "zustand",
    "zod",
    "@hookform/resolvers",
    "@floating-ui/react",
    "framer-motion"
)

$selectedPackages = Show-MultiSelect -Options $availablePackages -Title "Select packages to install (SPACE to toggle, ENTER to confirm):"

if ($selectedPackages.Count -gt 0) {
    npm install
    $packageString = $selectedPackages -join " "
    Invoke-Expression "npm install $packageString"
} else {
    Write-Output "No packages selected, skipping..."
}

<#
   The following command creates environment variables
#>

Write-Output "Creating environment variables"
Set-Content ".env" ""

Set-Content ".env.development" @"
VITE_HOST=0.0.0.0
VITE_PORT=3030
#VITE_API_URL=
"@

Set-Content ".env.staging" @"
VITE_HOST=0.0.0.0
VITE_PORT=3031
#VITE_API_URL=
"@

Set-Content ".env.production" @"
VITE_HOST=0.0.0.0
VITE_PORT=3032
#VITE_API_URL=
"@

<#
   The following command updates the scripts section of package.json
#>

Write-Output "Updating scripts section"
$pkg = Get-Content "package.json" -Raw | ConvertFrom-Json

$pkg.scripts = [ordered]@{
    lint          = "eslint ."
    preview       = "vite preview"
    dev           = "vite"
    stage         = "vite --mode staging"
    build         = "vite build"
    "build-stage" = "vite build --mode staging"
}

$pkg | ConvertTo-Json -Depth 10 | Set-Content "package.json"

<#
   The following command sets up the vite config
#>

Write-Output "Setting up vite config"
Set-Content "vite.config.ts" @'
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_PORT),
    },
  };
});
'@

<#
   The following command sets up the tsconfig paths
#>

Write-Output "Setting up tsconfig paths"
Set-Content "tsconfig.app.json" @'
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "types": ["vite/client"],
    "skipLibCheck": true,  
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",  
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
'@

<#
   The following command sets up the tailwind config
#>

Write-Output "Setting up tailwind config"
Set-Content "tailwind.config.ts" @'
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
'@

<#
   The following command formats README.md and .gitignore
#>

Write-Output "Formatting README.md and .gitignore"
Clear-Content "README.md"
Add-Content ".gitignore" @"
.env
.env.*
.sixth*
"@

<#
   The following command sets up the src directory
#>

Write-Output "Setting up src directory"
Set-Location src

<#
   The following command sets up the main.tsx and App.tsx files
#>

Write-Output "Setting up main.tsx and App.tsx files"
Remove-Item "App.css", "index.css" -Force
Clear-Content "main.tsx", "App.tsx"

Set-Content "main.tsx" @'
import { createRoot } from 'react-dom/client';
import '../style/index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(<App />);
'@

Set-Content "App.tsx" @'
export default function App() {
  return <>app file loaded</>;
}
'@

<#
   The following command sets up all directories and files
#>

Write-Output "Creating directories and files"

mkdir style
Set-Content "style/index.css" @'
@import "tailwindcss";
'@

mkdir components
mkdir components/base
Set-Content "components/base/index.ts" ""
mkdir components/global
Set-Content "components/global/index.ts" ""

mkdir hooks
Set-Content "hooks/index.ts" ""

mkdir utils
Set-Content "utils/index.ts" ""

Set-Location ..

# ─────────────────────────────────────────
# pejay-ui initialization and scaffolding
# ─────────────────────────────────────────
$needsInit = $false
$templatesToAdd = @()

if ($selectedPackages -contains "axios") {
    $needsInit = $true
    $templatesToAdd += "axios-client"
}
if ($selectedPackages -contains "@tanstack/react-query") {
    $needsInit = $true
    $templatesToAdd += "tanstack-query-client"
}
if ($selectedPackages -contains "@tanstack/react-router") {
    $needsInit = $true
    $templatesToAdd += "tanstack-router-client"
}
if ($selectedPackages -contains "react-router-dom") {
    $needsInit = $true
    $templatesToAdd += "react-router-client"
}
if ($selectedPackages -contains "@reduxjs/toolkit" -or $selectedPackages -contains "react-redux") {
    $needsInit = $true
    if ($selectedPackages -contains "redux-persist") {
        $templatesToAdd += "redux-store-client"
    } else {
        Write-Output ""
        Write-Output "You selected Redux. Which template would you like to add?"
        Write-Output "1) Redux Store (redux-store-client)"
        Write-Output "2) RTK Query (rtk-query-client)"
        Write-Output "3) Both"
        Write-Output "4) None"
        $reduxChoice = Read-Host "Select option (1-4, default 1)"
        if ($reduxChoice -eq "2") {
            $templatesToAdd += "rtk-query-client"
        } elseif ($reduxChoice -eq "3") {
            $templatesToAdd += "redux-store-client"
            $templatesToAdd += "rtk-query-client"
        } elseif ($reduxChoice -eq "4") {
            # None
        } else {
            $templatesToAdd += "redux-store-client"
        }
    }
}

if ($needsInit) {
    Write-Output "`nInitializing pejay-ui..."
    npx pejay-ui init

    foreach ($template in $templatesToAdd) {
        Write-Output "Adding template: $template..."
        npx pejay-ui add $template
    }
}

Write-Output "✅ Project '$projectName' setup complete!"