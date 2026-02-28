import { defineConfig } from 'tsup'

export default defineConfig((options) => {
	const isDev = process.env.NODE_ENV === 'development'
	console.debug('isDev:', isDev, 'options.env:', options.env)
	return {
		clean: isDev,
		dts: true,
		entry: {
			index: 'src/index.ts',
			react: 'src/export/react.ts',
		},
		format: ['cjs', 'esm'], // Output formats
		minify: !isDev,
		sourcemap: isDev,
		watch: isDev,
	}
})
