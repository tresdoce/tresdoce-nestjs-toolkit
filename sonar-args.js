const path = require('path');
const fs = require('fs');

const organizationName = 'tresdoce';
const projectName = 'tresdoce-nestjs-toolkit';
const sonarProjectKey = `${organizationName}_${projectName}`;
const sonarPropertiesFilename = 'sonar-project.properties';

const blacklist = ['.DS_Store', 'config', 'paas', 'tresdoce-types'];
const directoryPath = path.join(__dirname, 'packages');

fs.readdir(directoryPath, (err, files) => {
  try {
    const listOfPackages = files.filter((file) => !blacklist.includes(file));

    const packages = listOfPackages.map((pkgName) => `${pkgName}`);
    console.log('• Packages: ', packages.join(', '));
    console.log(`• Total packages: ${packages.length}`)

    const sonarSources = listOfPackages.map((pkgName) => `./packages/${pkgName}/src`);
    const sonarTestExecutionReportPaths = listOfPackages.map(
      (pkgName) => `./packages/${pkgName}/test-report.xml`,
    );
    const sonarLcovReportPath = listOfPackages.map(
      (pkgName) => `./packages/${pkgName}/coverage/lcov.info`,
    );

    const sonarCloudProperties = `sonar.organization=${organizationName}
sonar.projectKey=${sonarProjectKey}
sonar.projectName=${sonarProjectKey}
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8
sonar.sources=${sonarSources.join() || '.'}
sonar.exclusions=**/*.bin,node_modules/**,test/**,**/__test__/**,**/__mocks__/**,src/index.ts
sonar.coverage.exclusions=node_modules/**,test/**,**/__test__/**,**/__mocks__/**,src/index.ts
sonar.testExecutionReportPaths=${sonarTestExecutionReportPaths.join()}
sonar.javascript.lcov.reportPaths=${sonarLcovReportPath.join()}`;

    fs.writeFile(
      path.resolve(__dirname, sonarPropertiesFilename),
      sonarCloudProperties,
      (error) => {
        if (error) {
          return console.log(`Error to create SonarCloud properties file: ${error}`);
        }
        console.log('The SonarCloud properties file was saved!');
        console.log(sonarCloudProperties);
      },
    );
  } catch (error) {
    return console.log(`Unable to scan directory: ${error}`);
  }
});
