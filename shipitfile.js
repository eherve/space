const deployTo = '/home/eherve/space-game/front';

module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      repositoryUrl: 'https://github.com/eherve/space.git',
      keepReleases: 2,
      keepWorkspace: false, // should we remove workspace dir after deploy?
      deleteOnRollback: false,
      shallowClone: true,
      dirToCopy: dist,
      deploy: {
        remoteCopy: {
          copyAsDir: false, // Should we copy as the dir (true) or the content of the dir (false)
        },
      }
    },
    dev: {
      deployTo,
      servers: 'eherve@51.15.171.107',
      branch: 'master',
    }
  });

  shipit.on('fetched', () => shipit.start(['server:install', 'server:build']));

  shipit.blTask('server:install', async () => shipit.remote(`cd ${shipit.releasePath} && npm install`));

  shipit.blTask('server:build', async () => shipit.remote(`cd ${shipit.releasePath} && npm run build:app`));

}
