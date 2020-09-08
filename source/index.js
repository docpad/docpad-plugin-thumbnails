/* eslint-disable class-methods-use-this */
'use strict'

const gm = require('gm')
const pathUtil = require('path')
const fs = require('fs')
// @ts-ignore
const { TaskGroup } = require('taskgroup')
// @ts-ignore
const BasePlugin = require('docpad-baseplugin')

function paramsToString(params) {
	let str = ''
	if (params.w != null) {
		str += 'w' + params.w
	}
	if (params.h != null) {
		str += 'h' + params.h
	}
	if (params.q != null) {
		str += 'q' + params.q
	}
	return str
}

module.exports = class Thumbnails extends BasePlugin {
	// @ts-ignore
	get name() {
		return 'thumbnails'
	}

	// @ts-ignore
	get initialConfig() {
		return {
			presets: {
				default: {
					w: 150,
					h: 150,
					q: 85,
				},

				'tiny-square': {
					w: 50,
					h: 50,
				},

				'small-square': {
					w: 150,
					h: 150,
				},

				'medium-square': {
					w: 300,
					h: 300,
				},

				'large-square': {
					w: 500,
					h: 500,
				},

				'tiny-wide': {
					w: 88,
					h: 50,
				},

				'small-wide': {
					w: 266,
					h: 150,
				},

				'medium-wide': {
					w: 533,
					h: 300,
				},

				'large-wide': {
					w: 888,
					h: 500,
				},
			},

			targets: {
				default(img, args) {
					return img.quality(args.q).resize(args.w, args.h)
				},

				zoomcrop(img, args) {
					return img
						.quality(args.q)
						.gravity('Center')
						.resize(args.w, args.h, '^')
						.crop(args.w, args.h)
				},
			},

			imageMagick: false,
			extensions: ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG'],
		}
	}

	extendTemplateData({ templateData }) {
		// Prepare
		const me = this
		// @ts-ignore
		const { docpad } = this
		// @ts-ignore
		const config = this.getConfig()

		// Apply
		templateData.getThumbnail = function getThumbnail(src, ...args) {
			const { thumbnailsToGenerate } = me

			// return a thumbnail url, generating the image if necessary
			docpad.log('debug', `getThumbnail: src=${src}`)
			const f = this.getFileAtPath(src)
			if (f) {
				const srcPath = f.attributes.fullPath
				const outDirPath = f.attributes.outDirPath
				const relOutDirPath = f.attributes.relativeOutDirPath
				const mtime = f.attributes.mtime
				const basename = f.attributes.basename
				const ext = f.attributes.extension

				// first check that file extension is a valid image format
				if (config.extensions.includes(ext) === false) {
					docpad.error(
						`Thumbnail: source file extension [${ext}] not recognised`
					)
					return ''
				}

				// work out our target chain and params
				const targets = []
				const params = config.presets.default || {}
				for (const a of args) {
					if (typeof a === 'object') {
						// this is a params object
						Object.assign(params, a)
					} else if (typeof a === 'function') {
						// this is a function that should return a params object
						Object.assign(params, a())
					} else if (config.targets[a] != null) {
						targets.push(a)
					} else if (config.presets[a] != null) {
						Object.assign(params, config.presets[a])
					} else {
						docpad.log(
							'warn',
							`thumbnails::getThumbnail: unknown parameter [${a}] for image [${srcPath}]`
						)
					}
				}

				if (targets.length === 0) {
					const t = config.targets.default
					if (typeof t !== 'function') {
						// this is a reference to a different target
						if (config.targets[t] == null) {
							docpad.error(
								`thumbnails::getThumbnail: target name [${t}] does not exist`
							)
							return ''
						}
						targets.push(t)
					} else {
						targets.push('default')
					}
				}

				const sep = pathUtil.sep
				const suffix =
					'.thumb_' + targets.join('_') + '_' + paramsToString(params)
				const thumbfilename = basename + suffix + '.' + ext
				const dstPath = outDirPath + sep + thumbfilename
				let targetUrl = '/'
				if (relOutDirPath && relOutDirPath.length) {
					targetUrl += relOutDirPath + '/'
				}
				targetUrl += thumbfilename

				docpad.log('debug', `thumbnails: got dstPath: ${dstPath}`)
				docpad.log('debug', `thumbnails: got targetUrl: ${targetUrl}`)

				// first check it's not already in our queue
				if (thumbnailsToGenerate.has(dstPath) === false) {
					let generate = false
					try {
						// check if the thumbnail already exists and is up to date
						const stats = fs.statSync(dstPath)
						if (stats.mtime < mtime) {
							generate = true
						}
					} catch (err) {
						generate = true
					}

					if (generate) {
						docpad.log(
							'info',
							`thumbnails::getThumbnail: adding [${dstPath}] to queue`
						)

						// add to queue
						thumbnailsToGenerate.set(dstPath, {
							dst: dstPath,
							src: srcPath,
							targets,
							params,
						})
					}
				}

				return targetUrl
			}

			return '' // TODO: return error placeholder image?
		}
	}

	// @ts-ignore
	writeAfter(opts, next) {
		// Prepare
		// @ts-ignore
		const { docpad, thumbnailsToGenerate } = this
		// @ts-ignore
		const config = this.getConfig()
		let failures = 0

		if (thumbnailsToGenerate.size === 0) {
			docpad.log('debug', 'thumbnails: nothing to generate')
			return next()
		}

		docpad.log(
			'debug',
			`thumbnails is generating [${thumbnailsToGenerate.size}] thumbnails...`
		)

		// @ts-ignore
		const tasks = new TaskGroup({ concurrency: 1 }).done(function (err) {
			docpad.log(
				failures ? 'warn' : 'info',
				'thumbnail generation complete',
				failures ? `with [${failures}] failures` : ''
			)
			return next(err)
		})

		// execute thumbnail generation queue
		for (const [dstPath, item] of Object.entries(
			thumbnailsToGenerate.entries()
		)) {
			const srcPath = item.src
			const targets = item.targets
			const params = item.params

			docpad.log('debug', `thumbnails::getThumbnail: generating: ${dstPath}`)

			// eslint-disable-next-line no-loop-func
			tasks.addTask(function (complete) {
				let img
				if (config.imageMagick) {
					const im = gm.subClass({ imageMagick: true })
					img = im(srcPath)
				} else {
					img = gm(srcPath)
				}

				// execute the target chain
				for (const t of targets) {
					const targetHandler = config.targets[t]
					img = targetHandler(img, params)
				}
				img.write(dstPath, function (err) {
					// TODO: return error placeholder image if something went wrong?
					if (err) {
						docpad.log('warn', `thumbnails failed to generate: ${dstPath}`)
						docpad.error(err)
						++failures
					} else {
						docpad.log(
							'debug',
							`thumbnails::getThumbnail: finished generating: ${dstPath}`
						)
					}
					return complete(err)
				})
			})
		}

		tasks.run()
	}

	generateBefore() {
		// reset
		if (this.thumbnailsToGenerate) {
			this.thumbnailsToGenerate.clear()
		} else {
			this.thumbnailsToGenerate = new Map()
		}
	}

	generateAfter() {
		// reset
		this.thumbnailsToGenerate.clear()
	}
}
