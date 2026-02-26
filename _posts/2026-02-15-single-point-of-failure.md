---
layout: post
image: assets/images/system-design/capa-spof.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Single Point of Failure, Disaster Recovery e KPI's de Falha
---


**Em sistemas distribuídos, a confiabilidade é um dos temas de maior importância na construção de serviços.** Existem infinitas possibilidades que podem acarretar alta disponibilidade ou problemas de disponibilidade de um sistema, e uma das formas de identificar oportunidades de otimização de [resiliência](/resiliencia/), além de [encontrar gargalos](/capacity-planning/), é identificar os Pontos Únicos de Falha entre os componentes. 

**Neste rápido capítulo, vamos explorar de forma simples esse conceito e treinar o olhar crítico para identificar possíveis riscos e oportunidades.** Vamos aproveitar também o gancho para elaborar um próximo passo: detalhar as estratégias de Disaster Recovery de mercado.

{% include latex.html %}

<br>

# Definindo um Single Point of Failure

**Um Single Point of Failure (SPoF), ou "Ponto Único de Falha", é um termo usado para se referir a qualquer componente, serviço ou recurso centralizado cuja falha provoca a indisponibilidade total ou parcial de um ou mais sistemas.** Um Ponto Único de Falha pode representar um [Banco de Dados](/databases/), um [Balanceador de Carga](/load-balancing/), um [API Gateway](/api-gateway/), um broker de mensageria ou até mesmo outro microserviço que, em caso de queda, não exista nenhum caminho alternativo para que as requisições sejam estabelecidas.

Imagine que uma cidade só possua como forma de acesso uma única ponte. Essa ponte seria, no mundo real, um ponto único de falha. Por mais que ainda exista possibilidade de acesso de barco, helicóptero ou balsa, não seriam todas as pessoas que teriam acesso, e a entrada e saída, bem como o envio de recursos e afins, estariam ainda gravemente impactados. **Isso seria um Ponto Único de Falha que gera uma indisponibilidade total ou parcial de acesso à região.**

**São raros os sistemas que não possuam nenhum tipo de Ponto Único de Falha.** A partir disso, podemos assumir algumas premissas, como a de que, quando um SPoF falha, o sistema pode entrar em modo degradado, no melhor dos casos, ou parar completamente, no pior. Logo, quanto maior a responsabilidade de um componente, maior o impacto de sua falha caso não existam [Fluxos de Fallback](/resiliencia/). Outra característica importante é que recuperações manuais ou rebuilds desses componentes levam tempo e podem causar perdas significativas.

<br>

# Identificando Single Points of Failure

**Identificar os SPoF de algum ambiente pode parecer extremamente trivial, porém pode se tornar uma tarefa árdua e de grande esforço corporativo em ambientes grandes e de larga escala**, pois precisamos mapear quais são as funcionalidades mais críticas, documentar cada serviço, seus clusters, nodes, servidores, databases, componentes de rede, brokers de eventos e mensagens e até fornecedores, sem falar dos times responsáveis e das formas de acionamento de cada um deles.

![SPOF](/assets/images/system-design/spof-identiticacao.drawio.png)

Durante esse mapeamento, é **necessário desenhar um "fluxo feliz" de cada transação dessas funcionalidades críticas**, **mapear todos os atores, desde a requisição de fato até a resposta para o usuário**. Em seguida, é necessário inspecionar **quais desses componentes não possuam réplicas](/replicacao/), [implementem padrões de resiliência](/resiliencia/), fallbacks e mecanismos que consigam assumir esses fluxos alternativos automaticamente**. São nesses atores que são encontrados **candidatos a se tornarem pontos únicos de falha** em um fluxo crítico.

**A identificação de "Pontos Únicos de Falha" não é uma tarefa pontual ou fácil; necessita de constante revisão arquitetural e esforço corporativo para que seja realmente efetiva**, ainda mais se começarmos a descer o nível de abstração de virtualização, networking, replicação entre provedores etc.

<br>

# Lidando com Single Points of Failure

**Existem estratégias comuns que podem nos auxiliar a corrigir e, principalmente, evitar a criação de SPoFs; nesta seção, iremos identificar, de forma macro, como endereçar algumas delas.** Lidar com SPoFs não significa simplesmente duplicar componentes indiscriminadamente. **O objetivo central é reduzir o blast radius, aumentar a previsibilidade sob falha e diminuir o tempo de recuperação.** Toda estratégia de mitigação envolve trade-offs entre custo, complexidade, latência e consistência.

**A eliminação completa de SPoFs é praticamente impossível em sistemas reais**, especialmente quando consideramos limitações físicas, econômicas e organizacionais. A discussão deve considerar o custo-benefício da redundância perante as necessidades e o momento da empresa. Às vezes, é muito mais benéfico aceitar a falha momentânea perante um incidente de infraestrutura global do que lidar com os custos extensivos de manter múltiplos ambientes e redundâncias para lidar com desastres momentâneos.

## Design Stateless de Aplicação

**Aplicações que mantêm estado local tendem a criar afinidade entre cliente e instância, dificultando a redistribuição de carga em caso de falha.** Sessões armazenadas em memória, caches locais indispensáveis ou fluxos que dependem de contexto interno tornam a substituição de instâncias mais lenta e arriscada. **Ao adotar um design stateless, o estado é externalizado para camadas distribuídas e resilientes, permitindo que qualquer instância processe qualquer requisição.** Isso reduz significativamente a fricção durante eventos de falha, pois a remoção de uma instância não implica perda de contexto.

No entanto, externalizar o estado desloca a responsabilidade de resiliência para a camada de persistência. **Bancos de dados, caches distribuídos e sistemas de armazenamento passam a concentrar o risco anteriormente diluído na aplicação.**

## Redundância e Replicação Ativa 

![Ativa](/assets/images/system-design/spof-ativa.drawio.png)

**Uma redundância ou replicação ativa é um modelo no qual todas as instâncias e réplicas de um serviço trabalham simultaneamente para receber e processar as requisições da carga de trabalho.** Resumidamente, nenhuma das réplicas tem como objetivo ficar ociosa aguardando uma falha geral para que assuma o processamento primário das requisições. Esse arranjo arquitetural pode ser encontrado em réplicas de aplicações atrás de balanceadores de carga, onde todas são verificadas quanto à integridade e recebem carga quase que uniformemente mediante a solicitação do serviço, ou em sistemas de mensageria, onde todas as réplicas estão conectadas aos tópicos/filas e podem receber mensagens e eventos para processar. No geral, esse tipo de arquitetura, **quando trabalhada sem estado, permite que, na falha eventual de pequenas quantidades de réplicas, o sistema continue operando e consiga se recuperar sem gerar grandes danos** (ou de preferência, nenhum dano) à experiência do cliente.

Na replicação ativa, todas as instâncias operam simultaneamente processando carga real. **Esse modelo dilui o impacto da falha de uma ou mais réplicas, pois as demais continuam absorvendo requisições.** Balanceadores de carga distribuindo tráfego uniformemente e consumidores paralelos processando mensagens em tópicos são exemplos mais básicos dessa abordagem.

Esse modelo também pode ser encontrado em réplicas de leitura de bancos de dados que possuam estado transacional, contendo todos os dados escritos nas réplicas primárias. Além de possuir um viés de disponibilidade, onde essa **réplica é capaz de assumir o papel de escrita em caso de falha na réplica principal**, pode exercer funcionalidades ativas na segregação de escrita e leitura em diferentes instâncias.

**Esse modelo, entretanto, exige mecanismos consistentes de sincronização de dados, especialmente quando há escrita concorrente.** Em bancos de dados com réplicas de leitura promovíveis, a replicação ativa pode tanto aumentar a disponibilidade quanto melhorar a performance por meio da segregação de leitura e escrita.


## Redundância e Replicação Passiva 

![Passiva](/assets/images/system-design/spof-passiva.drawio.png)

**Na replicação passiva, apenas uma instância atua como primária, enquanto outra permanece em standby, aguardando falha para assumir.** Esse modelo reduz a complexidade quando comparado ao ativo-ativo somente em termos de replicação e latência, mas introduz dependência crítica nos mecanismos de detecção e promoção, e nos faz assumir que precisamos ter ambientes altamente replicados que estejam disponíveis para assumir um chaveamento brusco ou gradual sem piorar a experiência do cliente ou criar inconsistências irrecuperáveis. 

Se a falha não for detectada rapidamente ou se a promoção for manual e lenta, o tempo de indisponibilidade pode ser significativo.

## Failover Automático 

![Circuit Breaker](/assets/images/system-design/spof-circuit-breaker.drawio.png)

**Failover automático depende de monitoramento confiável, critérios claros de decisão e mecanismos transparentes de redirecionamento de tráfego.** A estratégia é empregar mecanismos como [Circuit Breakers](/resiliencia) ou feature toggles que saibam detectar padrões de falha do sistema e realizar "chaveamentos" para fluxos alternativos. Esses fluxos podem tanto envolver o redirecionamento do tráfego para uma zona passiva, a desativação de uma zona ativa-ativa, quanto assumir sistemas secundários de contingência que cumpram os mesmos objetivos com taxas menores, enfileiramentos maiores ou parceiros secundários.

<br>

# Disaster Recovery 

**O Disaster Recovery é um conjunto de estratégias, processos, arquiteturas e automações projetadas para restaurar sistemas após eventos de grande impacto que ultrapassam o escopo de falhas locais corriqueiras da aplicação.** Desastres não são falhas normais. São eventos de grande escala que ultrapassam os limites aceitáveis de operação de um produto, como, por exemplo, quedas de Cloud Providers, incidentes climáticos, downtimes de componentes críticos e centralizados etc.

**Diferentemente da mitigação de SPoFs, que normalmente atua em nível de componente, o Disaster Recovery opera no nível de produto, com escopo amplamente sistêmico e até mesmo regional.** Um SPoF pode derrubar um serviço específico. Um desastre pode comprometer um datacenter inteiro, uma região de nuvem ou até múltiplos serviços simultaneamente. Incêndios, falhas elétricas, corrupção massiva de dados, erros humanos em larga escala, ataques cibernéticos ou falhas generalizadas de provedores são exemplos comuns. **Existem alguns modos de operação de DR que podemos avaliar para implementar conforme as necessidades do cenário.**

## Ativo-Ativo

![Ativo / Ativo](/assets/images/system-design/ativo-ativo.drawio.png)

**Arquiteturas ativo-ativo permitem que múltiplas regiões ou clusters recebam tráfego simultaneamente, elevando significativamente a disponibilidade global.** Contudo, essa abordagem amplia drasticamente a complexidade da consistência distribuída.

Modelos multi-master exigem estratégias explícitas de resolução de conflitos, como last write wins ou estruturas convergentes como CRDTs. **A disponibilidade aumentada vem acompanhada de maior esforço operacional e complexidade cognitiva.** Em muitos casos, o ativo-ativo distribui o risco, mas não o elimina; apenas torna o impacto menos concentrado.

## Ativo-Passivo

![Ativo / Passivo](/assets/images/system-design/ativo-passivo.drawio.png)

**O modelo ativo-passivo mantém uma região primária processando tráfego, enquanto outra permanece preparada para assumir em caso de desastre.** Essa abordagem equilibra simplicidade e resiliência. Embora menos complexa que o ativo-ativo, ainda protege contra falhas regionais significativas.

Esse modelo equilibra custo e resiliência, sendo amplamente utilizado em ambientes regulados ou que exigem consistência forte. No entanto, a sincronização contínua de dados precisa ser validada regularmente e, no momento de chaveamento, a região passiva pode lidar com consistência eventual de dados até que os mecanismos de sincronização estejam atualizados.

## Pilot Light (Luz Piloto)

![Pilot Light](/assets/images/system-design/pilot-light.drawio.png)

**No modelo Pilot Light, apenas os componentes essenciais permanecem ativos na região secundária, como bancos de dados replicando continuamente.** Os demais recursos são provisionados sob demanda durante o desastre. Essa estratégia reduz custos operacionais, mas aumenta o tempo de recuperação, pois parte da infraestrutura precisa ser ativada e escalada após o evento.

O modelo Pilot Light assume explicitamente que desastres regionais são eventos raros e que parte da infraestrutura pode ser provisionada sob demanda caso ocorram. Ele reduz o custo operacional, mas aumenta o tempo de recuperação. **O sucesso dessa estratégia depende fortemente do nível de automação para acioná-la em caso de falhas**, necessitando de uma quantidade significativa de testes e simulações de desastres para validar que o warm-up dos recursos em standby será provisionado de forma suficiente e em tempo hábil para o chaveamento do tráfego, sem impactar excessivamente a experiência de uso do cliente.

<br>

# Métricas e KPIs de Recuperação

**Quando estabelecemos que tanto a eliminação de desastres quanto a inexistência completa de Single Points of Failure são, de fato, impossíveis, o trabalho de projetar sistemas de alta disponibilidade operacional passa a ser sobre criar camadas de resiliência e contenção desses eventuais impactos.** Nesse contexto, precisamos metrificar a efetividade das estratégias empregadas ao longo do tempo para comparações, a fim de identificar se estamos degradando ou melhorando a experiência do sistema.

Para elaborar essa discussão, precisamos sair do campo qualitativo das estratégias e nos focar nos aspectos quantitativos, governando as decisões por métricas. **As principais métricas que iremos abordar serão o MTTD, MTBF, MTTR, RTO e RPO.** Elas não são independentes; formam um sistema matematicamente interligado que determina disponibilidade, risco e impacto das falhas de sistemas de forma mais profissional e embasada.

<br>

## MTTD - Mean Time to Detect

**O MTTD (Mean Time to Detect) representa o tempo médio entre o início de uma falha e sua detecção pelo sistema ou equipe operacional.** É uma métrica que mede o tempo médio que leva para uma equipe ou sistema identificar que um incidente ou falha ocorreu. Imagine um serviço de e-commerce que sofre um problema em sua base de dados, causando lentidão nas transações dos clientes. O MTTD seria o tempo desde o início dessa lentidão até o momento em que a equipe responsável é acionada para intervenção.

**O cálculo do MTTD é a soma das diferenças entre a detecção e o início dos incidentes ao decorrer do tempo, dividida pelo número de incidentes no mesmo período.**

\begin{equation}
MTTD = \frac{\text{Diferença Entre O Início e a Detecção dos Incidentes}}{\text{Número de Incidentes}}
\end{equation}

Por exemplo, temos a tabela dos últimos incidentes de uma aplicação durante um período:

| Hora de Início | Hora da Detecção | Tempo Total |
|----------------|-------------------|-------------|
| 11:00 AM       | 12:00 PM          | 60 min      |
| 05:12 AM       | 05:30 AM          | 18 min      |
| 03:40 PM       | 04:00 PM          | 20 min      |
| 10:12 PM       | 10:33 PM          | 21 min      |
| 09:11 AM       | 10:02 AM          | 51 min      |

<br>

Podemos calcular o MTTD do sistema da seguinte forma:

\begin{equation}
MTTD = \frac{(60 + 18 + 20 + 21 + 51)}{5}
\end{equation}

\begin{equation}
MTTD = \text{34 minutos}
\end{equation}

**Ele está diretamente ligado ao investimento de tempo e inteligência de engenharia em observabilidade sistêmica**, contemplando logs, métricas, traces e alertas que garantam que o time esteja sempre monitorando os indicadores corretos e recebendo notificações com antecedência.

Um MTTD alto indica ausência de observabilidade em pontos importantes da solução. Em sistemas distribuídos complexos, falhas raramente são binárias no âmbito de disponível e não disponível, e sim degradam progressivamente, como aumentos de latência, formação de filas internas, saturação, erros intermitentes e timeouts em cascata. **Um MTTD baixo é importante, pois quanto mais rápido uma falha é detectada, mais cedo o processo de recuperação pode ser iniciado.**

<br>

## MTTR - Mean Time to Repair

**O Mean Time to Repair (MTTR) é o tempo médio necessário para reparar uma falha e restaurar o sistema à operação normal de forma completa.** É uma métrica que acompanha diretamente o MTTD. Em estratégias de recuperação de desastres, minimizar o MTTR é o indicador que traduz operacionalmente se estamos trabalhando corretamente os pontos de falha e reduzindo o impacto no usuário final.

**O cálculo do MTTR é a soma das diferenças de tempo entre a detecção e a recuperação do incidente, dividida pelo número de incidentes no mesmo período.**

\begin{equation}
MTTR = \frac{\text{Diferença Entre a Detecção e a Resolução dos Incidentes}}{\text{Número de Incidentes}}
\end{equation}

Por exemplo:

| Hora da Detecção | Hora da Recuperação | Tempo Total |
|------------------|---------------------|-------------|
| 12:00 AM         | 01:30 AM            | 90 min      |
| 05:30 AM         | 07:15 AM            | 105 min     |
| 04:00 PM         | 06:12 PM            | 132 min     |
| 10:33 PM         | 10:55 PM            | 22 min      |
| 11:02 AM         | 02:15 PM            | 193 min     |

<br>

Podemos calcular o MTTR do sistema da seguinte forma:

\begin{equation}
MTTR = \frac{(90 + 105 + 132 + 22 + 193)}{5}
\end{equation}

\begin{equation}
MTTR = \text{108 minutos}
\end{equation}

**Um MTTR baixo significa que o time de operação sabe lidar com as falhas conhecidas e restabelecer os serviços de forma eficiente e coordenada rapidamente.** Um MTTR alto significa o inverso: que os times levam muito tempo para restabelecer os serviços, seja pela complexidade operacional envolvida, seja pela inexistência de processos bem definidos e documentados para recuperação de falhas.

Para reduzir o MTTR, o time de engenharia precisa focar em documentação, runbooks, automações de tarefas de recuperação e self-healing, scripts de rollback, reinício de serviços, as mesmas ferramentas de diagnóstico que dão suporte ao MTTD, além de processos de escalonamento de incidentes e comunicações corporativas fortes e disseminadas culturalmente.

<br>

## MTBF - Mean Time Between Failures

**O Mean Time Between Failures (MTBF) é uma métrica que indica o tempo médio esperado entre duas falhas de um mesmo sistema.** Basicamente, é a diferença de tempo entre dois acionamentos graves. É um dos indicadores de confiabilidade mais importantes, pois, quanto maior o MTBF, maior a confiabilidade do sistema em questão.

Diferentemente das métricas anteriores, o MTBF considera o intervalo entre o término de um incidente e o início do próximo.

\begin{equation}
MTBF = \frac{\text{Soma dos Tempos de Operação Saudável}}{\text{Número de Falhas}}
\end{equation}

| Ordem | Recuperação Anterior | Próximo Início          | Intervalo |
|-------|----------------------|--------------------------|-----------|
| 1     | 07:15 AM             | 09:11 AM                 | 116 min   |
| 2     | 02:15 PM             | 03:40 PM                 | 85 min    |
| 3     | 06:12 PM             | 10:12 PM                 | 240 min   |
| 4     | 10:55 PM             | 05:12 AM (dia seguinte)  | 377 min   |

<br>

Podemos calcular o MTBF do sistema da seguinte forma:

\begin{equation}
MTBF = \frac{(116 + 85 + 240 + 377)}{4}
\end{equation}

\begin{equation}
MTBF = 204{,}5 \text{ minutos}
\end{equation}

**Um MTBF alto sugere que um sistema é mais estável e exige menos intervenções do time técnico em ambiente produtivo.** Um MTBF baixo sugere que existem muitos componentes frágeis ou estratégias que precisam de revisão. Esta métrica é fundamental para o planejamento de capacidade, manutenção preventiva e avaliação da qualidade de hardware e software.

<br>

## RTO - Recovery Time Objective

**O Recovery Time Objective (RTO) é o tempo máximo aceitável que um sistema ou serviço pode ficar indisponível após a detecção de uma falha ou desastre.** Esse número tem interesse contratual, pois vai determinar qual ferramental, estratégias e investimentos serão necessários para garantir a continuidade operacional. Soluções mais rápidas de recuperação geralmente são mais caras e complexas de implementar. Um RTO de "zero" significa que o sistema deve ser recuperado instantaneamente e os clientes não têm apetite para falhas em nenhum aspecto, o que é extremamente difícil e caro de alcançar. Atingir o RTO envolve projetar sistemas com redundância, automação de failover, backups eficientes e processos de restauração bem testados, identificando e criando fallbacks para o maior número possível de SPoFs conhecidos.

Uma aplicação bancária transacional pode ter um RTO de 1 hora, significando que, após qualquer tipo de desastre, ela deve estar completamente operacional em, no máximo, 60 minutos. Já um blog pessoal, site institucional ou pequenos e-commerces podem ter um RTO de 12, 24 ou 48 horas, pois o impacto de uma indisponibilidade, por mais que exista, é menor. **Os dois exemplos guiariam, por exemplo, o nível de investimento e engenharia que deve ser inserido na estratégia.** Garantir ambientes celulares, múltiplos shardings, arquiteturas multi-datacenter, multi-região e multi-cloud em sistemas que possuem RTOs menos exigentes não faz sentido financeiramente. Já no cenário oposto, pode justificar o investimento e a complexidade.

<br>

## RPO - Recovery Point Objective

**O RPO (Recovery Point Objective) define a quantidade máxima de dados que pode ser perdida após um desastre.** Normalmente, é uma métrica relacionada à defasagem entre os dados primários e os backups e aos lags de replicação. Ela, assim como o RTO, é uma métrica contratual. Essa métrica guia o nível de investimento necessário em backups e estratégias de replicação de dados. Se backups ocorrem a cada 12 horas, tenho um RPO de 12 horas. Se possuo 5 minutos de lag de replicação entre os dados de um sistema primário e secundário, meu RPO é 5 minutos.

Um RPO baixo ou próximo de zero significa que a perda de dados deve ser mínima ou inexistente, exigindo soluções de replicação contínua ou backups muito frequentes. Um RPO de "zero" normalmente implica replicação síncrona ou soluções de banco de dados distribuídos altamente consistentes entre todas as zonas e regiões secundárias do dado.

**O nível de criticidade do dado guia a necessidade do RPO.** Sistemas financeiros, transacionais, hospitalares ou de aviação precisam ter acordos de RPO mais criteriosos. Sistemas como redes sociais, sistemas institucionais e afins podem lidar com opções mais flexíveis.


<br>

### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)

[Single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure)

[What is a single point of failure?](https://www.ibm.com/docs/en/zos/3.1.0?topic=data-what-is-single-point-failure)

[Why a Single Point of Failure (SPOF) is Scary](https://www.anomali.com/blog/why-single-point-of-failure-is-scary)

[Understanding Single Point Failures: A Guide to System Resilience](https://bryghtpath.com/single-point-failures/)

[Qual a diferença entre MTTR, MTBF, MTTD e MTTF?](https://www-logicmonitor-com.translate.goog/blog/whats-the-difference-between-mttr-mttd-mttf-and-mtbf?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc)

[What Is MTTD? The Mean Time to Detect Metric, Explained](https://www.splunk.com/en_us/blog/learn/mean-time-to-detect-mttd.html)

[What Is MTTD (Mean Time to Detect)? A Detailed Explanation](https://www.sentinelone.com/blog/mttd-mean-time-to-detect-detailed-explanation/)