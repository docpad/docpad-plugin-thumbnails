<!-- TITLE/ -->

<h1>docpad-plugin-thumbnails</h1>

<!-- /TITLE -->


<!-- BADGES/ -->

<span class="badge-travisci"><a href="http://travis-ci.org/docpad/docpad-plugin-thumbnails" title="Check this project's build status on TravisCI"><img src="https://img.shields.io/travis/docpad/docpad-plugin-thumbnails/master.svg" alt="Travis CI Build Status" /></a></span>
<span class="badge-npmversion"><a href="https://npmjs.org/package/docpad-plugin-thumbnails" title="View this project on NPM"><img src="https://img.shields.io/npm/v/docpad-plugin-thumbnails.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/docpad-plugin-thumbnails" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/docpad-plugin-thumbnails.svg" alt="NPM downloads" /></a></span>
<span class="badge-daviddm"><a href="https://david-dm.org/docpad/docpad-plugin-thumbnails" title="View the status of this project's dependencies on DavidDM"><img src="https://img.shields.io/david/docpad/docpad-plugin-thumbnails.svg" alt="Dependency Status" /></a></span>
<span class="badge-daviddmdev"><a href="https://david-dm.org/docpad/docpad-plugin-thumbnails#info=devDependencies" title="View the status of this project's development dependencies on DavidDM"><img src="https://img.shields.io/david/dev/docpad/docpad-plugin-thumbnails.svg" alt="Dev Dependency Status" /></a></span>
<br class="badge-separator" />
<span class="badge-githubsponsors"><a href="https://github.com/sponsors/balupton" title="Donate to this project using GitHub Sponsors"><img src="https://img.shields.io/badge/github-donate-yellow.svg" alt="GitHub Sponsors donate button" /></a></span>
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

DocPad plugin to generate thumbnails from your associated image files

<!-- /DESCRIPTION -->





Install either [GraphicsMagick](http://www.graphicsmagick.org/) or [ImageMagick](http://www.imagemagick.org/), and then:

### ImageMagick

To specify the use of ImageMagick, rather than GraphicsMagick, you need to add the following configuration setting in your docpad configuration:

```
plugins:
	thumbnails:
		imageMagick: true
```

## Usage

### Basic Usage

Use the `@getThumbnail(path, [options...])` function in your templates.

`path` is the path of your image file, relative to the `files` directory.

`options...` are optional parameters, discussed below.

The `@getThumbnail()` call will return the url to the thumbnail image.

### Basic Example

We could create the document `mydocument.html.eco` containing the following:

```
<img src="<%= @getThumbnail("images/image1.jpg", { w: 100, h: 100 }) %>"  alt="my image">
```

Where `image1.jpg` is in the `src/files/images/` directory.

This will run the default resize operation which will fit the image into the given maximum boundaries, in this case 100x100 pixels.

On site generation, the file `out/images/image1.thumb_default_w100h100q85.jpg` will be created. It will also be updated whenever the source image `src/files/images/image1.jpg` changes.

### AssociatedFiles Example

The Thumbnails plugin works well with the [AssociatedFiles](http://docpad.org/plugin/associatedfiles) plugin. The example below (this time in _coffeekup_) will display 100x100 thumbnails of all images associated with the document using the AssociatedFiles plugin, with a link to the full-size image:

```
image_exts = ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG']
images = @getDocument().getAssociatedFiles().findAll({extension: $in: image_exts}).toJSON()
for image in images
	a href: image.url, -> img src: @getThumbnail(image.url, w: 100, h: 100), alt: image.name
```

## Configuration

### Options

The optional arguments to `@getThumbnail` can be one or more of the following:

-   an object containing parameters to pass to the target.
-   a string to specify a preset
-   a string to specify a target

### Image Parameters

There are 3 different image parameters you can specify:

-   _w_ for the width of the image
-   _h_ for the height of the image
-   _q_ for the JPEG quality setting

Parameters can be set using the object form shown in the examples above, or via presets, discussed below.

### Presets

Presets are basically aliases for a set of image parameters that you can define in your docpad configuration. Using presets can be more convenient than specifying parameters for each image individually, and helps your site stay consistent. For example, in your `docpad.coffee` file you might define the following:

```
plugins:
	thumbnails:
		presets:
			'default':
				w: 200
				h: 200
				q: 90
			'small':
				w: 100
				h: 100
			'medium':
				w: 300
				h: 300
			'large':
				w: 500
				h: 500
```

If no parameters (or preset names) are passed to the `@getThumbnail()` function, then the `default` parameters will be used. Given the above configuration, the example below will resize the image to 200x200 at 90% quality.

```
<img src="<%= @getThumbnail("images/image1.jpg") %>"  alt="my image">
```

You can pass multiple parameters to the `@getThumbnails()` call, and they will be applied from left to right. For example, you could use the default height and quality parameters and just override the width as follows:

```
<img src="<%= @getThumbnail("images/image1.jpg", { w: 250 }) %>"  alt="my image">
```

You can also mix presets with inline parameters, such as:

```
<img src="<%= @getThumbnail("images/image1.jpg", { q: 80 }, 'medium', { h: 50 }) %>"  alt="my image">
```

The right-most parameters will take precedence over those specified earlier. So the above example uses `w: 300`, `h: 50`, and `q: 80`.

There are a whole bunch of default presets defined in the plugin, but you will probably want to define your own instead.

### Targets

A thumbnail _target_ defines the set of operations to be performed by the plugin. If no target is specified then the _default_ target is executed, which specifies a basic resize operation. Given that, the following example:

```
<img src="<%= @getThumbnail("images/image1.jpg", { w: 100, h: 100 }) %>"  alt="my image">
```

Is equivalent to:

```
<img src="<%= @getThumbnail("images/image1.jpg", "default", { w: 100, h: 100 }) %>"  alt="my image">
```

The plugin includes another target, _zoomcrop_, which center-crops the image to the exact width and height supplied, rather than just fitting the image into those boundaries. To specify the zoomcrop target, just change the example to:

```
<img src="<%= @getThumbnail("images/image1.jpg", "zoomcrop", { w: 100, h: 100 }) %>"  alt="my image">
```

### Creating your own targets

You can overide the _default_ or _zoomcrop_ targets if you wish, or specify completely new ones via the plugin configuration. For example, lets define a couple more to play with:

```
plugins:
	thumbnails:
		targets:
			'sepia': (img, args) ->
				return img.sepia()
			'rotateleft': (img, args) ->
				return img.rotate('black', -90)
```

_img_ is a reference to a gm image object. The target function must also return a gm image object.

The _args_ argument is just an object containing the w, h, q parameters passed to `@getThumbnail()`

You can use any GraphicsMagick/ImageMagick operation supported by the gm module. You can find the details of those in the [gm docs](http://aheckmann.github.com/gm/docs.html).

To run one of our new targets, we can do the following:

```
<img src="<%= @getThumbnail("images/image1.jpg", 'medium', 'sepia' %>"  alt="my image">
```

Note that targets and presets can be passed to `@getThumbnail` in any order, and intermixed as you like. The only caveat is that a target and preset cannot have the same name, otherwise the plugin won't know which one you're talking about.

Note however that in contrast to the presets, the default target is only run if no other targets are specified. So for the above example, the image is not resized at all.

### Running multiple targets

You can pass in more than one target to `@getThumbnail()` and they will be executed in order.

For example, you could do the following to get a small zoom-cropped, sepia'd and rotated image:

```
<img src="<%= @getThumbnail("images/image1.jpg", 'small', 'zoomcrop', 'sepia', 'rotateleft' %>"  alt="my image">
```

Of course if this was a common occurence on your site, you would be much better off building a target to do it all in one go, like so:

```
plugins:
	thumbnails:
		targets:
			'doitall': (img, args) ->
				return img
					.quality(args.q)
					.gravity('Center')
					.resize(args.w, args.h, '^')
					.crop(args.w, args.h)
					.sepia()
					.rotate('black', -90)
```

### Overriding the default target

You can assign a target name to `default` in the plugin configuration to make that target the new default action. For example, to make `zoomcrop` the new default:

```
plugins:
	thumbnails:
		targets:
			'default': 'zoomcrop'
```

### Adding different file formats

By default the plugin supports jpeg and png files. If you wish to use other formats that are supported by ImageMagick/GraphicsMagick you can override the `extensions` option. This limits the file extensions that are allowed to be passed through the plugin.

```
extensions: ['jpg', 'JPG', 'jpeg', 'JPEG', 'png', 'PNG', 'gif', 'GIF']
```













<!-- INSTALL/ -->

<h2>Install</h2>

Install this DocPad plugin by entering <code>docpad install thumbnails</code> into your terminal.

<!-- /INSTALL -->

<!-- HISTORY/ -->

<h2>History</h2>

<a href="https://github.com/docpad/docpad-plugin-thumbnails/blob/master/History.md#files">Discover the release history by heading on over to the <code>History.md</code> file.</a>

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

<h2>Contribute</h2>

<a href="https://github.com/docpad/docpad-plugin-thumbnails/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

<h2>Backers</h2>

<h3>Maintainers</h3>

These amazing people are maintaining this project:

<ul><li><a href="richard.antecki.id.au">Richard Antecki</a></li></ul>

<h3>Sponsors</h3>

No sponsors yet! Will you be the first?

<span class="badge-githubsponsors"><a href="https://github.com/sponsors/balupton" title="Donate to this project using GitHub Sponsors"><img src="https://img.shields.io/badge/github-donate-yellow.svg" alt="GitHub Sponsors donate button" /></a></span>
<span class="badge-patreon"><a href="https://patreon.com/bevry" title="Donate to this project using Patreon"><img src="https://img.shields.io/badge/patreon-donate-yellow.svg" alt="Patreon donate button" /></a></span>
<span class="badge-flattr"><a href="https://flattr.com/profile/balupton" title="Donate to this project using Flattr"><img src="https://img.shields.io/badge/flattr-donate-yellow.svg" alt="Flattr donate button" /></a></span>
<span class="badge-liberapay"><a href="https://liberapay.com/bevry" title="Donate to this project using Liberapay"><img src="https://img.shields.io/badge/liberapay-donate-yellow.svg" alt="Liberapay donate button" /></a></span>
<span class="badge-buymeacoffee"><a href="https://buymeacoffee.com/balupton" title="Donate to this project using Buy Me A Coffee"><img src="https://img.shields.io/badge/buy%20me%20a%20coffee-donate-yellow.svg" alt="Buy Me A Coffee donate button" /></a></span>
<span class="badge-opencollective"><a href="https://opencollective.com/bevry" title="Donate to this project using Open Collective"><img src="https://img.shields.io/badge/open%20collective-donate-yellow.svg" alt="Open Collective donate button" /></a></span>
<span class="badge-crypto"><a href="https://bevry.me/crypto" title="Donate to this project using Cryptocurrency"><img src="https://img.shields.io/badge/crypto-donate-yellow.svg" alt="crypto donate button" /></a></span>
<span class="badge-paypal"><a href="https://bevry.me/paypal" title="Donate to this project using Paypal"><img src="https://img.shields.io/badge/paypal-donate-yellow.svg" alt="PayPal donate button" /></a></span>
<span class="badge-wishlist"><a href="https://bevry.me/wishlist" title="Buy an item on our wishlist for us"><img src="https://img.shields.io/badge/wishlist-donate-yellow.svg" alt="Wishlist browse button" /></a></span>

<h3>Contributors</h3>

These amazing people have contributed code to this project:

<ul><li><a href="https://github.com/miletbaker">Jon Baker</a> — <a href="https://github.com/docpad/docpad-plugin-thumbnails/commits?author=miletbaker" title="View the GitHub contributions of Jon Baker on repository docpad/docpad-plugin-thumbnails">view contributions</a></li>
<li><a href="richard.antecki.id.au">Richard Antecki</a></li></ul>

<a href="https://github.com/docpad/docpad-plugin-thumbnails/blob/master/CONTRIBUTING.md#files">Discover how you can contribute by heading on over to the <code>CONTRIBUTING.md</code> file.</a>

<!-- /BACKERS -->


<!-- LICENSE/ -->

<h2>License</h2>

Unless stated otherwise all works are:

<ul><li>Copyright &copy; <a href="richard.antecki.id.au">Richard Antecki</a></li></ul>

and licensed under:

<ul><li><a href="http://spdx.org/licenses/MIT.html">MIT License</a></li></ul>

<!-- /LICENSE -->
