# Title

## Project Key

TBD

## Setup

* Clone spreadsheet at: https://docs.google.com/spreadsheets/d/1z0jfbahDnfs_s9K4BNIAi4f5_ranu7tVhWJEOQBSkFk with

``` 
File -> Make a copy
```

* On File/Edit/View row you should have a new menu at the end called `LLBalancer` , select the new menu and hit `Fetch` , it will take you through the rest of the steps required.

## Manifest

We need a minified manifest since Google Apps Script UrlFetchApp has a limit of 50MB for the response and some manifest resposnes are >50MB.

https://developers.google.com/apps-script/guides/services/quotas

```sh
npm i node-fetch
node bungie.manifest.gen.js
```

## Useful links

* https://github.com/legion0/kjlib-gas

## TODO

* TBD

