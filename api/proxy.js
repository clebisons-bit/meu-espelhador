export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('Cole uma URL válida.');
  }

  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    let html = await response.text();

    // 1. Tag base para preservar imagens, fontes e folhas de estilo originais
    const baseTag = `<base href="${targetUrl}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      html = baseTag + html;
    }

    // 2. Renomeia o item de biossegurança para "Acesso e Reprodução"
    html = html.replaceAll(
      'Agendamento de pesquisa e protocolos de biosegurança',
      'Acesso e Reprodução'
    );

    // 3. Folha de estilo consolidada: Painéis laterais (Drawers) e formulário central
    const customStyles = `
      <style>
        /* Formulário Central (Acesso e Reprodução) */
        .form-cpd-container {
          background: #ffffff;
          padding: 24px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          font-family: inherit;
          margin-top: 20px;
          box-sizing: border-box;
        }
        .form-cpd-section {
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf2f7;
        }
        .form-cpd-section h3 {
          color: #136357;
          font-size: 1.08rem;
          margin-bottom: 14px;
          padding-left: 8px;
          border-left: 4px solid #8b1e2f;
        }
        .form-cpd-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .form-cpd-full {
          grid-column: span 2;
        }
        .form-cpd-group {
          display: flex;
          flex-direction: column;
          margin-bottom: 10px;
        }
        .form-cpd-group label {
          font-weight: 600;
          font-size: 0.86rem;
          color: #334155;
          margin-bottom: 5px;
        }
        .form-cpd-group input,
        .form-cpd-group select,
        .form-cpd-group textarea {
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.88rem;
          color: #1e293b;
          font-family: inherit;
        }
        .form-cpd-group input:focus,
        .form-cpd-group select:focus,
        .form-cpd-group textarea:focus {
          border-color: #136357;
          outline: none;
          box-shadow: 0 0 0 2px rgba(19, 99, 87, 0.18);
        }
        .form-cpd-checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 9px;
          font-size: 0.85rem;
          color: #334155;
          line-height: 1.4;
        }
        .form-cpd-checkbox-group input {
          margin-top: 3px;
        }
        .btn-cpd-submit {
          background-color: #136357;
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-cpd-submit:hover {
          background-color: #0e4b42;
        }

        /* Fundo escurecido compartilhado para os modais laterais */
        .drawer-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.45);
          z-index: 99998;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .drawer-backdrop.active {
          opacity: 1;
          pointer-events: auto;
        }

        /* Estrutura das Gavetas Laterais à Direita */
        .drawer-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 620px;
          max-width: 92vw;
          height: 100vh;
          background: #ffffff;
          z-index: 99999;
          box-shadow: -6px 0 25px rgba(0,0,0,0.25);
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          overflow-y: auto;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          font-family: inherit;
        }
        .drawer-container.active {
          transform: translateX(0);
        }
        .drawer-header {
          padding: 18px 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .drawer-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #136357;
        }
        .drawer-header p {
          margin: 4px 0 0 0;
          font-size: 0.82rem;
          color: #64748b;
        }
        .drawer-close {
          background: none;
          border: none;
          font-size: 1.6rem;
          line-height: 1;
          color: #64748b;
          cursor: pointer;
          padding: 0 4px;
        }
        .drawer-close:hover {
          color: #8b1e2f;
        }
        .drawer-body {
          padding: 24px;
          flex: 1;
        }
        @media (max-width: 768px) {
          .form-cpd-grid { grid-template-columns: 1fr; }
          .form-cpd-full { grid-column: span 1; }
        }
      </style>
    `;

    // 4. Injeção de componentes laterais e script de controle do DOM
    const customScript = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          // Injeta a estrutura HTML dos Drawers (Doação e Licenciamento) e o Backdrop
          const modalsMarkup = \`
            <div id="appDrawerBackdrop" class="drawer-backdrop" onclick="window.fecharTodosDrawers()"></div>

            <!-- GAVETA: DOAÇÃO DE ACERVO -->
            <div id="doacaoDrawer" class="drawer-container">
              <div class="drawer-header">
                <div>
                  <h2>Termo de Doação de Acervo</h2>
                  <p>MHFMUSP — Centro de Pesquisa e Documentação</p>
                </div>
                <button class="drawer-close" onclick="window.fecharTodosDrawers()">&times;</button>
              </div>
              <div class="drawer-body">
                <form id="formDoacaoAcervo" onsubmit="event.preventDefault(); alert('Proposta de doação submetida com sucesso!'); window.fecharTodosDrawers();">
                  <div class="form-cpd-section">
                    <h3>A.1 Identificação do Doador</h3>
                    <div class="form-cpd-group">
                      <label>Tipo de Doador *</label>
                      <select required>
                        <option value="">Selecione...</option>
                        <option>Pessoa Física</option>
                        <option>Pessoa Jurídica</option>
                        <option>Espólio (Herdeiros e Sucessores)</option>
                        <option>Instituição Pública ou Privada</option>
                      </select>
                    </div>
                    <div class="form-cpd-group">
                      <label>Nome Completo ou Razão Social *</label>
                      <input type="text" required />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>CPF ou CNPJ *</label>
                        <input type="text" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Doc. Identificação (PDF/JPG/PNG) *</label>
                        <input type="file" required />
                      </div>
                    </div>
                    <div class="form-cpd-group">
                      <label>Endereço Completo *</label>
                      <input type="text" placeholder="Logradouro, nº, compl., bairro, cidade, UF, CEP" required />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>Telefone *</label>
                        <input type="tel" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>E-mail *</label>
                        <input type="email" required />
                      </div>
                    </div>
                  </div>
                  <div class="form-cpd-section">
                    <h3>A.2 Descrição do Bem Cultural Doado</h3>
                    <div class="form-cpd-group">
                      <label>Categoria Museológica *</label>
                      <select required>
                        <option value="">Selecione...</option>
                        <option>Instrumental médico-cirúrgico</option>
                        <option>Documento arquivístico</option>
                        <option>Obra bibliográfica ou raridade</option>
                        <option>Espécime biológico ou anatômico</option>
                        <option>Mobiliário e equipamento hospitalar histórico</option>
                        <option>Iconografia (fotografias, cartazes)</option>
                        <option>Objeto tridimensional diverso</option>
                      </select>
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>Denominação do Bem *</label>
                        <input type="text" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Quantidade de Peças *</label>
                        <input type="number" min="1" value="1" required />
                      </div>
                    </div>
                    <div class="form-cpd-group">
                      <label>Descrição Física e Material *</label>
                      <textarea rows="2" required></textarea>
                    </div>
                  </div>
                  <div class="form-cpd-section">
                    <h3>A.6 Aceite e Declarações</h3>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro que sou legítimo proprietário do bem e que o mesmo está livre de ônus.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro celeridade, gratuidade e irrevogabilidade da doação após incorporação.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Autorizo o tratamento de dados pessoais nos termos da Lei nº 13.709/2018 (LGPD).
                    </label>
                  </div>
                  <div style="text-align: right; margin-top: 15px;">
                    <button type="submit" class="btn-cpd-submit">Concordo e Assinar Digitalmente</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- GAVETA: LICENCIAMENTO COMERCIAL DE ACERVO -->
            <div id="licenciamentoDrawer" class="drawer-container">
              <div class="drawer-header">
                <div>
                  <h2>Licenciamento para Uso Comercial</h2>
                  <p>MHFMUSP — Instrumento Apartado de Licenciamento</p>
                </div>
                <button class="drawer-close" onclick="window.fecharTodosDrawers()">&times;</button>
              </div>
              <div class="drawer-body">
                <form id="formLicenciamentoComercial" onsubmit="event.preventDefault(); alert('Proposta de Licenciamento enviada para análise técnica e jurídica!'); window.fecharTodosDrawers();">
                  
                  <!-- A.1 Dados do Solicitante -->
                  <div class="form-cpd-section">
                    <h3>A.1 Dados do Solicitante</h3>
                    <div class="form-cpd-group">
                      <label>Tipo de Solicitante *</label>
                      <select id="tipoSolLic" required onchange="document.getElementById('campoRazaoSocial').style.display = (this.value === 'Pessoa Jurídica') ? 'flex' : 'none'">
                        <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                        <option value="Pessoa Física com atuação comercial">Pessoa Física com atuação comercial (autônomo, produtor)</option>
                      </select>
                    </div>
                    <div id="campoRazaoSocial" class="form-cpd-group">
                      <label>Razão Social e Nome Fantasia *</label>
                      <input type="text" />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>CNPJ / CPF *</label>
                        <input type="text" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Comprovante Inscrição/Identificação (PDF/JPG) *</label>
                        <input type="file" required />
                      </div>
                    </div>
                    <div class="form-cpd-group">
                      <label>Endereço Completo da Empresa/Solicitante *</label>
                      <input type="text" placeholder="Logradouro, nº, bairro, cidade, UF, CEP, país" required />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>Representante Legal *</label>
                        <input type="text" placeholder="Nome completo e cargo" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Procuração / Contrato Social *</label>
                        <input type="file" required />
                      </div>
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>E-mail Corporativo *</label>
                        <input type="email" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Telefone Corporativo *</label>
                        <input type="tel" required />
                      </div>
                    </div>
                    <div class="form-cpd-group">
                      <label>Setor de Atuação *</label>
                      <input type="text" placeholder="Ex: Editorial, Audiovisual, Moda, Farmacêutico, Merchandising" required />
                    </div>
                  </div>

                  <!-- A.2 Detalhamento do Projeto Comercial -->
                  <div class="form-cpd-section">
                    <h3>A.2 Detalhamento do Projeto Comercial</h3>
                    <div class="form-cpd-group">
                      <label>Item(ns) do Acervo Pretendido(s) (Códigos de Tombamento) *</label>
                      <input type="text" placeholder="Ex: MHFMUSP-0014, Coleção Augusto Esteves" required />
                    </div>
                    <div class="form-cpd-group">
                      <label>Descrição do Produto ou Serviço Final (mínimo 200 caracteres) *</label>
                      <textarea rows="4" minlength="200" placeholder="Detalhe como a imagem/reprodução será aplicada, qual suporte (livro, embalagem, peça publicitária, streaming, produto físico) e objetivos comerciais" required></textarea>
                    </div>
                    <div class="form-cpd-group">
                      <label>Amostra ou Mockup do Uso Pretendido (Upload opcional)</label>
                      <input type="file" />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>Tiragem / Volume Estimado *</label>
                        <input type="text" placeholder="Ex: 2.000 exemplares / contínuo digital" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Território de Comercialização *</label>
                        <select required>
                          <option>Nacional</option>
                          <option>Internacional</option>
                          <option>Digital sem restrição geográfica</option>
                        </select>
                      </div>
                    </div>
                    <div class="form-cpd-group">
                      <label>Canais de Distribuição / Veiculação *</label>
                      <input type="text" placeholder="Ex: Ponto de venda físico, E-commerce, Redes sociais, Streaming, Livrarias" required />
                    </div>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group">
                        <label>Período de Exploração Comercial Pretendido *</label>
                        <input type="text" placeholder="Ex: 12 meses (01/2027 a 12/2027)" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Exclusividade Pretendida?</label>
                        <select onchange="document.getElementById('justExclusividade').style.display = (this.value === 'Sim') ? 'block' : 'none'">
                          <option value="Não">Não (padrão institucional)</option>
                          <option value="Sim">Sim (sujeito à diretoria)</option>
                        </select>
                      </div>
                    </div>
                    <div id="justExclusividade" class="form-cpd-group" style="display:none;">
                      <label>Justificativa para pedido de exclusividade *</label>
                      <textarea rows="2"></textarea>
                    </div>
                  </div>

                  <!-- A.3 Condições Financeiras -->
                  <div class="form-cpd-section">
                    <h3>A.3 Condições Financeiras</h3>
                    <div class="form-cpd-group">
                      <label>Modalidade de Contrapartida Proposta *</label>
                      <select required onchange="document.getElementById('justIsencao').style.display = (this.value === 'Isenção') ? 'block' : 'none'">
                        <option>Taxa fixa única de licenciamento</option>
                        <option>Royalties sobre faturamento</option>
                        <option>Modelo híbrido (taxa fixa + royalties)</option>
                        <option value="Isenção">Isenção (projetos educacionais / sem fins lucrativos)</option>
                      </select>
                    </div>
                    <div class="form-cpd-group">
                      <label>Faturamento ou Preço de Venda Estimado do Produto (R$) *</label>
                      <input type="text" placeholder="Base para cálculo de eventuais royalties" required />
                    </div>
                    <div id="justIsencao" class="form-cpd-group" style="display:none;">
                      <label>Justificativa fundamentada para pedido de isenção *</label>
                      <textarea rows="2"></textarea>
                    </div>
                  </div>

                  <!-- A.4 Declarações Éticas Específicas -->
                  <div class="form-cpd-section">
                    <h3>A.4 Declarações Éticas (Acervo Médico-Científico)</h3>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro que o produto/serviço não promove tabaco, armas, discriminação, práticas de saúde sem comprovação científica ou exploração do sofrimento humano.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro que o uso não fará alegações médicas enganosas nem induzirá endosso institucional do Museu ou da USP.
                    </label>
                  </div>

                  <!-- A.5 Declarações e Aceite -->
                  <div class="form-cpd-section">
                    <h3>A.5 Declarações e Aceite Legal</h3>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro que as informações são verdadeiras e correspondem ao real projeto comercial.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Comprometo-me ao crédito institucional obrigatório ao Museu na forma por ele fornecida.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Reconheço que os direitos morais sobre as obras são inalienáveis e permanecem com a instituição e autores originais.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Comprometo-me ao pagamento integral e tempestivo das contrapartidas devidas nos canais oficiais da USP.
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Autorizo o tratamento de dados pessoais conforme a Lei nº 13.709/2018 (LGPD).
                    </label>
                    <label class="form-cpd-checkbox-group">
                      <input type="checkbox" required />
                      Declaro ter lido e concordar integralmente com as cláusulas do Termo de Autorização e Licenciamento Comercial.
                    </label>
                  </div>

                  <div style="text-align: right; margin-top: 15px;">
                    <button type="submit" class="btn-cpd-submit">Concordo e Enviar Proposta de Licenciamento</button>
                  </div>
                </form>
              </div>
            </div>
          \`;

          document.body.insertAdjacentHTML('beforeend', modalsMarkup);

          // Funções globais para controle dos painéis
          window.abrirDoacaoDrawer = function() {
            window.fecharTodosDrawers();
            document.getElementById('appDrawerBackdrop').classList.add('active');
            document.getElementById('doacaoDrawer').classList.add('active');
          };

          window.abrirLicenciamentoDrawer = function() {
            window.fecharTodosDrawers();
            document.getElementById('appDrawerBackdrop').classList.add('active');
            document.getElementById('licenciamentoDrawer').classList.add('active');
          };

          window.fecharTodosDrawers = function() {
            document.getElementById('appDrawerBackdrop').classList.remove('active');
            document.getElementById('doacaoDrawer').classList.remove('active');
            document.getElementById('licenciamentoDrawer').classList.remove('active');
          };

          // -------------------------------------------------------------
          // CRIAÇÃO DO BOTÃO "LICENCIAMENTO COMERCIAL" ACIMA DE "SOBRE O ACERVO"
          // -------------------------------------------------------------
          const allElements = Array.from(document.querySelectorAll('a, li, span, p'));
          const sobreAcervoItem = allElements.find(el => {
            const txt = el.textContent.trim().toLowerCase();
            return txt === 'sobre o acervo' || txt === '□ sobre o acervo' || txt.includes('sobre o acervo');
          });

          if (sobreAcervoItem) {
            // Localiza o elemento container (geralmente uma li ou div de link)
            const targetContainer = sobreAcervoItem.closest('li') || sobreAcervoItem;
            if (targetContainer && targetContainer.parentElement && !document.getElementById('itemLicenciamentoComercialMenu')) {
              const novoItemMenu = targetContainer.cloneNode(true);
              novoItemMenu.id = 'itemLicenciamentoComercialMenu';

              const linkInterno = novoItemMenu.querySelector('a') || novoItemMenu;
              linkInterno.id = 'linkLicenciamentoMenu';
              linkInterno.href = '#licenciamento-comercial';

              // Preserva o marcador quadrado caso exista no layout original
              if (targetContainer.textContent.includes('□')) {
                linkInterno.innerHTML = '□ &nbsp;Licenciamento Comercial';
              } else {
                linkInterno.textContent = 'Licenciamento Comercial';
              }

              // Insere imediatamente acima de "Sobre o acervo"
              targetContainer.parentElement.insertBefore(novoItemMenu, targetContainer);

              // Intercepta o clique para abrir o drawer lateral direito
              novoItemMenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.abrirLicenciamentoDrawer();
              });
            }
          }

          // Vincula os cliques dos demais itens do menu
          const links = Array.from(document.querySelectorAll('a'));

          // Item "Doação de acervo" -> abre a gaveta de doação
          const linkDoacao = links.find(el => {
            const txt = el.textContent.trim().toLowerCase();
            return txt.includes('doaç') && txt.includes('acervo');
          });
          if (linkDoacao) {
            linkDoacao.addEventListener('click', function(e) {
              e.preventDefault();
              window.abrirDoacaoDrawer();
            });
          }

          // Item "Acesso e Reprodução" -> carrega o formulário central
          const linkAcesso = links.find(el => el.textContent.trim().includes('Acesso e Reprodução'));
          if (linkAcesso) {
            linkAcesso.addEventListener('click', function(e) {
              e.preventDefault();
              abrirCentroDePesquisa();
            });
          }

          function abrirCentroDePesquisa() {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, strong, span'));
            const mainHeading = headings.find(el => el.textContent.trim().includes('Venha conhecer o Museu Histórico da FMUSP'));
            if (mainHeading) {
              mainHeading.textContent = 'Centro de Pesquisa e Documentação';
              mainHeading.style.color = '#136357';
            }
            const container = mainHeading ? mainHeading.parentElement : document.body;
            container.querySelectorAll('p').forEach(p => p.style.display = 'none');

            if (!document.getElementById('termoAcessoForm')) {
              const formWrapper = document.createElement('div');
              formWrapper.className = 'form-cpd-container';
              formWrapper.innerHTML = \`
                <h2 style="color: #8b1e2f; margin-top: 0; font-size: 1.35rem;">Termo para Acesso e Reprodução de Acervo</h2>
                <p style="font-size: 0.88rem; color: #64748b; margin-bottom: 20px; display: block !important;">
                  Preenchimento e envio para consulta presencial ou reprodução digital de itens sob a guarda do Museu.
                </p>
                <form id="termoAcessoForm" onsubmit="event.preventDefault(); alert('Solicitação de Acesso enviada!');">
                  <div class="form-cpd-section">
                    <h3>A.1 Cadastro do Pesquisador</h3>
                    <div class="form-cpd-grid">
                      <div class="form-cpd-group form-cpd-full">
                        <label>Nome Completo *</label>
                        <input type="text" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>CPF ou Passaporte *</label>
                        <input type="text" required />
                      </div>
                      <div class="form-cpd-group">
                        <label>Vínculo Institucional *</label>
                        <select required>
                          <option value="">Selecione...</option>
                          <option>Discente de graduação</option>
                          <option>Discente de pós-graduação</option>
                          <option>Docente-pesquisador</option>
                          <option>Pesquisador independente</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <button type="submit" class="btn-cpd-submit">Concordo e Enviar Solicitação</button>
                  </div>
                </form>
              \`;
              if (mainHeading && mainHeading.nextSibling) {
                container.insertBefore(formWrapper, mainHeading.nextSibling);
              } else {
                container.appendChild(formWrapper);
              }
              formWrapper.scrollIntoView({ behavior: 'smooth' });
            }
          }
        });
      </script>
    `;

    html = html.replace('</head>', `${customStyles}</head>`);
    html = html.replace('</body>', `${customScript}</body>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (err) {
    return res.status(500).send(`Falha ao ler o site: ${err.message}`);
  }
}
