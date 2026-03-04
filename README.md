# vue3-project

This template should help get you started developing with Vue 3 in Vite.

## Banking App Notes

This frontend includes:

- Login page: `/`
- Enterprise registration page: `/register`
- Bank home page and V2 account operations after login

Enterprise registration form sends `POST /api/enterprise/register` and supports:

- `OPEN_NEW`: open a new account automatically
- `LINK_EXISTING`: bind an existing 19-digit account

Key validation rules in UI:

- `creditCode`: 18 chars (`0-9A-Z`)
- `password`: at least 6 chars
- `idNumber`: max 128 chars
- `mobile`: 11 digits (starts with `1`)
- `accountNo` (only for `LINK_EXISTING`): 19 digits

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
