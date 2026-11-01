export default defineAppConfig({
  ui: {
    colors: {
      primary: 'red',
      neutral: 'zinc'
    },
    button: {
      slots: { base: 'rounded-full' },
      defaultVariants: { size: 'lg' }
    },
    badge: {
      variants: { size: { sm: { base: 'rounded-full px-2.5' }, md: { base: 'rounded-full px-3' } } }
    },
    input: {
      slots: { base: 'rounded-full' },
      variants: { size: { xl: { base: 'px-6' } } }
    },
    select: {
      slots: { base: 'rounded-full' },
      variants: { size: { xl: { base: 'px-6' } } }
    },
    card: {
      slots: {
        root: 'panel ring-0 divide-y-0 shadow-none',
        body: 'p-5 sm:p-6'
      }
    }
  }
})
