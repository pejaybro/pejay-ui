#!/usr/bin/env node

import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import babel from "@babel/core";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");

const program = new Command();

/* -----------------------------
   INQUIRER DYNAMIC IMPORT
------------------------------*/
const prompt = async (questions) => {
  const inquirer = await import("inquirer");
  return inquirer.default.prompt(questions);
};

program
  .name("pejay-ui")
  .description("CLI to initialize, add, and remove React UI components")
  .version("1.0.0");

/* =============================
   INIT COMMAND
============================= */
program
  .command("init")
  .description("Initialize pejay-ui configuration in your project")
  .action(async () => {
    console.log("Initializing pejay-ui...");

    const baseDir = "src/pejay-ui";
    
    // Save project configuration
    const configPath = path.join(process.cwd(), "pejay-ui.json");
    const config = {
      baseDir,
      installed: {}
    };

    await fs.writeJSON(configPath, config, { spaces: 2 });

    console.log(`\nSuccess!`);
    console.log(`- Created configuration at pejay-ui.json`);
    console.log(`\nYou can now add components using: npx pejay-ui add <component-name>`);
  });

/* =============================
   ADD COMMAND
============================= */
program
  .command("add <component>")
  .description("Add a component to your project")
  .action(async (component) => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, "pejay-ui.json");

      if (!await fs.pathExists(configPath)) {
        console.error("Error: pejay-ui.json not found. Please run 'npx pejay-ui init' first.");
        process.exit(1);
      }

      const config = await fs.readJSON(configPath);
      const registryPath = path.join(packageRoot, "registry.json");

      if (!await fs.pathExists(registryPath)) {
        console.error("Error: Registry configuration not found in the package.");
        process.exit(1);
      }

      const registry = await fs.readJSON(registryPath);
      const isTsProject = await fs.pathExists(path.join(cwd, "tsconfig.json"));

      // Track all components to install (including dependencies) in topological/order of dependencies
      const installQueue = [];
      const visited = new Set();

      const resolveDependencies = (compName) => {
        if (visited.has(compName)) return;
        visited.add(compName);

        const compData = registry[compName];
        if (!compData) {
          console.error(`Error: Component '${compName}' not found in registry.`);
          console.log(`Available components: ${Object.keys(registry).join(", ")}`);
          process.exit(1);
        }

        // Resolve dependencies first
        if (compData.dependencies && compData.dependencies.length > 0) {
          for (const dep of compData.dependencies) {
            resolveDependencies(dep);
          }
        }

        installQueue.push(compName);
      };

      resolveDependencies(component);

      console.log("\n🚀 Starting installation...\n");

      for (const compToInstall of installQueue) {
        // Skip if already marked as installed in config (unless it is the main component requested)
        if (config.installed?.[compToInstall] && compToInstall !== component) {
          console.log(`Component '${compToInstall}' is already installed. Skipping dependency installation.`);
          continue;
        }

        const componentData = registry[compToInstall];
        console.log(`Installing component: ${componentData.name}...`);

        // 1. Check target project package.json for peerDependencies
        const targetPackageJsonPath = path.join(cwd, "package.json");
        let missingDependencies = [];

        if (componentData.peerDependencies && componentData.peerDependencies.length > 0) {
          let targetDeps = {};
          if (await fs.pathExists(targetPackageJsonPath)) {
            try {
              const targetPkg = await fs.readJSON(targetPackageJsonPath);
              targetDeps = {
                ...(targetPkg.dependencies || {}),
                ...(targetPkg.devDependencies || {})
              };
            } catch (e) {}
          }

          missingDependencies = componentData.peerDependencies.filter(
            (dep) => !targetDeps[dep]
          );
        }

        if (missingDependencies.length > 0) {
          console.error(`Error: Missing required package dependencies to use '${compToInstall}':`);
          console.log(`Please run the following command to install them first:`);
          console.log(`\n  npm install ${missingDependencies.join(" ")}\n`);
          process.exit(1);
        }

        // 2. Process & Copy Utility dependencies
        const targetUtilsDir = path.join(cwd, config.baseDir, "utils");
        const utilsList = componentData.utils || [];
        const installedUtils = [];

        for (const utilFile of utilsList) {
          const sourceUtilPath = path.join(packageRoot, "utils", utilFile);

          if (await fs.pathExists(sourceUtilPath)) {
            let utilCode = await fs.readFile(sourceUtilPath, "utf-8");
            const utilExt = isTsProject ? "ts" : "js";
            const targetUtilFile = utilFile.replace(/\.ts$/, `.${utilExt}`);
            const targetUtilPath = path.join(targetUtilsDir, targetUtilFile);

            if (!await fs.pathExists(targetUtilPath)) {
              console.log(`Initializing utility: utils/${targetUtilFile}...`);

              if (!isTsProject) {
                const transformed = babel.transformSync(utilCode, {
                  presets: ["@babel/preset-typescript"],
                  filename: utilFile,
                });
                utilCode = transformed?.code || utilCode;
              }

              await fs.ensureDir(targetUtilsDir);
              await fs.writeFile(targetUtilPath, utilCode, "utf-8");
            }
            installedUtils.push(targetUtilFile);
          }
        }

        // 3. Process & Copy Component Files
        const targetDir = path.join(cwd, config.baseDir, "components", componentData.category);
        const outputExt = isTsProject ? "tsx" : "jsx";

        // Determine list of files to copy
        const sourceFiles = componentData.files || (componentData.path ? [componentData.path] : []);
        const installedFiles = [];

        for (const srcFilePath of sourceFiles) {
          const templateSrc = path.join(packageRoot, srcFilePath);
          if (!await fs.pathExists(templateSrc)) {
            console.error(`Error: Template file does not exist at ${templateSrc}`);
            process.exit(1);
          }

          const filename = path.basename(srcFilePath).replace(/\.(tsx|ts)$/, (match) => {
            return match === ".tsx" ? `.${outputExt}` : `.${isTsProject ? "ts" : "js"}`;
          });
          const targetFile = path.join(targetDir, filename);

          let componentCode = await fs.readFile(templateSrc, "utf-8");

          // Replace `@/utils/cn` with relative path to the local utils/cn folder
          const cnImportPath = isTsProject ? "../../utils/cn" : "../../utils/cn.js";
          componentCode = componentCode.replace(/@\/utils\/cn/g, cnImportPath);

          if (!isTsProject) {
            const transformed = babel.transformSync(componentCode, {
              presets: ["@babel/preset-typescript"],
              filename: path.basename(srcFilePath),
            });
            componentCode = transformed?.code || componentCode;
          }

          await fs.ensureDir(targetDir);
          await fs.writeFile(targetFile, componentCode, "utf-8");
          console.log(`✅ Created components/${componentData.category}/${filename}`);
          installedFiles.push(path.join("components", componentData.category, filename));
        }

        // 4. Update State tracking in config
        config.installed = config.installed || {};
        config.installed[compToInstall] = {
          files: installedFiles,
          utils: utilsList
        };

        await fs.writeJSON(configPath, config, { spaces: 2 });
        console.log(`🎉 ${componentData.name} installed successfully\n`);
      }

    } catch (err) {
      console.error("\n❌ Add failed\n", err);
    }
  });

/* =============================
   REMOVE COMMAND
============================= */
program
  .command("remove <component>")
  .description("Remove a component safely from your project")
  .action(async (component) => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, "pejay-ui.json");

      if (!await fs.pathExists(configPath)) {
        console.error("Error: pejay-ui.json not found.");
        process.exit(1);
      }

      const config = await fs.readJSON(configPath);
      const registryPath = path.join(packageRoot, "registry.json");

      if (!await fs.pathExists(registryPath)) {
        console.error("Error: Registry configuration not found.");
        process.exit(1);
      }

      const registry = await fs.readJSON(registryPath);
      const componentData = registry[component];

      if (!componentData) {
        console.log(`❌ "${component}" not found in registry`);
        return;
      }

      const installedData = config.installed?.[component];
      if (!installedData) {
        console.log(`❌ "${component}" is not marked as installed in pejay-ui.json`);
        return;
      }

      console.log("\n🧹 Starting removal...\n");

      // 1. Delete Component Files
      for (const relFile of installedData.files || []) {
        const fullPath = path.join(cwd, config.baseDir, relFile);
        if (await fs.pathExists(fullPath)) {
          await fs.remove(fullPath);
          console.log(`🗑️ Removed ${relFile}`);
        }
      }

      // 2. Build Utility Usage Map
      const utilityUsage = {};
      for (const [compName, compInfo] of Object.entries(config.installed)) {
        if (compName === component) continue; // Skip the one we are deleting
        for (const util of compInfo.utils || []) {
          utilityUsage[util] = (utilityUsage[util] || 0) + 1;
        }
      }

      // 3. Remove Unused Utilities
      const isTsProject = await fs.pathExists(path.join(cwd, "tsconfig.json"));
      const utilsToRemove = [];

      for (const utilFile of installedData.utils || []) {
        const usage = utilityUsage[utilFile] || 0;
        const utilExt = isTsProject ? "ts" : "js";
        const targetUtilFile = utilFile.replace(/\.ts$/, `.${utilExt}`);

        if (usage > 0) {
          console.log(`⛔ Skipping utils/${targetUtilFile} (used by other components)`);
          continue;
        }

        const { confirm } = await prompt([
          {
            type: "confirm",
            name: "confirm",
            message: `Remove utility "${targetUtilFile}"?`,
            default: false,
          },
        ]);

        if (confirm) {
          const fullUtilPath = path.join(cwd, config.baseDir, "utils", targetUtilFile);
          if (await fs.pathExists(fullUtilPath)) {
            await fs.remove(fullUtilPath);
            console.log(`🗑️ Removed utils/${targetUtilFile}`);
            utilsToRemove.push(utilFile);
          }
        }
      }

      // 4. Uninstall Unused Packages
      const packageUsage = {};
      for (const [compName, compInfo] of Object.entries(config.installed)) {
        if (compName === component) continue;
        const regData = registry[compName];
        if (regData?.peerDependencies) {
          for (const pkg of regData.peerDependencies) {
            packageUsage[pkg] = (packageUsage[pkg] || 0) + 1;
          }
        }
      }

      const pkgsToUninstall = [];
      if (componentData.peerDependencies) {
        for (const pkg of componentData.peerDependencies) {
          const usage = packageUsage[pkg] || 0;
          if (usage === 0) {
            pkgsToUninstall.push(pkg);
          }
        }
      }

      if (pkgsToUninstall.length > 0) {
        const { ok } = await prompt([
          {
            type: "confirm",
            name: "ok",
            message: `Uninstall unused packages: ${pkgsToUninstall.join(", ")}?`,
            default: false,
          },
        ]);

        if (ok) {
          console.log(`Uninstalling packages...`);
          execSync(`npm uninstall ${pkgsToUninstall.join(" ")}`, {
            cwd,
            stdio: "inherit",
          });
        }
      }

      // 5. Clean up config state
      delete config.installed[component];
      await fs.writeJSON(configPath, config, { spaces: 2 });

      console.log(`\n🎉 ${component} removed successfully\n`);

    } catch (err) {
      console.error("\n❌ Remove failed\n", err);
    }
  });

program.parse();
