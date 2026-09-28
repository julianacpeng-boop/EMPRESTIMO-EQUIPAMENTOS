# HNL — Controle de Empréstimos e Devoluções (projeto Cordova)

Projeto Android separado, preparado a partir da **V6** do aplicativo de movimentações e da estrutura do projeto Cordova de Avaliação de Chamados. Não é o APK pronto: a geração é feita pelo GitHub Actions.

## Como funciona
- Busca de equipamento por patrimônio ou série; leitura QR Arkmeds `https://digit.arkmeds.com/cadastros/equipamento/visual/2528/` usa o **ID 2528** para localizar dados importados.
- Importação de **CSV/XLSX/XLS** (setor, nome do equipamento, marca, modelo, número de série, patrimônio e id). CSV funciona sem leitor Excel. Para APK offline, `npm run prepare:web` inclui as bibliotecas locais.
- Empréstimo: 1ª e 2ª assinaturas → documento salvo **Aguardando entrega** → 3ª assinatura no setor solicitante → **Emprestado**.
- Devolução: quem entrega + transporte pela Engenharia Clínica → **Devolução em transporte** → 3ª assinatura no setor de origem → **Devolvido**.
- Os comprovantes foram preservados na estrutura e estilo original da V2 que a V6 utiliza (bobina 80 mm).
- Documentos e dicionário são armazenados **localmente no dispositivo**. Drive armazena o código-fonte, **não** sincroniza os registros entre aparelhos. Antes de trocar de celular ou reinstalar, exporte um backup JSON.

## Estrutura
```
.github/workflows/gerar-apk.yml  geração automática do APK de teste
config.xml                       configuração Android Cordova
package.json                     dependências
scripts/preparar-www.cjs         copia bibliotecas QR e Excel para www/vendor
www/index.html                  aplicativo, estilo azul e comprovantes originais
www/img/                        ícone e splash
www/manifest.json               metadados web
www/service-worker.js           cache somente em acesso web HTTPS
resources/                      imagens do Android
dicionario/                     modelos CSV e XLSX
saida/                          destino do APK gerado
tests/                          verificação estática
```

## Gerar via GitHub
1. Crie um **repositório novo** no GitHub (não sobrescreva o app de avaliação). Extraia o ZIP e envie o conteúdo para a raiz, incluindo a pasta `.github`.
2. Acesse **Actions → Gerar APK - HNL Movimentações → Run workflow**.
3. Abra a execução e baixe **HNL-Movimentacoes-APK** em **Artifacts**. O fluxo produz APK **debug**, para testes, e não publica na loja.

## Gerar localmente
Pré-requisitos: Node.js 22, Java 17, Android SDK/API 36 e Cordova CLI 13.
```bash
npm install
npm run prepare:web
npm run test:static
cordova platform add android@15.0.0
cordova build android --debug
```
O APK fica em `platforms/android/app/build/outputs/apk/debug/app-debug.apk`.

## Exportar cupom / backup no Android
Na versão Cordova, arquivos HTML/JSON/CSV são gravados na pasta persistente **Exportados** do aplicativo e enviados ao menu **Compartilhar** do Android. Se o compartilhamento for cancelado ou falhar, entre em **Dicionário → Consultar / compartilhar arquivos** e tente novamente. Essa pasta continua dentro da área do aplicativo e é removida na desinstalação; salve backups em Drive/Arquivos antes de trocar de aparelho. Abra/imprima o HTML do cupom em outro aplicativo para obter PDF, mantendo seu visual 80 mm. No navegador, os botões usam download e impressão padrão. Teste no celular a compatibilidade com a impressora e o aplicativo receptor.

## Avisos de uso
- A solicitação de permissão de câmera está preparada, mas a câmera e a impressão **precisam de teste no hardware Android real**. Há entrada manual do URL/ID Arkmeds como alternativa.
- A versão demo contém dados fictícios; importe o dicionário real antes do uso.
- Os registros incluem assinaturas e identificações de profissionais: defina controle de acesso, retenção, backup e exclusão segundo as políticas institucionais antes da produção.
- Defina o identificador Android único e as informações institucionais definitivas em `config.xml` antes de distribuir.

## Correções de importação/exportação
- Bibliotecas XLSX e QR são copiadas para `www/vendor` pelo script `npm run prepare:web` antes da compilação do APK, sem depender de internet durante a importação.
- Para o dicionário, use CSV UTF-8 ou XLSX com as sete colunas previstas; IDs e patrimônios com zeros iniciais devem estar como texto na planilha.
- Mensagem “arquivo salvo na área temporária” da versão anterior vinha do erro genérico do plugin de compartilhamento, **não** da rotina `importCatalog`. O APK corrigido guarda os arquivos em `Exportados` e mostra a causa do erro quando o compartilhamento falha.
- O APK `saida/Avaliacao_de_Chamados.apk` e o workflow legado foram removidos porque pertenciam a outro aplicativo. Gere `HNL_Movimentacoes_debug.apk` em Actions.
