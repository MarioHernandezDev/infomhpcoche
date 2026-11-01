// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import betterTailwindcss from 'eslint-plugin-better-tailwindcss'
import { getDefaultAttributes } from 'eslint-plugin-better-tailwindcss/api/defaults'

export default withNuxt(
  { ignores: ['android/**'] },
  betterTailwindcss.configs['correctness-error'],
  {
    rules: {
      'better-tailwindcss/no-unknown-classes': ['error', { ignore: ['^panel$', '^hud-label$', '^glow-text$', '^section-title$', '^hex$', '^hex-inner$'] }]
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: 'app/assets/css/main.css',
        attributes: [
          ...getDefaultAttributes(),
          ['^v-bind:ui$', [{ match: 'objectValues' }]]
        ]
      }
    }
  }
)
