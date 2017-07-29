#/usr/bin/sh

cp ./lib/target_template.js ./lib/target.js
git diff
git add *
git commit
git push
