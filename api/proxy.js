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

    // 1. Injeção da tag base para resolução de links e imagens relativas
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

    // 3. Estilos unificados para os formulários centrais no padrão FMUSP
    const customStyles = `
      <style>
        .cpd-form-card {
          background: #ffffff;
          padding: 28px;
          border-radius: 4px;
          border: 1px solid #dcdfe6;
          font-family: inherit;
          margin-top: 15px;
          box-sizing: border-box;
          color: #2c3e50;
        }
        .cpd-header-title {
          color: #136357 !important;
          font-size: 1.6rem !important;
          font-weight: 700 !important;
          margin-bottom: 6px !important;
          margin-top: 0 !important;
        }
        .cpd-header-subtitle {
          color: #8b1e2f;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 0;
          margin-bottom: 8px;
        }
        .cpd-header-desc {
          font-size: 0.9rem;
          color: #5a6a85;
          margin-bottom: 24px;
          line-height: 1.45;
          border-bottom: 1px solid #e9ecef;
          padding-bottom: 14px;
        }
        .cpd-section-box {
          margin-bottom: 26px;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf2f7;
        }
        .cpd-section-box h3 {
          color: #136357;
          font-size: 1.08rem;
          margin-top: 0;
          margin-bottom: 16px;
          padding-left: 10px;
          border-left: 4px solid #8b1e2f;
          font-weight: 700;
        }
        .cpd-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .cpd-grid-full {
          grid-column: span 2;
        }
        .cpd-field {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }
        .cpd-field label {
          font-weight: 600;
          font-size: 0.88rem;
          color: #334155;
          margin-bottom: 6px;
        }
        .cpd-field input[type="text"],
        .cpd-field input[type="email"],
        .cpd-field input[type="tel"],
        .cpd-field input[type="number"],
        .cpd-field input[type="file"],
        .cpd-field select,
        .cpd-field textarea {
          padding: 9px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-size: 0.9rem;
          color: #1e293b;
          font-family: inherit;
          box-sizing: border-box;
          background-color: #ffffff;
        }
        .cpd-field input:focus,
        .cpd-field select:focus,
        .cpd-field textarea:focus {
          border-color: #136357;
          outline: none;
          box-shadow: 0 0 0 2px rgba(19, 99, 87, 0.18);
        }
        .cpd-checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 12px;
          font-size: 0.87rem;
          color: #334155;
          line-height: 1.45;
          cursor: pointer;
        }
        .cpd-checkbox-row input {
          margin-top: 3px;
          accent-color: #136357;
          min-width: 16px;
          min-height: 16px;
        }
        .cpd-credit-preview {
          background: #f8fafc;
          border: 1px dashed #94a3b8;
          border-radius: 4px;
          padding: 12px;
          font-size: 0.86rem;
          color: #334155;
          margin-top: 6px;
          font-family: monospace;
        }
        .cpd-btn-submit {
          background-color: #136357;
          color: #ffffff;
          border: none;
          padding: 14px 28px;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s, opacity 0.2s;
        }
        .cpd-btn-submit:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .cpd-btn-submit:hover:not(:disabled) {
          background-color: #0e4b42;
        }
        @media (max-width: 768px) {
          .cpd-grid-2 { grid-template-columns: 1fr; }
          .cpd-grid-full { grid-column: span 1; }
        }
      </style>
    `;

    // 4. Injeção do script de controle e renderização central dos formulários
    const customScript = `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          
          // Cria o item "Licenciamento Comercial" imediatamente acima de "Sobre o acervo"
          const allElements = Array.from(document.querySelectorAll('a, li, span, p'));
          const sobreAcervoItem = allElements.find(el => {
            const txt = el.textContent.trim().toLowerCase();
            return txt === 'sobre o acervo' || txt === '□ sobre o acervo' || txt.includes('sobre o acervo');
          });

          if (sobreAcervoItem) {
            const targetContainer = sobreAcervoItem.closest('li') || sobreAcervoItem;
            if (targetContainer && targetContainer.parentElement && !document.getElementById('itemLicenciamentoComercialMenu')) {
              const novoItemMenu = targetContainer.cloneNode(true);
              novoItemMenu.id = 'itemLicenciamentoComercialMenu';
              const linkInterno = novoItemMenu.querySelector('a') || novoItemMenu;
              linkInterno.id = 'linkLicenciamentoMenu';
              linkInterno.href = '#licenciamento-comercial';
              if (targetContainer.textContent.includes('□')) {
                linkInterno.innerHTML = '□ &nbsp;Licenciamento Comercial';
              } else {
                linkInterno.textContent = 'Licenciamento Comercial';
              }
              targetContainer.parentElement.insertBefore(novoItemMenu, targetContainer);

              novoItemMenu.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.renderizarFormulario('licenciamento');
              });
            }
          }

          // Monitora cliques nos itens do menu lateral
          const links = Array.from(document.querySelectorAll('a'));

          // Link "Acesso e Reprodução"
          const linkAcesso = links.find(el => el.textContent.trim().includes('Acesso e Reprodução'));
          if (linkAcesso) {
            linkAcesso.addEventListener('click', function(e) {
              e.preventDefault();
              window.renderizarFormulario('acesso');
            });
          }

          // Link "Doação de acervo"
          const linkDoacao = links.find(el => {
            const txt = el.textContent.trim().toLowerCase();
            return txt.includes('doaç') && txt.includes('acervo');
          });
          if (linkDoacao) {
            linkDoacao.addEventListener('click', function(e) {
              e.preventDefault();
              window.renderizarFormulario('doacao');
            });
          }

          // =========================================================================
          // FUNÇÃO DE LIMPEZA DO BANNER / TEXTO E PREPARAÇÃO DA ÁREA CENTRAL
          // =========================================================================
          function prepararEspacoCentral() {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, strong, span'));
            const mainHeading = headings.find(el => el.textContent.trim().includes('Venha conhecer o Museu Histórico da FMUSP') || el.textContent.trim().includes('Centro de Pesquisa e Documentação'));
            
            const bannerImg = document.querySelector('img[src*="home"], img[src*="banner"], img[alt*="Museu"]') || 
                              (mainHeading ? mainHeading.parentElement.querySelector('img') : null) ||
                              document.querySelector('.conteudo img, #conteudo img, .main-content img');

            if (bannerImg) bannerImg.style.display = 'none';

            if (mainHeading && mainHeading.parentElement) {
              const paragraphs = mainHeading.parentElement.querySelectorAll('p');
              paragraphs.forEach(p => p.style.display = 'none');
              mainHeading.textContent = 'Centro de Pesquisa e Documentação';
              mainHeading.className = 'cpd-header-title';
            }

            const container = mainHeading ? mainHeading.parentElement : document.body;
            
            // Remove qualquer formulário central anteriormente renderizado
            const existingForm = document.getElementById('cpdFormRoot');
            if (existingForm) existingForm.remove();

            return { container, mainHeading };
          }

          // =========================================================================
          // DISPATCHER PRINCIPAL: RENDERIZA O FORMULÁRIO ESCOLHIDO NO ESPAÇO CENTRAL
          // =========================================================================
          window.renderizarFormulario = function(tipo) {
            const { container, mainHeading } = prepararEspacoCentral();
            const formElement = document.createElement('div');
            formElement.id = 'cpdFormRoot';
            formElement.className = 'cpd-form-card';

            if (tipo === 'acesso') {
              formElement.innerHTML = window.obterHtmlAcesso();
            } else if (tipo === 'doacao') {
              formElement.innerHTML = window.obterHtmlDoacao();
            } else if (tipo === 'licenciamento') {
              formElement.innerHTML = window.obterHtmlLicenciamento();
            }

            if (mainHeading && mainHeading.nextSibling) {
              container.insertBefore(formElement, mainHeading.nextSibling);
            } else {
              container.appendChild(formElement);
            }

            // Inicializa contadores e listeners do formulário específico
            window.inicializarEventosFormulario(tipo);
            formElement.scrollIntoView({ behavior: 'smooth' });
          };

          // =========================================================================
          // TEMPLATE 1: TERMO PARA ACESSO E REPRODUÇÃO DE ACERVO
          // =========================================================================
          window.obterHtmlAcesso = function() {
            return \`
              <h2 class="cpd-header-subtitle">Termo para Acesso e Reprodução de Acervo</h2>
              <div class="cpd-header-desc">
                Documento nativamente digital para consulta presencial ou remota e reprodução de bens sob salvaguarda do Museu Histórico "Prof. Carlos da Silva Lacaz".
              </div>

              <form onsubmit="event.preventDefault(); alert('Solicitação de Acesso e Reprodução registada com sucesso!');">
                <div class="cpd-section-box">
                  <h3>A.1 Cadastro do Pesquisador / Solicitante</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Nome Completo *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>CPF ou Passaporte (Estrangeiros) *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Documento de Identificação (PDF/JPG/PNG, máx. 10 MB) *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    </div>
                    <div class="cpd-field">
                      <label>Vínculo Institucional *</label>
                      <select required onchange="document.getElementById('boxAcessoCompVinculo').style.display = ['graduacao','pos','docente','imprensa','editora'].includes(this.value) ? 'flex' : 'none'">
                        <option value="">Selecione...</option>
                        <option value="graduacao">Discente de graduação</option>
                        <option value="pos">Discente de pós-graduação</option>
                        <option value="docente">Docente-pesquisador</option>
                        <option value="externo">Pesquisador externo independente</option>
                        <option value="imprensa">Profissional de imprensa</option>
                        <option value="editora">Editora ou produtora</option>
                        <option value="pf">Pessoa física sem vínculo acadêmico</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Instituição de Vínculo *</label>
                      <input type="text" placeholder="Universidade, veículo ou 'Não se aplica'" required />
                    </div>
                    <div id="boxAcessoCompVinculo" class="cpd-field cpd-grid-full" style="display:none;">
                      <label>Comprovante de Vínculo (Declaração de matrícula, carta de apresentação, crachá) *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                    <div class="cpd-field">
                      <label>E-mail Institucional ou Pessoal *</label>
                      <input type="email" required />
                    </div>
                    <div class="cpd-field">
                      <label>Telefone de Contato *</label>
                      <input type="tel" required />
                    </div>
                  </div>
                </div>

                <div class="cpd-section-box">
                  <h3>A.2 Finalidade da Consulta e do Uso Pretendido</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Natureza da Finalidade *</label>
                      <select required>
                        <option value="">Selecione...</option>
                        <option>Pesquisa acadêmica (TCC, dissertação, tese, artigo)</option>
                        <option>Pesquisa institucional ou curatorial</option>
                        <option>Finalidade jornalística ou editorial</option>
                        <option>Produção audiovisual ou documental</option>
                        <option>Finalidade pessoal ou genealógica</option>
                        <option>Outra</option>
                      </select>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Descrição Sucinta do Projeto (mínimo de 100 caracteres) *</label>
                      <textarea id="descProjetoAcesso" rows="3" minlength="100" placeholder="Objetivos da pesquisa e relação com os itens solicitados" required></textarea>
                      <small id="counterAcesso" style="color:#64748b; margin-top:4px;">Mínimo de 100 caracteres (0 preenchidos).</small>
                    </div>
                    <div class="cpd-field">
                      <label>Órgão de Fomento / Financiamento (se houver)</label>
                      <input type="text" placeholder="FAPESP, CNPq, CAPES, etc." />
                    </div>
                    <div class="cpd-field">
                      <label>Aprovação em Comitê de Ética em Pesquisa (CEP/CONEP) *</label>
                      <select onchange="document.getElementById('boxUploadCepAcesso').style.display = (this.value === 'Sim') ? 'flex' : 'none'">
                        <option value="Não se aplica">Não se aplica</option>
                        <option value="Sim">Sim (anexar parecer consubstanciado)</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                    <div id="boxUploadCepAcesso" class="cpd-field cpd-grid-full" style="display:none;">
                      <label>Upload do Parecer Consubstanciado CEP/CONEP (Obrigatório para dados de pacientes/prontuários) *</label>
                      <input type="file" accept=".pdf" />
                    </div>
                  </div>
                </div>

                <div class="cpd-section-box">
                  <h3>A.3 Modalidade de Atendimento e Itens do Acervo</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Modalidade de Atendimento Pretendida *</label>
                      <select id="selModAcesso" required onchange="window.chavearModAcesso(this.value)">
                        <option value="">Selecione...</option>
                        <option value="presencial">Consulta Presencial (in loco, no Museu)</option>
                        <option value="remoto">Atendimento Remoto (envio de reprodução digital)</option>
                        <option value="ambas">Ambas (presencial e reprodução)</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Código(s) de Tombamento / Inventário *</label>
                      <input type="text" placeholder="Ex.: MHFMUSP-0142" required />
                    </div>
                    <div class="cpd-field">
                      <label>Quantidade Estimada de Itens / Páginas *</label>
                      <input type="number" min="1" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Descrição do(s) Item(ns) *</label>
                      <textarea rows="2" required></textarea>
                    </div>
                  </div>
                </div>

                <div id="blocoPresencialAcesso" class="cpd-section-box" style="display:none; background:#fafdfc; border-left:3px solid #136357; padding-left:14px;">
                  <h3>A.4 Consulta Presencial (In Loco) — Agendamento</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field">
                      <label>Data(s) Pretendida(s) para a Visita (até 3 opções) *</label>
                      <input type="text" placeholder="Opção 1, Opção 2, Opção 3" />
                    </div>
                    <div class="cpd-field">
                      <label>Turno Preferencial *</label>
                      <select><option>Manhã</option><option>Tarde</option></select>
                    </div>
                    <div class="cpd-field">
                      <label>Duração Estimada *</label>
                      <select><option>Até 2 horas</option><option>Meio período</option><option>Dia inteiro</option><option>Múltiplas sessões</option></select>
                    </div>
                    <div class="cpd-field">
                      <label>Equipamento Especial Necessário</label>
                      <input type="text" placeholder="Lupa, mesa de luz, leitor de microfilme" />
                    </div>
                  </div>
                </div>

                <div id="blocoRemotoAcesso" class="cpd-section-box" style="display:none; background:#fafdfc; border-left:3px solid #136357; padding-left:14px;">
                  <h3>A.5 Atendimento Remoto — Reprodução e Entrega</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field">
                      <label>Tipo de Reprodução Solicitada *</label>
                      <select>
                        <option>Consulta a cópia ou reprodução já existente</option>
                        <option>Reprodução fotográfica digital (nova captura)</option>
                        <option>Digitalização de documento textual</option>
                        <option>Cópia de arquivo audiovisual ou sonoro</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Resolução / Formato Desejado *</label>
                      <select><option>Baixa resolução (tela)</option><option>Alta resolução (editorial / impressão)</option></select>
                    </div>
                  </div>
                </div>

                <div class="cpd-section-box">
                  <h3>A.7 Declarações e Aceite (7 itens obrigatórios)</h3>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Declaro que as informações prestadas são verdadeiras e correspondem ao real propósito da pesquisa.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Comprometo-me a utilizar o material exclusivamente para a finalidade declarada, sem uso comercial não autorizado.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Comprometo-me a incluir o crédito institucional obrigatório ao Museu na forma por ele indicada.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Declaro estar ciente de que a reprodução não transfere direitos autorais de terceiros sobre a obra.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>No caso presencial, comprometo-me a observar as normas de manuseio e conservação preventiva.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Autorizo o tratamento dos dados pessoais nos termos da Lei nº 13.709/2018 (LGPD).</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-acesso" onchange="window.validarAcesso()" /><span>Declaro ter lido e concordar integralmente com as cláusulas deste instrumento.</span></label>
                </div>

                <div style="text-align: right; margin-top: 20px;">
                  <button type="submit" id="btnSubmitAcesso" class="cpd-btn-submit" disabled>Concordo e Enviar Solicitação</button>
                </div>
              </form>
            \`;
          };

          // =========================================================================
          // TEMPLATE 2: TERMO DE DOAÇÃO DE ACERVO
          // =========================================================================
          window.obterHtmlDoacao = function() {
            return \`
              <h2 class="cpd-header-subtitle">Termo de Doação de Acervo</h2>
              <div class="cpd-header-desc">
                Instrumento nativamente digital para doação, transferência plena de propriedade e custódia física de bens culturais ao Museu Histórico da FMUSP.
              </div>

              <form onsubmit="event.preventDefault(); alert('Proposta de doação submetida com sucesso! O comprovante digital foi gerado.');">
                
                <!-- A.1 Identificação do Doador -->
                <div class="cpd-section-box">
                  <h3>A.1 Identificação do Doador</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Tipo de Doador *</label>
                      <select required>
                        <option value="">Selecione...</option>
                        <option>Pessoa Física</option>
                        <option>Pessoa Jurídica</option>
                        <option>Espólio (Herdeiros e Sucessores)</option>
                        <option>Instituição Pública ou Privada</option>
                      </select>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Nome Completo ou Razão Social *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>CPF ou CNPJ *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Documento de Identificação (RG, CNH, Contrato Social) *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Endereço Completo (Logradouro, nº, compl., bairro, cidade, UF, CEP) *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Telefone de Contato *</label>
                      <input type="tel" required />
                    </div>
                    <div class="cpd-field">
                      <label>E-mail de Contato *</label>
                      <input type="email" required />
                    </div>
                    <div class="cpd-field">
                      <label>Grau de Relação com o Bem *</label>
                      <select required onchange="document.getElementById('boxProcDoacao').style.display = (this.value !== 'Proprietário original') ? 'flex' : 'none'">
                        <option>Proprietário original</option>
                        <option>Herdeiro-sucessor</option>
                        <option>Adquirente de terceiro</option>
                        <option>Representante institucional</option>
                      </select>
                    </div>
                    <div id="boxProcDoacao" class="cpd-field" style="display:none;">
                      <label>Procuração ou Termo de Representação *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                  </div>
                </div>

                <!-- A.2 Descrição do Bem Cultural -->
                <div class="cpd-section-box">
                  <h3>A.2 Descrição do Bem Cultural Doado</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Categoria Museológica *</label>
                      <select required>
                        <option value="">Selecione...</option>
                        <option>Instrumental médico-cirúrgico</option>
                        <option>Documento arquivístico</option>
                        <option>Obra bibliográfica ou raridade</option>
                        <option>Espécime biológico ou anatômico</option>
                        <option>Mobiliário e equipamento hospitalar histórico</option>
                        <option>Iconografia (fotografias, ilustrações, cartazes)</option>
                        <option>Objeto tridimensional diverso</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Denominação do Bem (popular e/ou técnica) *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Quantidade de Peças / Itens *</label>
                      <input type="number" min="1" value="1" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Descrição Física (material constitutivo, dimensões, marcas, nº de série) *</label>
                      <textarea rows="3" required></textarea>
                    </div>
                    <div class="cpd-field">
                      <label>Datação ou Período Estimado</label>
                      <input type="text" placeholder="Ex.: c. 1940, séc. XX" />
                    </div>
                    <div class="cpd-field">
                      <label>Estado de Conservação *</label>
                      <select required>
                        <option>Bom</option>
                        <option>Regular</option>
                        <option>Requer intervenção urgente</option>
                      </select>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Registro Fotográfico do Bem (Upload obrigatório de no mínimo 3 imagens) *</label>
                      <input type="file" accept=".jpg,.jpeg,.png" multiple required />
                    </div>
                    <div class="cpd-field">
                      <label>Riscos Biológicos, Químicos ou de Biossegurança? *</label>
                      <select onchange="document.getElementById('boxLaudoBioDoacao').style.display = (this.value === 'Sim') ? 'flex' : 'none'">
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Presença de Material Biológico Humano ou Dados de Pacientes? *</label>
                      <select id="selBioHumanoDoacao" onchange="document.getElementById('blocoCondicionalDoacaoA4').style.display = (this.value === 'Sim') ? 'block' : 'none'">
                        <option value="Não">Não</option>
                        <option value="Sim">Sim</option>
                      </select>
                    </div>
                    <div id="boxLaudoBioDoacao" class="cpd-field cpd-grid-full" style="display:none;">
                      <label>Laudo Técnico ou Ficha de Segurança</label>
                      <input type="file" accept=".pdf" />
                    </div>
                  </div>
                </div>

                <!-- A.3 Histórico de Proveniência -->
                <div class="cpd-section-box">
                  <h3>A.3 Histórico de Proveniência e Cadeia de Custódia</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Origem do Bem (relato de aquisição, herança, uso profissional) *</label>
                      <textarea rows="3" required></textarea>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Cadeia de Custódia Anterior (proprietários conhecidos em ordem cronológica)</label>
                      <textarea rows="2"></textarea>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label class="cpd-checkbox-row">
                        <input type="checkbox" required />
                        <span>Declaro a origem lícita do bem, o qual não é objeto de furto, extravio, expropriação ou litígio.</span>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- A.4 Bloco Condicional: Material Humano e LGPD -->
                <div id="blocoCondicionalDoacaoA4" class="cpd-section-box" style="display:none; background:#fff8f8; border-left:3px solid #8b1e2f; padding-left:14px;">
                  <h3 style="color:#8b1e2f;">A.4 Conformidade Ética e Dados Sensíveis (LGPD)</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field">
                      <label>Consentimento Informado do Paciente / Família</label>
                      <select><option>Não se aplica</option><option>Sim</option><option>Não</option></select>
                    </div>
                    <div class="cpd-field">
                      <label>Anonimização Prévia Realizada?</label>
                      <select><option>Sim</option><option>Não</option></select>
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Parecer CEP/CONEP (se houver)</label>
                      <input type="file" accept=".pdf" />
                    </div>
                  </div>
                </div>

                <!-- A.5 Condições e Restrições -->
                <div class="cpd-section-box">
                  <h3>A.5 Condições e Restrições Declaradas pelo Doador</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field">
                      <label>Restrições de Exposição ou Reprodução</label>
                      <input type="text" placeholder="Ex.: vedação de partes anatômicas sem tarjamento" />
                    </div>
                    <div class="cpd-field">
                      <label>Solicitação de Crédito Nominal ao Doador?</label>
                      <select><option>Sim</option><option>Não (manter anonimato)</option></select>
                    </div>
                  </div>
                </div>

                <!-- A.6 Declarações e Aceite (5 itens obrigatórios) -->
                <div class="cpd-section-box">
                  <h3>A.6 Declarações e Aceite (5 itens obrigatórios)</h3>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-doacao" onchange="window.validarDoacao()" /><span>Declaro que sou legítimo proprietário do(s) bem(ns) e que o mesmo está livre de ônus, gravames ou disputas judiciais.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-doacao" onchange="window.validarDoacao()" /><span>Declaro estar ciente de que a doação é gratuita, voluntária e irrevogável após a incorporação.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-doacao" onchange="window.validarDoacao()" /><span>Declaro ter lido e concordar integralmente com os termos e cláusulas deste instrumento.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-doacao" onchange="window.validarDoacao()" /><span>Autorizo o tratamento dos dados pessoais nos termos da Lei nº 13.709/2018 (LGPD).</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-doacao" onchange="window.validarDoacao()" /><span>Estou ciente de que o bem passará a integrar o patrimônio cultural sob salvaguarda institucional do Museu.</span></label>
                </div>

                <div style="text-align: right; margin-top: 20px;">
                  <button type="submit" id="btnSubmitDoacao" class="cpd-btn-submit" disabled>Concordo e Assinar Digitalmente</button>
                </div>
              </form>
            \`;
          };

          // =========================================================================
          // TEMPLATE 3: TERMO DE LICENCIAMENTO PARA USO COMERCIAL
          // =========================================================================
          window.obterHtmlLicenciamento = function() {
            return \`
              <h2 class="cpd-header-subtitle">Licenciamento para Uso Comercial de Acervo</h2>
              <div class="cpd-header-desc">
                Instrumento apartado para autorização onerosa de imagens, reproduções ou dados do acervo para finalidade comercial, editorial ou publicitária.
              </div>

              <form onsubmit="event.preventDefault(); alert('Proposta de Licenciamento submetida para análise técnica e jurídica!');">
                
                <!-- A.1 Dados do Solicitante -->
                <div class="cpd-section-box">
                  <h3>A.1 Dados do Solicitante Comercial</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Tipo de Solicitante *</label>
                      <select id="selTipoLic" required onchange="document.getElementById('boxRazaoLic').style.display = (this.value === 'Pessoa Jurídica') ? 'flex' : 'none'">
                        <option value="Pessoa Jurídica">Pessoa Jurídica</option>
                        <option value="Pessoa Física com atuação comercial">Pessoa Física com atuação comercial (autônomo, produtor)</option>
                      </select>
                    </div>
                    <div id="boxRazaoLic" class="cpd-field cpd-grid-full">
                      <label>Razão Social e Nome Fantasia *</label>
                      <input type="text" />
                    </div>
                    <div class="cpd-field">
                      <label>CNPJ ou CPF *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Comprovante de Inscrição (CNPJ) ou Identificação (CPF) *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Endereço Completo da Empresa / Solicitante *</label>
                      <input type="text" placeholder="Logradouro, nº, bairro, cidade, UF, CEP, país" required />
                    </div>
                    <div class="cpd-field">
                      <label>Representante Legal (Nome Completo e Cargo) *</label>
                      <input type="text" required />
                    </div>
                    <div class="cpd-field">
                      <label>Procuração ou Contrato Social de Representação *</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                    </div>
                    <div class="cpd-field">
                      <label>E-mail Corporativo *</label>
                      <input type="email" required />
                    </div>
                    <div class="cpd-field">
                      <label>Telefone Corporativo *</label>
                      <input type="tel" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Setor de Atuação da Empresa *</label>
                      <input type="text" placeholder="Ex.: Editorial, Audiovisual, Moda, Farmacêutico, Brindes, Tecnologia" required />
                    </div>
                  </div>
                </div>

                <!-- A.2 Detalhamento do Projeto Comercial -->
                <div class="cpd-section-box">
                  <h3>A.2 Detalhamento do Projeto Comercial</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field cpd-grid-full">
                      <label>Item(ns) do Acervo Pretendido(s) (Códigos de Tombamento) *</label>
                      <input type="text" placeholder="Ex.: MHFMUSP-0014, Coleção Histórica" required />
                    </div>
                    <div class="cpd-field cpd-grid-full">
                      <label>Descrição do Produto ou Serviço Final (mínimo de 200 caracteres) *</label>
                      <textarea id="descProjLic" rows="4" minlength="200" placeholder="Detalhe como a imagem será aplicada, qual o suporte (livro, embalagem, peça publicitária, streaming, produto físico) e objetivos comerciais" required></textarea>
                      <small id="counterLic" style="color:#64748b; margin-top:4px;">Mínimo de 200 caracteres (0 preenchidos).</small>
                    </div>
                    <div class="cpd-field">
                      <label>Amostra ou Mockup do Uso Pretendido (Upload opcional)</label>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                    </div>
                    <div class="cpd-field">
                      <label>Tiragem, Volume ou Alcance Estimado *</label>
                      <input type="text" placeholder="Ex.: 3.000 exemplares / visualizações estimadas" required />
                    </div>
                    <div class="cpd-field">
                      <label>Território de Distribuição / Comercialização *</label>
                      <select required>
                        <option>Nacional</option>
                        <option>Internacional</option>
                        <option>Digital sem restrição geográfica</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Canais de Distribuição / Veiculação *</label>
                      <input type="text" placeholder="Ex.: Livrarias, Ponto físico, E-commerce, Redes sociais" required />
                    </div>
                    <div class="cpd-field">
                      <label>Período de Exploração Comercial Pretendido *</label>
                      <input type="text" placeholder="Ex.: 12 meses (01/2027 a 12/2027)" required />
                    </div>
                    <div class="cpd-field">
                      <label>Exclusividade Pretendida?</label>
                      <select onchange="document.getElementById('boxExclusividadeLic').style.display = (this.value === 'Sim') ? 'flex' : 'none'">
                        <option value="Não">Não (regra institucional)</option>
                        <option value="Sim">Sim (sujeito à diretoria)</option>
                      </select>
                    </div>
                    <div id="boxExclusividadeLic" class="cpd-field cpd-grid-full" style="display:none;">
                      <label>Justificativa para Solicitação de Exclusividade *</label>
                      <textarea rows="2"></textarea>
                    </div>
                  </div>
                </div>

                <!-- A.3 Condições Financeiras -->
                <div class="cpd-section-box">
                  <h3>A.3 Condições Financeiras</h3>
                  <div class="cpd-grid-2">
                    <div class="cpd-field">
                      <label>Modalidade de Contrapartida *</label>
                      <select id="selFinancLic" required onchange="document.getElementById('boxIsencaoLic').style.display = (this.value === 'Isenção') ? 'flex' : 'none'">
                        <option>Taxa fixa única de licenciamento</option>
                        <option>Royalties sobre faturamento</option>
                        <option>Modelo híbrido (taxa fixa + royalties)</option>
                        <option value="Isenção">Isenção (projetos educacionais / sem fins lucrativos)</option>
                      </select>
                    </div>
                    <div class="cpd-field">
                      <label>Faturamento ou Preço de Venda Estimado (R$) *</label>
                      <input type="text" placeholder="Base de cálculo de eventuais royalties" required />
                    </div>
                    <div id="boxIsencaoLic" class="cpd-field cpd-grid-full" style="display:none;">
                      <label>Justificativa Fundamentada para Pedido de Isenção *</label>
                      <textarea rows="2"></textarea>
                    </div>
                  </div>
                </div>

                <!-- A.4 Declarações Éticas Específicas -->
                <div class="cpd-section-box">
                  <h3>A.4 Declarações Éticas (Acervo Médico-Científico)</h3>
                  <label class="cpd-checkbox-row">
                    <input type="checkbox" required />
                    <span>Declaro que o produto/serviço não promove tabaco, armas, discriminação, práticas de saúde sem comprovação científica ou exploração do sofrimento humano.</span>
                  </label>
                  <label class="cpd-checkbox-row">
                    <input type="checkbox" required />
                    <span>Declaro que o uso não fará alegações médicas enganosas nem induzirá endosso institucional do Museu ou da USP.</span>
                  </label>
                </div>

                <!-- A.5 Declarações e Aceite (8 itens obrigatórios) -->
                <div class="cpd-section-box">
                  <h3>A.5 Declarações e Aceite (8 itens obrigatórios)</h3>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Declaro que as informações prestadas são verdadeiras, completas e correspondem ao real projeto comercial.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Comprometo-me a utilizar os itens exclusivamente nos termos, suportes, território e período aprovados.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Comprometo-me a incluir o crédito institucional obrigatório ao Museu em todo e qualquer material produzido.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Declaro estar ciente de que os direitos morais sobre o acervo são inalienáveis e permanecem com o Museu.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Declaro que o produto/serviço não associará o acervo a contextos antiéticos ou depreciativos.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Comprometo-me ao pagamento tempestivo das contrapartidas financeiras pelos canais oficiais da USP.</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Autorizo o tratamento dos dados pessoais conforme a Lei nº 13.709/2018 (LGPD).</span></label>
                  <label class="cpd-checkbox-row"><input type="checkbox" class="chk-lic" onchange="window.validarLic()" /><span>Declaro ter lido e concordar integralmente com as cláusulas do Termo de Licenciamento Comercial.</span></label>
                </div>

                <div style="text-align: right; margin-top: 20px;">
                  <button type="submit" id="btnSubmitLic" class="cpd-btn-submit" disabled>Concordo e Enviar Proposta de Licenciamento</button>
                </div>
              </form>
            \`;
          };

          // =========================================================================
          // CONFIGURAÇÃO DOS GATILHOS E REGRAS DE VALIDAÇÃO ATIVA (PARTE C)
          // =========================================================================
          window.inicializarEventosFormulario = function(tipo) {
            if (tipo === 'acesso') {
              const txt = document.getElementById('descProjetoAcesso');
              const c = document.getElementById('counterAcesso');
              if (txt && c) {
                txt.addEventListener('input', function() {
                  c.textContent = 'Mínimo de 100 caracteres (' + this.value.length + ' preenchidos).';
                  c.style.color = (this.value.length >= 100) ? '#136357' : '#8b1e2f';
                });
              }
            } else if (tipo === 'licenciamento') {
              const txt = document.getElementById('descProjLic');
              const c = document.getElementById('counterLic');
              if (txt && c) {
                txt.addEventListener('input', function() {
                  c.textContent = 'Mínimo de 200 caracteres (' + this.value.length + ' preenchidos).';
                  c.style.color = (this.value.length >= 200) ? '#136357' : '#8b1e2f';
                });
              }
            }
          };

          window.chavearModAcesso = function(val) {
            const p = document.getElementById('blocoPresencialAcesso');
            const r = document.getElementById('blocoRemotoAcesso');
            if (p) p.style.display = (val === 'presencial' || val === 'ambas') ? 'block' : 'none';
            if (r) r.style.display = (val === 'remoto' || val === 'ambas') ? 'block' : 'none';
          };

          window.validarAcesso = function() {
            const checks = Array.from(document.querySelectorAll('.chk-acesso'));
            const ok = checks.length === 7 && checks.every(c => c.checked);
            const btn = document.getElementById('btnSubmitAcesso');
            if (btn) btn.disabled = !ok;
          };

          window.validarDoacao = function() {
            const checks = Array.from(document.querySelectorAll('.chk-doacao'));
            const ok = checks.length === 5 && checks.every(c => c.checked);
            const btn = document.getElementById('btnSubmitDoacao');
            if (btn) btn.disabled = !ok;
          };

          window.validarLic = function() {
            const checks = Array.from(document.querySelectorAll('.chk-lic'));
            const ok = checks.length === 8 && checks.every(c => c.checked);
            const btn = document.getElementById('btnSubmitLic');
            if (btn) btn.disabled = !ok;
          };
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
