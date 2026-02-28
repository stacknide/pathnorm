import assert from 'node:assert/strict'
import test from 'node:test'
import { np, unixNp } from '@knide/pathnorm'

const cases = [
	{
		args: ['https://a', 'bc.def//212/', 'dw//we', '23123', 'https://a'],
		expected: 'https://a/bc.def/212/dw/we/23123/https:/a',
		name: 'URL with scheme + trailing URL-like segment',
	},
	{
		args: ['https://abc.def//212/', 'dw//we', '23123'],
		expected: 'https://abc.def/212/dw/we/23123',
		name: 'URL with scheme',
	},
	{
		args: ['abc.def//212/', 'dwwe', '23123'],
		expected: 'abc.def/212/dwwe/23123',
		name: 'POSIX path (no scheme, no leading slash)',
	},
	{
		args: ['foo//bar', '/baz'],
		expected: '/foo/bar/baz',
		name: 'POSIX path',
	},
	{
		args: ['/foo//bar', 'baz'],
		expected: '/foo/bar/baz',
		name: 'POSIX path with leading slash',
	},
	{
		args: ['exp://abc.def//212/', 'dw/we'],
		expected: 'exp://abc.def/212/dw/we',
		name: 'Custom scheme',
	},
	{
		args: [String.raw`C:\foo\\bar`, 'baz'],
		expected: String.raw`C:\foo\bar\baz`,
		name: 'Win32 drive letter',
	},
	{
		args: [String.raw`C:\foo//bar\\baz`],
		expected: String.raw`C:\foo\bar\baz`,
		name: 'Win32 mixed slashes',
	},
	{
		args: [String.raw`\\server\share\\folder`, 'file.txt'],
		expected: '//server/share/folder/file.txt',
		name: 'UNC path',
	},
	{
		args: [String.raw`\\?\C:\foo\\bar`, 'baz'],
		expected: '//?/C:/foo/bar/baz',
		name: 'Win32 namespace path',
	},
	{
		args: ['exp://', 'sdfasdf', 'abc.def//212/', 'dw//we', '23123', 'https://'],
		expected: 'exp://sdfasdf/abc.def/212/dw/we/23123/https:/',
		name: 'Multiple URL-like segments (only first scheme treated as prefix)',
	},
	{ args: [], expected: '', name: 'Empty input list' },
	{ args: [''], expected: '', name: 'Single empty segment' },
	{ args: ['', 'foo'], expected: '/foo', name: 'Empty then segment' },
	{ args: ['foo', ''], expected: 'foo/', name: 'Segment then empty' },
	{ args: ['', '', ''], expected: '/', name: 'All empty segments' },
	{ args: ['foo/bar/'], expected: 'foo/bar/', name: 'Trailing slash preserved in path' },
	{ args: ['https://a.com/'], expected: 'https://a.com/', name: 'Trailing slash preserved in URL' },
	{ args: ['foo'], expected: 'foo', name: 'Single plain segment' },
	{ args: ['/foo'], expected: '/foo', name: 'Single leading-slash segment' },
	{ args: ['https://foo.com'], expected: 'https://foo.com', name: 'Single URL segment' },
	{
		args: ['foo', 'bar', '/baz'],
		expected: '/foo/bar/baz',
		name: 'Leading slash introduced by third segment',
	},
	{ args: ['https://', 'foo', 'bar'], expected: 'https://foo/bar', name: 'URL with empty host' },
	{
		args: ['foo', '///', 'bar'],
		expected: '/foo/bar',
		name: 'Middle segment contains only slashes',
	},
	{ args: ['foo', '//'], expected: '/foo/', name: 'Trailing segment contains only slashes' },
]

for (const { name, args, expected } of cases) {
	test(`np: ${name}`, () => {
		const output = np(...args)
		assert.equal(
			output,
			expected,
			`args=${JSON.stringify(args)} expected=${expected} got=${output}`
		)
	})
}

const unixNpCases = [
	{
		args: [String.raw`C:\foo\\bar`, 'baz'],
		expected: 'C:/foo/bar/baz',
		name: 'Converts Win32 drive path to unix separators',
	},
	{
		args: [String.raw`\\server\share`, 'file.txt'],
		expected: '//server/share/file.txt',
		name: 'Converts UNC path to unix separators',
	},
	{
		args: ['/already/unix//path'],
		expected: '/already/unix/path',
		name: 'Normalizes existing unix path',
	},
]

for (const { name, args, expected } of unixNpCases) {
	test(`unixNp: ${name}`, () => {
		const output = unixNp(...args)
		assert.equal(
			output,
			expected,
			`args=${JSON.stringify(args)} expected=${expected} got=${output}`
		)
	})
}
