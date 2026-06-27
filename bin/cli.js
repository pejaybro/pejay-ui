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

// Helper to get all files recursively from a directory
const getFilesRecursively = async (dir) => {
  let results = [];
  const list = await fs.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (stat && stat.isDirectory()) {
      const subFiles = await getFilesRecursively(filePath);
      results = results.concat(subFiles);
    } else {
      results.push(filePath);
    }
  }
  return results;
};

/*
 * resolveTargetDir – single source of truth for where a component's files land.
 *
 * Priority:
 *   1. category === "scaffold"  →  src/<targetDirName|key>/
 *   2. outputDirectory present  →  <baseDir>/<outputDirectory>/
 *   3. default                  →  <baseDir>/components/<category>/
 */
const resolveTargetDir = (cwd, baseDir, compKey, compData) => {
  if (compData.category === "scaffold") {
    return path.join(cwd, "src", compData.targetDirName || compKey);
  }
  if (compData.outputDirectory) {
    return path.join(cwd, baseDir, compData.outputDirectory);
  }
  return path.join(cwd, baseDir, "components", compData.category);
};

const loadRegistry = async () => {
  const registryDir = path.join(packageRoot, "registry");
  if (!await fs.pathExists(registryDir)) {
    console.error(`Error: Registry directory not found at ${registryDir}`);
    process.exit(1);
  }
  const files = await fs.readdir(registryDir);
  const registry = {};
  for (const file of files) {
    if (file.endsWith(".json")) {
      const filePath = path.join(registryDir, file);
      try {
        const data = await fs.readJSON(filePath);
        Object.assign(registry, data);
      } catch (e) {
        console.error(`Error reading registry file: ${file}`, e);
      }
    }
  }
  return registry;
};
const pkg = await fs.readJSON(path.join(packageRoot, "package.json"));

program
  .name("pejay-ui")
  .description("CLI to initialize, add, and remove React UI components")
  .version(pkg.version);

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
  .option("--all", "Add all components in the category")
  .option("--select", "Select specific components from the category to add")
  .action(async (component, options) => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, "pejay-ui.json");

      if (!await fs.pathExists(configPath)) {
        console.error("Error: pejay-ui.json not found. Please run 'npx pejay-ui init' first.");
        process.exit(1);
      }

      const config = await fs.readJSON(configPath);
      const registry = await loadRegistry();
      const isTsProject = await fs.pathExists(path.join(cwd, "tsconfig.json"));

      // Determine which components to install
      let selectedComponents = [];

      // Determine if the input refers to a category that supports category-wide operations
      const categorySupportMap = {};
      for (const [key, compData] of Object.entries(registry)) {
        if (compData.category && compData.supportsCategory) {
          categorySupportMap[compData.category.toLowerCase()] = compData.category;
        }
      }

      const getCategoryFromInput = (input, supportMap) => {
        const normInput = input.toLowerCase().trim().replace(/s$/, "");
        for (const [normCat, originalCat] of Object.entries(supportMap)) {
          const normCatSingular = normCat.replace(/s$/, "");
          if (normInput === normCatSingular || (normInput === "dropdown" && normCatSingular === "select-dropdown")) {
            return originalCat;
          }
        }
        return null;
      };

      const targetCategory = getCategoryFromInput(component, categorySupportMap);
      const isExactComponent = !!registry[component];

      if (targetCategory && (!isExactComponent || options.all || options.select)) {
        // Treat as category installation
        const categoryComponents = Object.keys(registry).filter(
          (key) => registry[key].category === targetCategory
        );

        if (categoryComponents.length === 0) {
          console.error(`Error: Category '${component}' has no components in the registry.`);
          process.exit(1);
        }

        if (options.all) {
          selectedComponents = categoryComponents;
        } else {
          // Dynamic prompt using inquirer checkbox for --select or when no flag is specified for category
          const answers = await prompt([
            {
              type: "checkbox",
              name: "components",
              message: `Select components from category "${targetCategory}" to add:`,
              choices: categoryComponents.map((key) => ({
                name: `${registry[key].name} (${key})`,
                value: key,
              })),
            },
          ]);
          selectedComponents = answers.components;
          if (selectedComponents.length === 0) {
            console.log("No components selected. Exiting.");
            process.exit(0);
          }
        }
      } else {
        // Not a category (or exact component targeted without category flags), treat as a single component key
        if (!isExactComponent) {
          console.error(`Error: Component or Category '${component}' not found in registry.`);
          console.log(`Available categories/components: ${Array.from(new Set(Object.values(registry).map(c => c.category).filter(Boolean))).join(", ")} or ${Object.keys(registry).join(", ")}`);
          process.exit(1);
        }
        selectedComponents = [component];
      }

      // Track all components to install (including dependencies) in topological/order of dependencies
      const installQueue = [];
      const visited = new Set();

      const resolveDependencies = (compName) => {
        if (visited.has(compName)) return;
        visited.add(compName);

        const compData = registry[compName];
        if (!compData) {
          console.error(`Error: Component '${compName}' not found in registry.`);
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

      for (const comp of selectedComponents) {
        resolveDependencies(comp);
      }

      console.log("\n🚀 Starting installation...\n");

      for (const compToInstall of installQueue) {
        // Skip if already marked as installed in config (unless it is one of the explicitly requested components)
        if (config.installed?.[compToInstall] && !selectedComponents.includes(compToInstall)) {
          console.log(`Component '${compToInstall}' is already installed. Skipping dependency installation.`);
          continue;
        }

        const componentData = registry[compToInstall];

        // Check if the component is already installed or if any target files already exist
        const outputExt = isTsProject ? "tsx" : "jsx";
        let isAlreadyPresent = !!config.installed?.[compToInstall];

        if (!isAlreadyPresent) {
          let targetDir = resolveTargetDir(cwd, config.baseDir, compToInstall, componentData);

          const sourceFiles = componentData.files || (componentData.path ? [componentData.path] : []);
          for (const srcFilePath of sourceFiles) {
            const templateSrc = path.join(packageRoot, srcFilePath);
            if (await fs.pathExists(templateSrc)) {
              const isDir = (await fs.stat(templateSrc)).isDirectory();
              if (isDir) {
                const allFiles = await getFilesRecursively(templateSrc);
                for (const file of allFiles) {
                  const relativePath = path.relative(templateSrc, file);
                  const filename = relativePath.replace(/\.(tsx|ts)$/, (match) => {
                    return match === ".tsx" ? `.${outputExt}` : `.${isTsProject ? "ts" : "js"}`;
                  });
                  const targetFile = path.join(targetDir, filename);
                  if (await fs.pathExists(targetFile)) {
                    isAlreadyPresent = true;
                    break;
                  }
                }
              } else {
                const filename = path.basename(srcFilePath).replace(/\.(tsx|ts)$/, (match) => {
                  return match === ".tsx" ? `.${outputExt}` : `.${isTsProject ? "ts" : "js"}`;
                });
                const targetFile = path.join(targetDir, filename);
                if (await fs.pathExists(targetFile)) {
                  isAlreadyPresent = true;
                }
              }
            }
            if (isAlreadyPresent) break;
          }
        }

        if (isAlreadyPresent) {
          const { overwrite } = await prompt([
            {
              type: "confirm",
              name: "overwrite",
              message: `Component '${compToInstall}' is already present in your project. Overwriting it will discard any local changes you have made. Do you want to proceed and overwrite it?`,
              default: false,
            },
          ]);

          if (!overwrite) {
            console.log(`Skipping component: ${componentData.name}.\n`);
            continue;
          }
        }

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
          console.log(`Missing required package dependencies: ${missingDependencies.join(", ")}`);
          console.log(`Installing missing dependencies...`);

          let installCmd = `npm install ${missingDependencies.join(" ")}`;
          if (await fs.pathExists(path.join(cwd, "yarn.lock"))) {
            installCmd = `yarn add ${missingDependencies.join(" ")}`;
          } else if (await fs.pathExists(path.join(cwd, "pnpm-lock.yaml"))) {
            installCmd = `pnpm add ${missingDependencies.join(" ")}`;
          }

          try {
            execSync(installCmd, { cwd, stdio: "inherit" });
            console.log(`\nDependencies installed successfully!\n`);
          } catch (error) {
            console.error(`\nFailed to automatically install dependencies. Please run: ${installCmd}`);
            process.exit(1);
          }
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
        let targetDir = resolveTargetDir(cwd, config.baseDir, compToInstall, componentData);

        // Determine list of files to copy
        const sourceFiles = componentData.files || (componentData.path ? [componentData.path] : []);
        const installedFiles = [];

        for (const srcFilePath of sourceFiles) {
          const templateSrc = path.join(packageRoot, srcFilePath);
          if (!await fs.pathExists(templateSrc)) {
            console.error(`Error: Template file does not exist at ${templateSrc}`);
            process.exit(1);
          }

          const isDir = (await fs.stat(templateSrc)).isDirectory();
          if (isDir) {
            const allFiles = await getFilesRecursively(templateSrc);
            for (const file of allFiles) {
              const relativePath = path.relative(templateSrc, file);
              const filename = relativePath.replace(/\.(tsx|ts)$/, (match) => {
                return match === ".tsx" ? `.${outputExt}` : `.${isTsProject ? "ts" : "js"}`;
              });
              const targetFile = path.join(targetDir, filename);

              let componentCode = await fs.readFile(file, "utf-8");

              const fileDir = path.dirname(targetFile);
              const relativeToUtils = path.relative(fileDir, targetUtilsDir).replace(/\\/g, "/");
              const cnImportPath = isTsProject 
                ? `${relativeToUtils}/cn` 
                : `${relativeToUtils}/cn.js`;
              componentCode = componentCode.replace(/@\/utils\/cn/g, cnImportPath);

              if (!isTsProject) {
                const transformed = babel.transformSync(componentCode, {
                  presets: ["@babel/preset-typescript"],
                  filename: path.basename(file),
                });
                componentCode = transformed?.code || componentCode;
              }

              await fs.ensureDir(path.dirname(targetFile));
              await fs.writeFile(targetFile, componentCode, "utf-8");
              
              const relativeTargetFile = path.relative(cwd, targetFile).replace(/\\/g, "/");
              console.log(`✅ Created ${relativeTargetFile}`);
              installedFiles.push(path.relative(path.join(cwd, config.baseDir), targetFile).replace(/\\/g, "/"));
            }
          } else {
            const filename = path.basename(srcFilePath).replace(/\.(tsx|ts)$/, (match) => {
              return match === ".tsx" ? `.${outputExt}` : `.${isTsProject ? "ts" : "js"}`;
            });
            const targetFile = path.join(targetDir, filename);

            let componentCode = await fs.readFile(templateSrc, "utf-8");

            const fileDir = path.dirname(targetFile);
            const relativeToUtils = path.relative(fileDir, targetUtilsDir).replace(/\\/g, "/");
            const cnImportPath = isTsProject 
              ? `${relativeToUtils}/cn` 
              : `${relativeToUtils}/cn.js`;
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
            
            const relativeTargetFile = path.relative(cwd, targetFile).replace(/\\/g, "/");
            console.log(`✅ Created ${relativeTargetFile}`);
            installedFiles.push(path.relative(path.join(cwd, config.baseDir), targetFile).replace(/\\/g, "/"));
          }
        }

        // 3.5 Automatically generate/update category-level and global index.ts/index.js files
        if (componentData.category && !["scaffold", "scaffolds", "script", "scripts"].includes(componentData.category.toLowerCase())) {
          const indexExt = isTsProject ? "ts" : "js";
          const filesInDir = await fs.readdir(targetDir);
          const exportableFiles = [];

          for (const file of filesInDir) {
            const filePath = path.join(targetDir, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              const ext = path.extname(file);
              const name = path.basename(file, ext);
              if ((ext === ".tsx" || ext === ".ts" || ext === ".jsx" || ext === ".js") && name !== "index") {
                exportableFiles.push(name);
              }
            }
          }

          if (exportableFiles.length > 0) {
            exportableFiles.sort();
            const indexFilePath = path.join(targetDir, `index.${indexExt}`);
            const exportLines = exportableFiles.map(name => `export * from "./${name}";`);
            await fs.writeFile(indexFilePath, exportLines.join("\n") + "\n", "utf-8");
            console.log(`✅ Updated index.${indexExt} in ${path.relative(cwd, targetDir)}`);

            // Also update the global components index file
            const componentsDir = path.dirname(targetDir); // src/pejay-ui/components
            if (await fs.pathExists(componentsDir)) {
              const categories = await fs.readdir(componentsDir);
              const validCategories = [];
              for (const cat of categories) {
                const catDir = path.join(componentsDir, cat);
                const catStat = await fs.stat(catDir);
                if (catStat.isDirectory()) {
                  if (await fs.pathExists(path.join(catDir, `index.ts`)) || await fs.pathExists(path.join(catDir, `index.js`))) {
                    validCategories.push(cat);
                  }
                }
              }
              if (validCategories.length > 0) {
                validCategories.sort();
                const globalIndexFile = path.join(componentsDir, `index.${indexExt}`);
                const globalExportLines = validCategories.map(cat => `export * from "./${cat}";`);
                await fs.writeFile(globalIndexFile, globalExportLines.join("\n") + "\n", "utf-8");
                console.log(`✅ Updated global index.${indexExt} in ${path.relative(cwd, componentsDir)}`);
              }
            }
          }
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
      const registry = await loadRegistry();
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

      // 1.5 Update index files
      if (componentData.category && !["scaffold", "scaffolds", "script", "scripts"].includes(componentData.category.toLowerCase())) {
        const isTsProject = await fs.pathExists(path.join(cwd, "tsconfig.json"));
        const targetDir = resolveTargetDir(cwd, config.baseDir, component, componentData);
        const indexExt = isTsProject ? "ts" : "js";
        
        if (await fs.pathExists(targetDir)) {
          const filesInDir = await fs.readdir(targetDir);
          const exportableFiles = [];
          
          for (const file of filesInDir) {
            const filePath = path.join(targetDir, file);
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              const ext = path.extname(file);
              const name = path.basename(file, ext);
              if ((ext === ".tsx" || ext === ".ts" || ext === ".jsx" || ext === ".js") && name !== "index") {
                exportableFiles.push(name);
              }
            }
          }

          const indexFilePath = path.join(targetDir, `index.${indexExt}`);
          if (exportableFiles.length > 0) {
            exportableFiles.sort();
            const exportLines = exportableFiles.map(name => `export * from "./${name}";`);
            await fs.writeFile(indexFilePath, exportLines.join("\n") + "\n", "utf-8");
            console.log(`✅ Updated index.${indexExt} in ${path.relative(cwd, targetDir)}`);
          } else {
            // No files left, delete the category index file
            if (await fs.pathExists(indexFilePath)) {
              await fs.remove(indexFilePath);
              console.log(`🗑️ Removed empty index.${indexExt} in ${path.relative(cwd, targetDir)}`);
            }
          }

          // Also update the global components index file
          const componentsDir = path.dirname(targetDir);
          if (await fs.pathExists(componentsDir)) {
            const categories = await fs.readdir(componentsDir);
            const validCategories = [];
            for (const cat of categories) {
              const catDir = path.join(componentsDir, cat);
              const catStat = await fs.stat(catDir);
              if (catStat.isDirectory()) {
                if (await fs.pathExists(path.join(catDir, `index.ts`)) || await fs.pathExists(path.join(catDir, `index.js`))) {
                  validCategories.push(cat);
                }
              }
            }
            const globalIndexFile = path.join(componentsDir, `index.${indexExt}`);
            if (validCategories.length > 0) {
              validCategories.sort();
              const globalExportLines = validCategories.map(cat => `export * from "./${cat}";`);
              await fs.writeFile(globalIndexFile, globalExportLines.join("\n") + "\n", "utf-8");
              console.log(`✅ Updated global index.${indexExt} in ${path.relative(cwd, componentsDir)}`);
            } else {
              // No categories left with index files, remove the global index
              if (await fs.pathExists(globalIndexFile)) {
                await fs.remove(globalIndexFile);
                console.log(`🗑️ Removed empty global index.${indexExt} in ${path.relative(cwd, componentsDir)}`);
              }
            }
          }
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

/* =============================
   STATUS COMMAND
============================= */
program
  .command("status")
  .description("List all available components and check their installation status")
  .action(async () => {
    try {
      const cwd = process.cwd();
      const configPath = path.join(cwd, "pejay-ui.json");

      let config = { installed: {} };
      let hasConfig = true;

      if (!await fs.pathExists(configPath)) {
        hasConfig = false;
      } else {
        try {
          config = await fs.readJSON(configPath);
        } catch (e) {
          hasConfig = false;
        }
      }

      const registry = await loadRegistry();

      // Terminal styling colors
      const GREEN = "\x1b[32m";
      const CYAN = "\x1b[36m";
      const DIM = "\x1b[2m";
      const RESET = "\x1b[0m";
      const YELLOW = "\x1b[33m";

      console.log(`\n🔍 ${CYAN}pejay-ui Components Status:${RESET}\n`);

      if (!hasConfig) {
        console.log(`${YELLOW}Note: pejay-ui.json not found. Initialize first via 'npx pejay-ui init'.${RESET}`);
        console.log(`${YELLOW}Showing all components as uninstalled.${RESET}\n`);
      }

      // Group registry items by category
      const categories = {};
      for (const [key, compData] of Object.entries(registry)) {
        const category = compData.category || "other";
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({
          key,
          name: compData.name,
          installed: !!config.installed?.[key]
        });
      }

      // Print categories and components sorted alphabetically
      const sortedCategoryNames = Object.keys(categories).sort();
      for (const cat of sortedCategoryNames) {
        console.log(`${CYAN}Category: ${cat}${RESET}`);
        const comps = categories[cat];
        comps.sort((a, b) => a.name.localeCompare(b.name));

        for (const comp of comps) {
          if (comp.installed) {
            console.log(`  ${GREEN}[✔] ${comp.name}${RESET} ${DIM}(${comp.key})${RESET}`);
          } else {
            console.log(`  [ ] ${comp.name} ${DIM}(${comp.key})${RESET}`);
          }
        }
        console.log(); // blank line between categories
      }

    } catch (err) {
      console.error("\n❌ Status display failed\n", err);
    }
  });

program.parse();
