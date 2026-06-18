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

call :ask "@reduxjs/toolkit"
call :ask "@tailwindcss/vite"
call :ask "clsx"
call :ask "date-fns"
call :ask "dayjs"
call :ask "@floating-ui/react"
call :ask "lucide-react"
call :ask "react-hook-form"
call :ask "react-redux"
call :ask "react-router-dom"
call :ask "tailwind-merge"
call :ask "tailwindcss"
call :ask "@tanstack/react-query"
call :ask "zod"
call :ask "zustand"

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

mkdir lib
type nul > lib\index.ts

mkdir routes
type nul > routes\index.ts
mkdir routes\dashboard
type nul > routes\dashboard\index.ts
mkdir routes\dashboard\components
type nul > routes\dashboard\components\index.ts
mkdir routes\dashboard\hooks
type nul > routes\dashboard\hooks\index.ts
mkdir routes\auth
type nul > routes\auth\index.ts
mkdir routes\auth\components
type nul > routes\auth\components\index.ts
mkdir routes\auth\hooks
type nul > routes\auth\hooks\index.ts

mkdir router
mkdir router\guards
type nul > router\guards\guard.public.ts
type nul > router\guards\guard.private.ts
mkdir router\layout
type nul > router\layout\layout.public.ts
type nul > router\layout\layout.main.ts
type nul > router\layout\layout.auth.ts
type nul > router\index.ts

mkdir providers
type nul > providers\index.ts
type nul > providers\app.provider.ts

mkdir services
type nul > services\index.ts
mkdir services\dashboard
mkdir services\auth

mkdir store
type nul > store\index.ts

mkdir utils
type nul > utils\index.ts

cd ..

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
