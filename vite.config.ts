import { rmSync } from 'node:fs'
import { defineConfig } from 'vite'
import { join } from 'path'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import htmlBanner from 'vite-plugin-html-banner'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync('dist-electron', { recursive: true, force: true })

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    base: isBuild ? '' : '/',
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['webview'].includes(tag)
          }
        }
      }),
      vueSetupExtend(),
      htmlBanner([
        '',
        `\tname: ${pkg.description}`,
        `\tversion: ${pkg.version}`,
        `\tbuild: ${new Date().toLocaleString()}`,
        ''
      ]),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'electron/main/index.ts',
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */
                '[startup] Electron App'
              )
            } else {
              options.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                ),
                output: {
                  chunkFileNames: '[name].js',
                  manualChunks: (id) => {
                    if (/\/electron\/main\/(\S+)\//.test(id)) {
                      const [, name] = id.match(/\/electron\/main\/(\S+)\//)
                      return name
                    }
                    if (/\/electron\/main\/env/.test(id)) {
                      return 'app-env'
                    }
                    if (id.includes('tailwindcss')) {
                      return 'tailwindcss'
                    }
                    if (id.includes('node_modules')) {
                      return 'vendor'
                    }
                  }
                }
              }
            }
          }
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {}
                )
              }
            }
          }
        }
      ]),
      // Use Node.js API in the Renderer-process
      renderer()
    ],
    resolve: {
      alias: {
        '/@/': join(__dirname, 'src') + '/'
      }
    },
    server: process.env.VSCODE_DEBUG
      ? { host: '127.0.0.1', port: 3344 }
      : { port: 12121 },
    clearScreen: false,
    build: {
      chunkSizeWarningLimit: 1024,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('@arco-design/web-vue')) {
              return 'arco-design-vue'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
