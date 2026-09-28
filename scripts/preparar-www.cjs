const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const vendor=path.join(root,'www','vendor');
fs.mkdirSync(vendor,{recursive:true});
for(const [source,dest] of [
 ['node_modules/xlsx/dist/xlsx.full.min.js','xlsx.full.min.js'],
 ['node_modules/html5-qrcode/html5-qrcode.min.js','html5-qrcode.min.js']
]){
 const input=path.join(root,source);
 if(!fs.existsSync(input))throw Error('Dependência não instalada: '+source+'. Execute npm install primeiro.');
 fs.copyFileSync(input,path.join(vendor,dest));
 console.log('Incluído no APK: '+dest);
}
