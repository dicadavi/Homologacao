require('dotenv').config({ path: '../../../../.env' })


let Client = require('ssh2-sftp-client');
let sftp = new Client();
const fs = require('fs');

sftp.connect({
  host: process.env.HOST_METLIFE,
  username: process.env.USER_METLIFE,
  privateKey: fs.readFileSync(process.env.KEY_METLIFE)
}).then(() => {
  return sftp.list('/Remessa');
}).then(dados => {
  console.log(dados, 'Retorno dos dados');
}).catch(err => {
  console.log(err, 'Erro');
});