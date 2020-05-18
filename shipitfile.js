module.exports = shipit => {
  // Load shipit-deploy tasks
  require('shipit-deploy')(shipit)

  shipit.initConfig({
    default: {
      deployTo: '/var/www/space-game',
      repositoryUrl: 'https://github.com/eherve/space.git',
      keepReleases: 2,
      keepWorkspace: false, // should we remove workspace dir after deploy?
      deleteOnRollback: false,
      shallowClone: true,
      dirToCopy: 'dist/space-game',
      deploy: {
        remoteCopy: {
          copyAsDir: false, // Should we copy as the dir (true) or the content of the dir (false)
        },
      }
    },
    dev: {
      servers: 'eherve@51.15.171.107',
      branch: 'master',
    }
  });

  shipit.on('fetched', () => shipit.start(['server:install', 'server:build']));

  shipit.blTask('server:install', async () => shipit.local(`pwd && npm install`, {
    cwd: shipit.workspace
  }));

  shipit.blTask('server:build', async () => shipit.local(`pwd && npm run build:app`, {
    cwd: shipit.workspace
  }));

}
