# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## [3.0.0](https://github.com/dessant/scroll-zoom/compare/v2.0.2...v3.0.0) (2024-05-03)


### ⚠ BREAKING CHANGES

* browser versions older than Chrome 122, Edge 122,
Firefox 115 and Opera 108 are no longer supported

### Features

* upgrade to Manifest V3 in Chrome ([819a509](https://github.com/dessant/scroll-zoom/commit/819a50905a971d84bce7cb23ea3ee2fe95cb1f35))
* use non-persistent background page in Firefox

### [2.0.2](https://github.com/dessant/scroll-zoom/compare/v2.0.1...v2.0.2) (2022-12-17)


### Bug Fixes

* set color scheme ([4e9a1d1](https://github.com/dessant/scroll-zoom/commit/4e9a1d1f316064d1dc8a1025672120d45c56f6a3))
* set manifest CSP in Firefox ([e8b1cbb](https://github.com/dessant/scroll-zoom/commit/e8b1cbb0a44934193934331643b4d44a2f73148c))

### [2.0.1](https://github.com/dessant/scroll-zoom/compare/v2.0.0...v2.0.1) (2022-12-03)


### Bug Fixes

* update build script ([422d063](https://github.com/dessant/scroll-zoom/commit/422d0638a54bcd380d05c12c430d3d2f169ba0ad))

## [2.0.0](https://github.com/dessant/scroll-zoom/compare/v1.1.1...v2.0.0) (2022-12-03)


### ⚠ BREAKING CHANGES

* browser versions older than Chrome 92, Edge 92,
Firefox 91, and Opera 78 are no longer supported

### Features

* add support for disabling gestures ([ededc9c](https://github.com/dessant/scroll-zoom/commit/ededc9cb910d53e8ced702d8fcd7fbeac92047ec))
* ignore zoom gesture during text selection ([a2d8653](https://github.com/dessant/scroll-zoom/commit/a2d8653267168b385cdde3d5ba5190ccc7cc0926)), closes [#8](https://github.com/dessant/scroll-zoom/issues/8)
* migrate to Vuetify ([ee02b7a](https://github.com/dessant/scroll-zoom/commit/ee02b7a3e092969f6e094c77f2d261882aeddc47))


### Bug Fixes

* detect text selection in open Shadow DOM ([5cfc97a](https://github.com/dessant/scroll-zoom/commit/5cfc97a4f05db36ef9f20159625b48794528e5d3))

### [1.1.1](https://github.com/dessant/scroll-zoom/compare/v1.1.0...v1.1.1) (2021-04-18)


### Bug Fixes

* ignore select and drag events during gesture ([a8013da](https://github.com/dessant/scroll-zoom/commit/a8013da5f11a6cb9911867c1867a1e9095965c60)), closes [#7](https://github.com/dessant/scroll-zoom/issues/7)
* restore default zoom levels when option value is cleared ([3917393](https://github.com/dessant/scroll-zoom/commit/3917393bf9b511eea3771d68b26e323443463fb6))

## [1.1.0](https://github.com/dessant/scroll-zoom/compare/v1.0.1...v1.1.0) (2021-04-17)


### Features

* add gestures for resetting zoom level ([d1f7778](https://github.com/dessant/scroll-zoom/commit/d1f7778698328576c1b32ff46418bf09951bd6df))
* add option for customizing zoom factors ([3291918](https://github.com/dessant/scroll-zoom/commit/32919189bed8d7ca5220793057f8ca5879aa95c0)), closes [#6](https://github.com/dessant/scroll-zoom/issues/6)

### [1.0.1](https://github.com/dessant/scroll-zoom/compare/v1.0.0...v1.0.1) (2020-01-14)


### Bug Fixes

* remove unnecessary permissions ([7ef6dda](https://github.com/dessant/scroll-zoom/commit/7ef6dda6c0c949c3b707232c4141461037cca438))

## [1.0.0](https://github.com/dessant/scroll-zoom/compare/v0.4.0...v1.0.0) (2020-01-14)


### ⚠ BREAKING CHANGES

* browser versions before Chrome 76, Firefox 68 and Opera 63
are no longer supported

### Features

* add option for reversing zoom direction ([69eff18](https://github.com/dessant/scroll-zoom/commit/69eff185a91048a2fbdc88d2db3adf25d744c30f)), closes [#4](https://github.com/dessant/scroll-zoom/issues/4)


### Bug Fixes

* adjust options page layout ([2093a2d](https://github.com/dessant/scroll-zoom/commit/2093a2d49fb14965dd84eb2e3b8590736fe99f30))
* remove support for outdated browsers ([ba6269c](https://github.com/dessant/scroll-zoom/commit/ba6269c077858a512a9489e0cb1d49ef6c5de118))

## [0.4.0](https://github.com/dessant/scroll-zoom/compare/v0.3.0...v0.4.0) (2019-09-06)


### ⚠ BREAKING CHANGES

* Since browsers are removing support for the protocol,
FTP pages can no longer be zoomed.

### Bug Fixes

* do not inject the content script in ftp pages ([e2d32a4](https://github.com/dessant/scroll-zoom/commit/e2d32a4))
* do not scroll the page while zooming on Chrome ([fb3cd6c](https://github.com/dessant/scroll-zoom/commit/fb3cd6c))

## [0.3.0](https://github.com/dessant/scroll-zoom/compare/v0.2.0...v0.3.0) (2019-05-23)


### Features

* build with travis ([e4b8a49](https://github.com/dessant/scroll-zoom/commit/e4b8a49))
* change license to GPLv3 ([a777990](https://github.com/dessant/scroll-zoom/commit/a777990))
* update dependencies and refresh user interface ([d76a941](https://github.com/dessant/scroll-zoom/commit/d76a941))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/dessant/scroll-zoom/compare/v0.1.1...v0.2.0) (2018-07-14)


### Features

* support Chrome and Opera ([e4e0ffd](https://github.com/dessant/scroll-zoom/commit/e4e0ffd))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/dessant/scroll-zoom/compare/v0.1.0...v0.1.1) (2018-05-01)


### Bug Fixes

* set default background color ([1e79982](https://github.com/dessant/scroll-zoom/commit/1e79982))



<a name="0.1.0"></a>
# 0.1.0 (2018-03-01)
