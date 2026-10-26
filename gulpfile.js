// Local Node.js matrix: runs install + build/test once per version through nvm.
//   yarn gulp test-all        | yarn gulp test-all-force
//   yarn gulp build-all       | yarn gulp build-all-force
//   yarn gulp test-node-24.22.1 (single version)
import gulp from 'gulp';
import shell from 'gulp-shell';

// Keep in sync with the CI matrix (.github/workflows). 24 is the default (DEFAULT_NODE in CI).
const nodeVersions = ['22.23.4', '24.22.1', '26.12.1'];

const nvmScript = `${process.env.HOME}/.nvm/nvm.sh`;
const withNode = (version, command) =>
  shell.task([`. ${nvmScript} && nvm use ${version} && node -v && yarn && ${command}`]);

for (const version of nodeVersions) {
  gulp.task(`test-node-${version}`, withNode(version, 'yarn test'));
  gulp.task(`test-force-node-${version}`, withNode(version, 'yarn test --force'));
  gulp.task(`build-node-${version}`, withNode(version, 'yarn build'));
  gulp.task(`build-force-node-${version}`, withNode(version, 'yarn build --force'));
}

const allVersions = (prefix) =>
  gulp.series(...nodeVersions.map((version) => `${prefix}-node-${version}`));

gulp.task('test-all', allVersions('test'));
gulp.task('test-all-force', allVersions('test-force'));
gulp.task('build-all', allVersions('build'));
gulp.task('build-all-force', allVersions('build-force'));
