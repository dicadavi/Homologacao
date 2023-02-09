require('dotenv').config({path: '../../../../.env'})

let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
  
  host:process.env.HOST_CARDIF,
  port:process.env.PORT_CARDIF,
  username: process.env.USER_CARDIF,
  password: process.env.PASSWORD_CARDIF
}).then(() => {
  return sftp.list('/O0055CARDIF/ENTRADA');
}).then(dados => {
  console.log(dados, 'the data info');
}).catch(err => {
  console.log(err, 'catch error');
});

const CardifFIles=() => {
   

}