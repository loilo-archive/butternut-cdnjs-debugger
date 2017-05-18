console.log(`
Butternut cdnjs Debugger
=================================

Butternut version: ${require('butternut').VERSION}
To upgrade Butternut in this repository, run

npm install -s butternut

Usage:
node help             Show this help message
node run [options]    Run tests
node reset            Remove cache, details of failed libraries and *tested* markers

Options for "node run":
‑‑take, ‑t            How many libraries should be tested. Use 0 for testing all.
[ default: 25 ]

‑‑chunk‑size, ‑c      The number of concurrently handled libraries
[ default: 5 ]

‑‑skip-until, ‑s      How many untested libraries should be skipped from the beginning of the list.
[ default: 0 ]        May also be a string, skipping all libraries alphabetically prior to the passed value.
                      Wrapped in /slashes/, the string will be evaluated as a regular expression,
                      skipping all libraries until first match.

‑‑ignore‑cache, ‑i    If set:
                      - ignore library list cache
                      - evaluate libraries no matter if already tested
                      - don't add a *tested* marker after checking a library

Examples:

# Test the first 10 libraries
node run -t 10

# Test only jQuery
node run -t 1 -s /^jquery$/i

# Test *all* libraries in chunks of 30
node run -t 0 -c 30 -i
`)