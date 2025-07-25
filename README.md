# PlotSet Embed Module

A module containing embed generator to be used in all backend projects.

## Installation

This package is published to GitHub's npm registry. To install it, you need to authenticate with GitHub's package registry.

### Option 1: Using npm with GitHub token

1. Create a GitHub personal access token with `read:packages` scope
2. Configure npm to use the token:

```bash
npm login --scope=@plotset-corp --registry=https://npm.pkg.github.com
```

3. Install the package:

```bash
npm install @plotset-corp/lib-template-embed-module
```

### Option 2: Using .npmrc file

Create a `.npmrc` file in your project root:

```
@plotset-corp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Then install:

```bash
npm install @plotset-corp/lib-template-embed-module
```

## Usage

```javascript
const embedModule = require('@plotset-corp/lib-template-embed-module');
// Use the module functions here
```

## Development

To publish a new version:

1. Update the version in `package.json`
2. Create a new release on GitHub
3. The GitHub Action will automatically publish to the npm registry

Or use the manual workflow:
1. Go to Actions tab in GitHub
2. Select "Manual Publish to GitHub npm registry"
3. Enter the new version number
4. Run the workflow

## License

SEE LICENSE IN LICENSE.md

