'use strict'

# Test our plugin using DocPad's Testers
module.exports = require('docpad-plugintester').test({}, {
	logLevel: 5,
	ignoreCustomPatterns: /(~$)|(.kate-swp$)/,
	enabledPlugins: {
		'thumbnails': true,
		'eco': true
	},
	plugins: {
		thumbnails: {
			presets: {
				'high-quality': {
					q: 99
				},
				'blog': {
					q: 95,
					w: 500,
					h: 500
				}
			},
			targets: {
				sepia: (img, args) ->
					return img.sepia()
				rotateleft: (img, args) ->
					return img.rotate('black', -90)
			}
		}
	}
})

