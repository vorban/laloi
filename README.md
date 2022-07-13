# La loi

The law.

Made to run `laravel-pint` onSave, through a docker container.
Tailored for me, not for mass distribution.

## What it does

- Verifies that `composer.json` contains a `laravel/pint` key in the `require-dev` array.
- Verifies that the `pint` executable is found in `vendor/bin/`.
- When saving a file, runs `pint` on it, in a docker container.
  - run `docker compose exec app ...` if `app` is not running.
  - run `docker compose run app ...` if `app` is already running (way faster).
  - configuration for the service name is not yet available.

## Requirements

For the extension to work on your Laravel project, you need:

### [laravel/pint](https://github.com/laravel/pint)

Require it:
```bash
composer require laravel/pint --dev
```

That's it.

## Installation

This extension is not published on the VSCode marketplace.
You can install it from the VSIX file available in each GitHub release.


1. Download the latest VSIX [here](https://github.com/vorban/laloi/releases)
2. a) Install from the command palette

![Command Palette: install from VSIX](https://github.com/vorban/laloi/blob/main/docs/img/cmd_from_vsix.png?raw=true)|

2. b) Or Install from the extension menu

![Install from VSIX](https://github.com/vorban/laloi/blob/main/docs/img/from_vsix.png?raw=true)|


## Configuration

You can use `laravel/pint` documentation for this. Long story short, pint automatically
reads the `pint.json` file at the root of your project. You can set your preferences
in there. Example:

```json
// ./pint.json
{
    "preset": "laravel"
}
```

## Extension Settings

None yet.

## Known Issues

None yet.

## Release Notes

Soon :tm:.
