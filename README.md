# Lerret

[![Build Status](https://travis-ci.org/jgrh/lerret.svg?branch=master)](https://travis-ci.org/jgrh/lerret)
[![Coverage Status](https://coveralls.io/repos/github/jgrh/lerret/badge.svg?branch=master)](https://coveralls.io/github/jgrh/lerret?branch=master)
[![Dependency Status](https://david-dm.org/jgrh/lerret.svg)](https://david-dm.org/jgrh/lerret)
[![devDependency Status](https://david-dm.org/jgrh/lerret/dev-status.svg)](https://david-dm.org/jgrh/lerret#info=devDependencies)

Lerret is a simple static site generator for image oriented sites, powered by [Node.js](http://nodejs.org). Whilst usable out of the box, Lerret's behaviour can be easily customised and extended through its plugin framework.

Lerret takes care of templating and image repurposing. Lerret doesn't come with any built in tools for generating stylesheets, minifying Javascript, or packaging and deploying your sites. Instead, it's recommended that you use your favourite tools directly to supplement what Lerret does well.

Lerret supports GIF, JPEG, PNG and TIFF image formats. Lerret will also extract any EXIF tags embedded in your images and make them available to your templates and plugins.

## Release Notes

### 2.0.0

* Support for Node versions 11 and earlier dropped.
* Upgraded to Pug 3. See [Migrating to Pug 3](https://pugjs.org/api/migration-v3.html) for details of how to migrate your templates.
* Refactored codebase to use async/await.
* Updated all dependencies.

### 1.0.0

* The `jade` plugin has been removed and replaced with `pug`. See [Migrating to Pug 2](https://pugjs.org/api/migration-v2.html) for details of how to migrate your templates.

## Getting Started

In order to use Lerret you need to have Node.js and npm installed. Once you have those, install Lerret as follows:

```
$ npm install -g lerret
```

Alternatively, if your site uses npm as its package manager then you may add Lerret as a dependency in your package.json file.

Once you have Lerret installed, it's simple to create a new project using the `init` command.

```
$ mkdir my-project
$ cd my-project
$ lerret init
```

This creates a starting config file named lerret.yaml and directories named content, plugins and target.

```
$ ls
content  lerret.yaml  plugins  target
```

The `generate` command generates your site, but first you'll need to add some content and configure Lerret.

```
$ lerret generate
```

## Supported image formats

Lerret supports the following image formats (and corresponding file extensions) when both reading and writing images.

* GIF (`.gif`)
* JPEG (`.jpeg` or `.jpg`)
* PNG (`.png`)
* TIFF (`.tif` or `.tiff`)

## Organising your content

Lerret traverses your project's content directory building up a map of information as follows.

If the content directory contains a file named `site.yaml`, then it is parsed as YAML and added to the content map at the root level.

Each directory immediately beneath the content directory is processed as an album. A list of albums is added to the content map at the root level under the key `albums`.

An album is represented by a map containing a key `id` with the album directory's name as its value and any other properties from the YAML file `album.yaml`.

Each directory immediately beneath each album directory is processed as an image. A list of images is added to each album map under the key `images`. Each image directory must contain exactly one image file, named `image` and suffixed with a supported file extension.

An image is represented by a map containing a key `id` with the image directory's name as its value, a key `path` with the image file path as its value, a key `exif` containing a map of the image's EXIF tags (if it has any), and any other properties from the YAML file `image.yaml`.

The site, album and image YAML files are all optional.

The `print` command outputs the content map to the console in YAML format. This is useful for validating and inspecting your site's content. Note that by default the output includes all exif tags - these may be suppressed using the `--no-exif` argument.

```
$ lerret print
```

## Configuration

Lerret is configured in YAML. The configuration is expected in a file named `lerret.yaml` in your project's root directory, the directory within which the `lerret` command should be executed.

The following configuration keys are available. Plugin specific configuration is documented with each plugin below.

* `contentDirectory` (optional, default: `./content`) - The location Lerret searches for album and image content.
* `pluginDirectory` (optional, default: `./plugins`) - The location Lerret searches for additional plugins.
* `plugins` (required) - The list of plugins to execute. Plugins should be referred to by their name as referenced in the PLugins section below.
* `sort` (optional)
    * `albums` (optional)
        * `property` (optional) - The property, or list of properties, of an album to sort on.
        * `order` (optional, default: `asc`) - The order, or list of orders, by which to sort the albums (either `asc` or `desc`).
    * `images` (optional)
        * `property` (optional) - The property, or list of properties, of an image to sort on.
        * `order` (optional, default: `asc`) - The order, or list of orders, by which to sort the images (either `asc` or `desc`).
* `targetDirectory` (required) - The location Lerret writes the generated site to. The resulting directory structure matches that of the source content directory.

## Plugins

### Built-in plugins

Lerret includes some core plugins which are documented below.

#### convert

The `convert` plugin may be used to repurpose your images. The plugin supports:
* resizing and cropping
* sharpening and quality adjustments
* conversion to different image formats

It is also possible to repurpose each image more than once with different settings.

__Note:__ in order to use this plugin, please install [GraphicsMagick](http://www.graphicsmagick.org).

The following configuration keys are available.

* `convert` (optional) - An array of conversion configurations, each containing:
    * `filename` (required) - The filename to use when writing the repurposed image to the target location.
    * `quality` (optional) - The resulting image quality (0 to 100, with 100 being best). If not specified, the GraphicsMagick default is used.
    * `resize` (optional) - Resize the image to fit the width and height values while maintaining the original aspect ratio.
        * `width` (optional) - The width in pixels. If not set, then the image is resized to the configured height and its width is set accordingly to maintain the aspect ratio.
        * `height` (optional) - The height in pixels. If not set, then the image is resized to the configured width and its height is set accordingly to maintain the aspect ratio.
        * `crop` (optional, default: `false`) - Set to `true` to scale and crop the image to the configured width and height. When cropping, both width and height are required.
    * `unsharp` (optional) - Sharpen the image with an unsharp mask operator. Please consult the GraphicsMagick [documentation](http://www.graphicsmagick.org/GraphicsMagick.html#details-unsharp) for an explanation of the settings below.
        * `radius` (required)
        * `sigma` (required)
        * `amount` (required)
        * `threshold` (required)

#### copy

The `copy` plugin copies images without modification to the target location. This is useful if you have already processed your images for the web.

The following configuration keys are available.

* `copy` (optional)
    * `filename` (optional, default: the source image's filename) - The filename to use when copying the image to the target location.

#### pug

The `pug` plugin may be used to render [Pug](https://pugjs.com) templates to HTML. The plugin expects three templates to exist: a home page template, an album template and an image template.

The home page template is rendered once. It is provided with a context containing the following keys.

* `site` - The full content map.
* `helpers` - Additional helper module.

The album template is rendered once per album. It is provided with a context containing the following keys.

* `album` - The map of attributes associated with the album.
* `site` - The full content map.
* `helpers` - Additional helper module.

The image template is rendered once per image. It is provided with a context containing the following keys.

* `image` - The map of attributes associated with the image.
* `album` - The map of attributes associated with the album which contains the image.
* `site` - The full content map.
* `helpers` - Additional helper module.

The following configuration keys are available. Paths are relative to the project root.

* `pug` (optional)
    * `helpers` (optional) - Path to a Node.js module of helper methods to pass to the template.
    * `templates` (required)
        * `home` (required) - Path to a Pug template for the site home page.
        * `album` (required) - Path to a Pug template for each album page.
        * `image` (required) - Path to a Pug template for each image page.

### Writing your own plugins

Lerret looks for additional plugins within your project's configured `pluginDirectory`. Plugins are just regular Node.js modules (files with an extension of `.js` or directories containing a file named `index.js`) that export an object with the following attributes.

* `name` (required) - The name of the plugin.
* `processSite` (optional) - A function which is called once with the full content map.
* `processAlbum` (optional) - A function which is called once per album.
* `processImage` (optional) - A function which is called once per image.

Note that at least one of `processSite`, `processAlbum` or `processImage` must be defined.

`processSite` should be a function that accepts the following arguments. If the function returns a value, the content map is updated to this value and passed to subsequent plugins. If the returned value is a Promise object, it will be followed and its eventual value used.

* `site` - The full site content map.
* `config` - Lerret's config module.

`processAlbum` should be a function that accepts the following arguments. If the function returns a value, the album is updated to this value and passed to subsequent plugins. If the returned value is a Promise object, it will be followed and its eventual value used.

* `album` - The current album.
* `index` - The index of the current album.
* `length` - The number of albums.
* `site` - The full site content map.
* `config` - Lerret's config module.

`processImage` should be a function that accepts the following arguments. If the function returns a value, the image is updated to this value and passed to subsequent plugins. If the returned values is a Promise object, it will be followed and its eventual value used.

* `image` - The current image.
* `index` - The index of the current image.
* `length` - The number of images.
* `album` - The image's album.
* `site` - The full site content map.
* `config` - Lerret's config module.

The config module that is passed to each provides the following functions. This module allows you to access configuration data in your project's `lerret.yaml`.

* `get(key, default)` - Returns the configuration value associated with the given key. If the key does not exist then an `Error` is thrown, unless a default value is provided in which case the default is returned.
* `has(key)` - Returns `true` if the given key exists in your config file.

## Sites Using Lerret

* [www.jonhewer.co.uk](http://www.jonhewer.co.uk) (source: [github/jgrh/www-jonhewer-co-uk](https://github.com/jgrh/www-jonhewer-co-uk))

To add your site here, please submit a pull request.
