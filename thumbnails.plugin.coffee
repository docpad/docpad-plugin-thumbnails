module.exports = (BasePlugin) ->

	gm = require('gm')
	pathUtil = require('path')
	fs = require('fs')
	balUtil = require('bal-util')

	class Thumbnails extends BasePlugin
		name: 'thumbnails'

		config:

			presets:

				'default':
					w: 150
					h: 150
					q: 85

				'tiny-square':
					w: 50
					h: 50

				'small-square':
					w: 150
					h: 150

				'medium-square':
					w: 300
					h: 300

				'large-square':
					w: 500
					h: 500

				'tiny-wide':
					w: 88
					h: 50

				'small-wide':
					w: 266
					h: 150

				'medium-wide':
					w: 533
					h: 300

				'large-wide':
					w: 888
					h: 500

			targets:

				'default': (img, args) ->
					return img
						.quality(args.q)
						.resize(args.w, args.h)

				'zoomcrop': (img, args) ->
					return img
						.quality(args.q)
						.gravity('Center')
						.resize(args.w, args.h, '^')
						.crop(args.w, args.h)

		thumbnailsToGenerate: null  # Object
		thumbnailsToGenerateLength: 0

		constructor: ->
			super
			@thumbnailsToGenerate = {}

		merge: (obj1, obj2) ->
			return balUtil.extend (balUtil.extend {}, obj1 ), obj2

		paramsToString: (params) ->
			str = ""
			if params.w?
				str += "w"+params.w
			if params.h?
				str += "h"+params.h
			if params.q?
				str += "q"+params.q
			return str

		extendTemplateData: ({templateData}) ->

			me = @
			config = @config

			templateData.getThumbnail = (src, args...) ->
				# return a thumbnail url, generating the image if necessary
# 				docpad.log 'info', "getThumbnail: src=#{src}"
				f = @getFileAtPath(src)
				if f
					srcPath = f.attributes.fullPath
					outDirPath = f.attributes.outDirPath
					relOutDirPath = f.attributes.relativeOutDirPath
					mtime = f.attributes.mtime
					basename = f.attributes.basename
					ext = f.attributes.extension

					# first check that file extension is a valid image format
					if ext not in ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']
						msg = "Thumbnail: source file extension '#{ext}' not recognised"
						docpad.error(msg)
						return ""

					# work out our target chain and params
					targets = []
					params = config.presets['default']
# 					console.log("parsing args")
					for a in args
# 						console.log("arg: ", a)
						if typeof a is 'object'
							# this is a params object
# 							console.log("got an object")
							params = me.merge params, a
						else if typeof a is 'function'
							# this is a function that should return a params object
# 							console.log("got a function")
							params = me.merge params, a()
						else
							# treat as a string
							# could be either a target or param preset
							if a of config.targets
								targets.push a
							else if a of config.presets
								params = me.merge params, config.presets[a]
							else
								docpad.log 'warn', "Thumbnail: unknown parameter '#{a}' for image '#{srcPath}'"

					if not targets.length
						t = config.targets["default"]
						if not (typeof t is 'function')
							# this is a reference to a different target
							if not (t of config.targets)
								docpad.error("Thumbnail: target name '#{t}' does not exist")
								return ""
							targets.push t
						else
							targets.push "default"

# 					docpad.log 'info', "Thumbnail: got target chain: ", targets
# 					docpad.log 'info', "Thumbnail: got params ", params

					sep = pathUtil.sep
					suffix = ".thumb_" + targets.join("_") + "_" + me.paramsToString(params)
					thumbfilename = basename + suffix + "." + ext
					dstPath = outDirPath + sep + thumbfilename
					targetUrl = "/" + relOutDirPath + "/" + thumbfilename

# 					docpad.log 'info', "Thumbnail: got dstPath '#{dstPath}'"
# 					docpad.log 'info', "Thumbnail: got targetUrl '#{targetUrl}'"

					# first check it's not already in our queue
					if not (dstPath of me.thumbnailsToGenerate)
						generate = false
						try
							# check if the thumbnail already exists and is up to date
							stats = fs.statSync(dstPath)
							if stats.mtime < mtime
								generate = true
						catch err
							generate = true

						if generate
							docpad.log 'info', require('util').format("getThumbnail: adding %s to queue", dstPath)

							# add to queue
							me.thumbnailsToGenerate[dstPath] = {
								dst: dstPath
								src: srcPath
								targets: targets
								params: params
							}
							me.thumbnailsToGenerateLength++


					return targetUrl

				return ""	# TODO: return error placeholder image?

			# Chain
			@

		writeAfter: (opts,next) ->

# 			console.log("Thumbnails: writeAfter")
# 			console.log(@thumbnailsToGenerate)

			me = @
			config = @config
			failures = 0

			unless @thumbnailsToGenerateLength
				docpad.log 'info', 'Thumbnails: nothing to generate'
				return next()

			docpad.log 'info', "Thumbnails is generating #{@thumbnailsToGenerateLength} thumbnails..."

			tasks = new balUtil.Group (err) =>
				docpad.log (if failures then 'warn' else 'info'),
					'Thumbnail generation complete',
					(if failures then "with #{failures} failures" else '')

				return next()

			# execute thumbnail generation queue

			balUtil.each @thumbnailsToGenerate, (item, dst) ->
				dstPath = dst
				srcPath = item.src
				targets = item.targets
				params = item.params

				docpad.log 'info', require('util').format("getThumbnail: generating %s", dstPath)

				tasks.push (complete) ->
					img = gm(srcPath)
					# execute the target chain
					for t in targets
						target_handler = config.targets[t]
						img = target_handler(img, params)
					img.write(dstPath, (err) ->
						# TODO: return error placeholder image if something went wrong?
						if err
							docpad.log 'warn', "Thumbnails failed to generate: #{dstPath}"
							docpad.error(err)
							++failures
						else
							docpad.log 'info', "getThumbnail: finished generating "+dstPath

						return complete()
					)

			tasks.async()

			# Chain
			@

		generateAfter: ->
			docpad.log 'info', 'Thumbnails: generateAfter'
			@thumbnailsToGenerate = {}
			@thumbnailsToGenerateLength = 0
