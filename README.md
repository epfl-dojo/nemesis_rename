# Nemesis Rename

Automated script for editing cluster properties on fm.epfl.ch using puppeteer. 

## Usage

  1. `node chromelauncher.js` this will start a chrome instance where we can follow the progress and, in particular, we can login into gaspar to gain administration access to `fm.epfl.ch`
  2. Take note of the port number written as last input and use it when launcing the next script
  3. `node rename.js PORT_NUMBER`

