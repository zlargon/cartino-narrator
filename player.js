const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

function get_suitable_player () {
  switch (process.platform) {
    // Windows
    case 'win32':
      return path.resolve(__dirname, 'dlcplayer/dlc') + ' -p';

    // MacOS
    case 'darwin':
      return 'afplay';

    // linux
    default:
      try {
        exec('which mpg123');
      } catch (e) {
        console.log('sudo apt-get install mpg123');
        const stdout = exec('sudo apt-get install mpg123');
        console.log(stdout);
      } finally {
        return 'mpg123 -q';
      }
  }
}

module.exports = get_suitable_player();
