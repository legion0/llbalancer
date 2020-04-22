set -euo pipefail

node bungie.manifest.gen.js

git status --porcelain | grep bungie.manifest.json >/dev/null && {
	BUNGIE_MANIFEST_VERSION="$(cat bungie.manifest.json.version)"
	sed -i -E "s|BUNGIE_MANIFEST_VERSION = '[^']+'|BUNGIE_MANIFEST_VERSION = '${BUNGIE_MANIFEST_VERSION}'|g" bungie.manifest.js
	git reset HEAD .
	git add bungie.manifest.json bungie.manifest.json.version bungie.manifest.js
	git commit -m 'bungie manifest update'
	git tag "bungie-manifest-version-${BUNGIE_MANIFEST_VERSION}"
	git push --tags
	git push
	clasp push
	echo 'Update Complete!'
} || {
	echo 'No Update.'
}
