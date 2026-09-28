const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'www/index.html'),'utf8');
const csv=fs.readFileSync(path.join(root,'dicionario/Modelo_Dicionario_Equipamentos.csv'),'utf8');
const parsing=html.slice(html.indexOf('function normalize('),html.indexOf('async function importCatalog('));
const {parseDelimited,convertRows}=vm.runInNewContext(parsing+';({parseDelimited,convertRows})');
const parsed=convertRows(parseDelimited(csv));
assert.equal(parsed.items.length,1);
assert.equal(parsed.items[0].id,'031246','Não pode perder zeros à esquerda do patrimônio');
assert.equal(parsed.items[0].arkId,'2528');
const quoted='setor;nome do equipamento;marca;modelo;número de série;patrimônio;id\r\n"UTI; Adulto";Monitor;Marca;Modelo;S-2;000123;2529\r\n';
assert.equal(convertRows(parseDelimited(quoted)).items[0].from,'UTI; Adulto');
assert.throws(()=>convertRows(parseDelimited('setor;marca\nUTI;Marca')),/coluna obrigatória/);
const exporter=html.slice(html.indexOf('function fileErrorMessage('),html.indexOf('\nfunction exportBackup(){'));
let chosenDir,chosenFile,blob,uri,success=false,alerts=[];
const entry={nativeURL:'file:///Android/data/app/files/Exportados/teste.csv',toURL:()=>{throw new Error('Deve preferir nativeURL')},createWriter(cb){const writer={truncate(n){assert.equal(n,0);this.onwriteend()},write(value){blob=value;this.onwriteend()}};cb(writer)}};
const directory={getFile(name,opts,cb){chosenFile=name;assert.equal(opts.create,true);cb(entry)}};
const folder={getDirectory(name,opts,cb){assert.equal(name,'Exportados');assert.equal(opts.create,true);cb(directory)}};
const ctx={
 window:{cordova:{file:{externalDataDirectory:'file:///Android/data/app/files/',dataDirectory:'file:///private/'}},resolveLocalFileSystemURL:(url,cb)=>{chosenDir=url;cb(folder)},plugins:{socialsharing:{shareWithOptions:(options,ok)=>{uri=options.files[0];success=true;ok()}}}},
 Blob,URL,document:{},alert:message=>alerts.push(message),toast:()=>{},query:()=>null,setTimeout
};
vm.runInNewContext(exporter+';downloadBlob("teste.csv","conteudo-teste","text/csv")',ctx);
assert.equal(chosenDir,'file:///Android/data/app/files/');
assert.equal(chosenFile,'teste.csv');
assert.equal(uri,entry.nativeURL);
assert.equal(success,true);
assert.equal(alerts.length,0);
blob.text().then(text=>{assert.equal(text,'conteudo-teste');console.log('OK: importação CSV (inclusive aspas e zeros), gravação persistente e compartilhamento com URI nativa.')}).catch(e=>{console.error(e);process.exitCode=1});
