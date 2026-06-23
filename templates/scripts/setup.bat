@echo off
setlocal enabledelayedexpansion

:: ─────────────────────────────────────────
:: Project name
:: ─────────────────────────────────────────
set /p projectName="Enter project name: "

if exist "%projectName%" (
    echo Project '%projectName%' already exists. Exiting.
    exit /b 1
)

echo Initializing vite project '%projectName%'...
call npm create vite@latest %projectName% -- --template react-ts
if errorlevel 1 (
    echo Failed to create vite project. Exiting.
    exit /b 1
)

cd %projectName%

:: ─────────────────────────────────────────
:: Package selection (y/n per package)
:: ─────────────────────────────────────────
echo.
echo Select packages to install (y/n):
echo.

set "packages="

call :ask "@tailwindcss/vite"
call :ask "tailwindcss"
call :ask "tailwind-merge"
call :ask "clsx"
call :ask "react-hook-form"
call :ask "react-router-dom"
call :ask "@tanstack/react-query"
call :ask "@tanstack/react-router"
call :ask "@reduxjs/toolkit"
call :ask "react-redux"
call :ask "redux-persist"
call :ask "lucide-react"
call :ask "react-icons"
call :ask "axios"
call :ask "zustand"
call :ask "zod"
call :ask "@hookform/resolvers"
call :ask "@floating-ui/react"
call :ask "framer-motion"

if not "!packages!"=="" (
    echo.
    echo Installing base dependencies...
    call npm install
    echo Installing selected packages: !packages!
    call npm install !packages!
) else (
    echo No packages selected, skipping...
)

:: ─────────────────────────────────────────
:: Environment variables
:: ─────────────────────────────────────────
echo.
echo Creating environment variables...

type nul > .env

(
    echo VITE_HOST=0.0.0.0
    echo VITE_PORT=3030
    echo #VITE_API_URL=
) > .env.development

(
    echo VITE_HOST=0.0.0.0
    echo VITE_PORT=3031
    echo #VITE_API_URL=
) > .env.staging

(
    echo VITE_HOST=0.0.0.0
    echo VITE_PORT=3032
    echo #VITE_API_URL=
) > .env.production

:: ─────────────────────────────────────────
:: Update package.json scripts via Node
:: ─────────────────────────────────────────
echo.
echo Updating scripts section in package.json...

node -e ^
"const fs = require('fs');" ^
"const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));" ^
"pkg.scripts = { lint: 'eslint .', preview: 'vite preview', dev: 'vite', stage: 'vite --mode staging', build: 'vite build', 'build-stage': 'vite build --mode staging' };" ^
"fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

:: ─────────────────────────────────────────
:: vite.config.ts
:: ─────────────────────────────────────────
echo.
echo Setting up vite config...

(
    echo import { defineConfig, loadEnv } from 'vite';
    echo import react from '@vitejs/plugin-react';
    echo import tailwindcss from '@tailwindcss/vite';
    echo import path from 'path';
    echo.
    echo export default defineConfig(({ mode }) =^> {
    echo   const env = loadEnv(mode, process.cwd(), ''^);
    echo   return {
    echo     plugins: [react(^), tailwindcss(^)],
    echo     resolve: {
    echo       alias: {
    echo         '@': path.resolve(__dirname, './src'^),
    echo       },
    echo     },
    echo     server: {
    echo       host: '0.0.0.0',
    echo       port: Number(env.VITE_PORT^),
    echo     },
    echo   };
    echo }^);
) > vite.config.ts

:: ─────────────────────────────────────────
:: tsconfig.app.json
:: ─────────────────────────────────────────
echo.
echo Setting up tsconfig paths...

(
    echo {
    echo   "compilerOptions": {
    echo     "baseUrl": ".",
    echo     "paths": { "@/*": ["src/*"] },
    echo     "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    echo     "target": "es2023",
    echo     "lib": ["ES2023", "DOM"],
    echo     "module": "esnext",
    echo     "types": ["vite/client"],
    echo     "skipLibCheck": true,
    echo     "moduleResolution": "bundler",
    echo     "allowImportingTsExtensions": true,
    echo     "verbatimModuleSyntax": true,
    echo     "moduleDetection": "force",
    echo     "noEmit": true,
    echo     "jsx": "react-jsx",
    echo     "noUnusedLocals": true,
    echo     "noUnusedParameters": true,
    echo     "erasableSyntaxOnly": true,
    echo     "noFallthroughCasesInSwitch": true
    echo   },
    echo   "include": ["src"]
    echo }
) > tsconfig.app.json

:: ─────────────────────────────────────────
:: tailwind.config.ts
:: ─────────────────────────────────────────
echo.
echo Setting up tailwind config...

(
    echo /** @type {import('tailwindcss'^).Config} */
    echo export default {
    echo   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    echo   theme: {
    echo     extend: {},
    echo   },
    echo   plugins: [],
    echo };
) > tailwind.config.ts

:: ─────────────────────────────────────────
:: README + .gitignore
:: ─────────────────────────────────────────
echo.
echo Formatting README.md and .gitignore...

type nul > README.md

(
    echo.
    echo .env
    echo .env.*
    echo .sixth*
) >> .gitignore

:: ─────────────────────────────────────────
:: src directory structure
:: ─────────────────────────────────────────
echo.
echo Setting up src directory...

cd src

del /f /q App.css index.css 2>nul

(
    echo import { createRoot } from 'react-dom/client';
    echo import '../style/index.css';
    echo import App from './App.tsx';
    echo.
    echo createRoot(document.getElementById('root'^)!^).render(^<App /^>^);
) > main.tsx

(
    echo export default function App(^) {
    echo   return ^<^>app file loaded^<^/^>;
    echo }
) > App.tsx

mkdir style
(echo @import "tailwindcss";) > style\index.css

mkdir components
mkdir components\base
type nul > components\base\index.ts
mkdir components\global
type nul > components\global\index.ts

mkdir hooks
type nul > hooks\index.ts

mkdir utils
type nul > utils\index.ts

cd ..

:: ─────────────────────────────────────────
:: pejay-ui initialization and scaffolding
:: ─────────────────────────────────────────
set "hasAxios="
set "hasTanstackQuery="
set "hasTanstackRouter="
set "hasReactRouter="
set "hasRedux="
set "hasPersist="

for %%p in (!packages!) do (
    if "%%p"=="axios" set "hasAxios=1"
    if "%%p"=="@tanstack/react-query" set "hasTanstackQuery=1"
    if "%%p"=="@tanstack/react-router" set "hasTanstackRouter=1"
    if "%%p"=="react-router-dom" set "hasReactRouter=1"
    if "%%p"=="@reduxjs/toolkit" set "hasRedux=1"
    if "%%p"=="react-redux" set "hasRedux=1"
    if "%%p"=="redux-persist" set "hasPersist=1"
)

set "needsInit="
if defined hasAxios set "needsInit=1"
if defined hasTanstackQuery set "needsInit=1"
if defined hasTanstackRouter set "needsInit=1"
if defined hasReactRouter set "needsInit=1"
if defined hasRedux set "needsInit=1"

if defined needsInit (
    echo.
    echo Initializing pejay-ui...
    call npx pejay-ui init
    
    if defined hasAxios (
        echo Adding axios-client...
        call npx pejay-ui add axios-client
    )
    if defined hasTanstackQuery (
        echo Adding tanstack-query-client...
        call npx pejay-ui add tanstack-query-client
    )
    if defined hasTanstackRouter (
        echo Adding tanstack-router-client...
        call npx pejay-ui add tanstack-router-client
    )
    if defined hasReactRouter (
        echo Adding react-router-client...
        call npx pejay-ui add react-router-client
    )
    if defined hasRedux (
        if defined hasPersist (
            echo Adding redux-store-client...
            call npx pejay-ui add redux-store-client
        ) else (
            echo.
            echo You selected Redux. Which template would you like to add?
            echo [1] Redux Store (redux-store-client)
            echo [2] RTK Query (rtk-query-client)
            echo [3] Both
            echo [4] None
            set "reduxAns=1"
            set /p "reduxAns=Enter choice (1-4, default 1): "
            if "!reduxAns!"=="2" (
                echo Adding rtk-query-client...
                call npx pejay-ui add rtk-query-client
            ) else if "!reduxAns!"=="3" (
                echo Adding redux-store-client...
                call npx pejay-ui add redux-store-client
                echo Adding rtk-query-client...
                call npx pejay-ui add rtk-query-client
            ) else if "!reduxAns!"=="4" (
                rem Do nothing
            ) else (
                echo Adding redux-store-client...
                call npx pejay-ui add redux-store-client
            )
        )
    )
)

echo.
echo Project '%projectName%' setup complete!
endlocal
exit /b 0

:: ─────────────────────────────────────────
:: Helper: ask y/n for a package
:: ─────────────────────────────────────────
:ask
set "pkg=%~1"
set /p "ans=  Install %pkg%? (y/n): "
if /i "!ans!"=="y" (
    set "packages=!packages! %pkg%"
)
exit /b 0
