# La loi

The law.

Made to run `laravel-pint` onSave, through a docker container.
Tailored for me, not for mass distribution.

## What it does

- Verifies that `composer.json` contains a `laravel/pint` key in the `require-dev` array.
- Verifies that the `pint` executable is found in `vendor/bin/`.
- When saving a file, runs `pint` on it, in a docker container.
  - run `docker-compose exec app ...`.
  - configuration for the service name is not yet available.

## Requirements

### [laravel/pint](https://github.com/laravel/pint)

Require it:
```bash
composer require laravel/pint --dev
```

That's it.

## Extension Settings

None yet.

## Known Issues

None yet.

## Release Notes

Soon :tm:.
