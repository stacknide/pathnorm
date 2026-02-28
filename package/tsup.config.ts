import { defineConfig } from 'tsup'

export default defineConfig((options) => {
	const isDev = process.env.NODE_ENV === 'development'
	console.debug('isDev:', isDev, 'options.env:', options.env)
	return {
		clean: isDev,
		dts: true,
		entry: {
			index: 'src/index.ts',
			posix: 'src/posix.ts',
		},
		format: ['cjs', 'esm'], // Output formats
		minify: !isDev,
		sourcemap: isDev,
		watch: isDev,
	}
})
