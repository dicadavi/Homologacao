let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
  host: HOST_CARDIF,
  port: PORT_CARDIF,
  username: USER_CARDIF,
  password: PASSWORD_CARDIF
}).then(() => {
  return sftp.list('/O0055CARDIF/ENTRADA');
}).then(data => {
  console.log(data, 'the data info');
}).catch(err => {
  console.log(err, 'catch error');
});

const CardifFIles=() => {
   

}