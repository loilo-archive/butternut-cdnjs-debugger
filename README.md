# Butternut cdnjs Debugger

This repo automates the task of testing the awesome [Butternut](https://github.com/Rich-Harris/butternut) minifier against the JavaScript libraries from [cdnjs](https://cdnjs.com/).

**Note:** This tool makes use of ES2017's `async`/`await` features and thus needs at least Node.js v7.6.0 to execute.

## Get started
First, clone the repo and install the dependencies via `npm install`.

To run Butternut on the first twenty *untested* libraries, do this on the command line:

```bash
node run --take 20
```

The tool will then grab the list of libraries from the [cdnjs API](https://cdnjs.com/api) and cache it for whatever the `Cache-Control` header says, usually 4 hours.

Subsequently it will iterate over the list in alphabetical order and pick the first twenty libraries that have not been tested yet. They will be handled in chunks of 5 concurrent items at a time and then be marked as *tested*. An indicator if the minification was successful will be shown in the terminal.

*Hint:* If you're sick of this Readme, you can always use
```bash
node help
```

## Advanced Usage

### Debugging
Whenever the minification of a library fails, additional information will be put into the `failed/[library-name]` folder.

It will contain the `source.js` file, an `error.txt` if a JavaScript error occurred or respectively an `error.json`, `repro.input.js` and `repro.output.js` in case there was no error, but the Butternut output was considered invalid.

### Resetting `tested` state and cache
Marking libraries as *tested* simply means their names will be appended to the `.handled-sources` file in the root of the repository.

To remove that file as well as the library list cache and the `failed` folder, run

```bash
node reset
```

from the command line.

### Command Line Options
You can customize the usage of the CLI `run` command with the following options:

| Option             | Default value | Description      
|--------------------|---------------|------------|
| ‑‑take, ‑t         | 100           | How many libraries should be tested
| ‑‑chunk‑size, ‑c   | 5             | The number of concurrently handled libraries
| ‑‑skip-until, ‑s   | 0             | How many *untested* libraries should be skipped from the beginning of the list. This may also be a string: Passing `extjs` here will skip all items that are alphabetically coming before "extjs"—thus starting with the *extjs* library itself. Wrapping the string in `/slashes/` make it be evaluated as a regular expression, skipping all libraries until first match.
| ‑‑ignore‑cache, ‑i | not set       | If this flag is set, the library list cache will be invalidated immediately, the list will be re-fetched from the cdnjs API, the *tested* marker on libraries will be ignored and no new *tested* markers will be set during the execution of the command.

Combining those lets you handle most use cases – for example if you just want to test jQuery, run this:

```bash
node run -s /^jquery$/i -t 1
```