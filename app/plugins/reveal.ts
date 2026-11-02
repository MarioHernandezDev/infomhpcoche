import gsap from 'gsap'

/**
 * v-reveal: el elemento entra deslizándose desde el borde izquierdo.
 * Con un número (v-reveal="i") escalona la entrada en listas.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement, { value }) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(el, {
        x: -24,
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        delay: 0.03 + Math.min(Number(value) || 0, 6) * 0.04,
        clearProps: 'transform,opacity'
      })
    },
    getSSRProps: () => ({})
  })
})
