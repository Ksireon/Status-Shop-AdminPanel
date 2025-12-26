import nextConfig from 'eslint-config-next'

const config = [
  ...nextConfig,
  {
    ignores: ['scripts/**'],
  },
]

export default config
