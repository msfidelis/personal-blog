---
layout: post
image: assets/images/system-design/capa-resiliencia.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - Single Point of Failure e Disaster Recovery
---


Em sistemas ditribuidos, a confiabilidade é um dos temas de maior importância na construção de serviços. Existem infinitas possibilidades que podem acarretar em alta disponibilidade ou problemas de disponibilidade de um sistema, e uma das formas de identificar oportunidades de otimização de [resiliência](), além de [encontrar gargalos](), é identificar os Pontos Unicos de Falha entre os componentes. Nesse rápido capítulo, vamos explorar de forma simples esse conceito e treinar o olhar crítico para identificar possíveis riscos e oportunidades.

{% include latex.html %}

<br>

# Definindo um Single Point of Failure

Um Single Point of Failure, SPoF, ou "Ponto Único de Falha", é um termo usado para se referir a qualquer componente, serviço ou recurso centralizado cuja a falha provoca a indisponibilidade total ou parcial de um ou mais sistemas. Um Ponto Único de Falha pode representar um [Banco de Dados](), um [Balanceador de Carga](), um [API Gateway](), um broker de mensageria ou até mesmo outro microserviço que em caso de queda, não exista nenhum caminho alternativo para que as requisições sejam estabelecidas. 

Imagine que uma cidade só possua como forma de acesso uma unica ponte. Essa ponte seria no mundo real, um ponto único de falha. Por mais que ainda exista possibilidade de acesso de barco, helicoptero ou balça, não seriam todas as pessoas que teriam acesso e a entrada e saída, e o envio de recursos e afins estaria ainda gravemente impactado. Isso seria um Ponto Único de Falha que gera uma indisponibilidade total ou parcial de acesso a região. 

São raros os sistemas que não possuam nenhum tipo de Pontos Únicos de Falha, a partir disso podemos assumir algumas premissas, como a que quando um SPoF falha, o sistema pode entrar em modo degradado no melhor dos casos, ou parar completamente no pior. Logo, quanto maior a responsabilidade de um componente, maior o impacto de sua falha caso não existam [Fluxos de Fallback](). Outra característica importante é que recuperações manuais ou rebuilds desses componentes levam tempo e podem causar perdas significativas. 

<br>

# Identificando Single Point of Failures

Identificar os SPoF de algum ambiente pode parecer extremamente trivial, porém se tornar uma tarefa árdua de esforço corporativo em ambientes grandes e de larga escala, pois precisamos mapear quais são as funcionalidades mais críticas, documentar cada serviço, seus clusters, nodes, servidores, databases, componentes de rede, brokers de eventos e mensagens e até fornecedores, sem falar dos times responsáveis e formas de acionamento de cada um deles. 

![SPOF](/assets/images/system-design/spof-identiticacao.drawio.png)

Durante esse mapeamento, é **necessário desenhar um "fluxo feliz" de cada transação dessas funcionalidades críticas**, **mapear todos os atores, desde a requisição de fato, até a resposta para o usuário**. Em seguida é necessário inspecionar **quais desses componentes [não possuam réplicas](), [implementem padrões de resiliência](), fallbacks e mecanismos que consigam assumir esses fluxos alternativos automaticamente**. São nesses atores que são encontrados **candidatos para se tornarem pontos únicos de falha** num fluxo crítico. 

A identificação de "Pontos únicos de falha" não é uma tarefa pontual ou fácil, necessita de constante revisão arquitetural e força corporativa para que seja realmente efetivo, ainda mais se começarmos a descer o nível de abstrações de virtualização, networking, replicação de provedores e etc.

## 

# Lidando com Single Point of Failures

Existem estratégias comuns que podem nos auxiliar corrigir e principalmente evitar a criação de SPoF's, nesta sessão iremos identificar de forma macro como endereçar algumas delas. Lidar com SPoFs não significa simplesmente duplicar componentes indiscriminadamente. O objetivo central é reduzir o blast radius, aumentar a previsibilidade sob falha e diminuir o tempo de recuperação. Toda estratégia de mitigação envolve trade-offs entre custo, complexidade, latência e consistência.

A eliminação completa de SPoFs é praticamente impossível em sistemas reais, especialmente quando consideramos limitações físicas, econômicas e organizacionais. A discussão é o custo e benefício da redundância perante as necessidades e momento da empresa. As vezes é muito mais benéfico aceitar a falha momentânea perante a um incidente de infraestrutura global do que lidar com os custos extensivos de manter multiplos ambientes e redundâncias para lidar com desastres momentâneos. 

## Design Stateless de Aplicação

Aplicações que mantêm estado local tendem a criar afinidade entre cliente e instância, dificultando redistribuição de carga em caso de falha. Sessões armazenadas em memória, caches locais indispensáveis ou fluxos que dependem de contexto interno tornam a substituição de instâncias mais lenta e arriscada. Ao adotar um design stateless, o estado é externalizado para camadas distribuídas e resilientes, permitindo que qualquer instância processe qualquer requisição. Isso reduz significativamente a fricção durante eventos de falha, pois a remoção de uma instância não implica perda de contexto.

No entanto, externalizar estado desloca a responsabilidade de resiliência para a camada de persistência. Bancos de dados, caches distribuídos e sistemas de armazenamento passam a concentrar o risco anteriormente diluído na aplicação.

## Redundância e Replicação Ativa 

![Ativa](/assets/images/system-design/spof-ativa.drawio.png)

Uma redundância ou replicação ativa é um modelo onde todas as intâncias e replicas de um serviço trabalham simultâneamente para receber e processar as requisições da carga de trabalho. Resumidamente, nenhuma das replicas tem como objetivo ficar ociosa aguardando uma falha geral para que assuma o processamento primário das requisições. Esse arranjo arquitetural pode ser encontrado em replicas de aplicações atrás de balanceadores de carga, onde todos são verificados em integridade e recebem carga quase que uniformemente mediante a solicitação do serviço, ou em mensageria onde todas as replicas estão conectadas nos tópicos/filas e podem receber mensagens e eventos para processar. No geral, esse tipo de arquitetura, quando trabalhada sem estado, permite que na falha eventual de pequenas quantidade das replicas, continue operando e consiga se recuperar sem gerar grandes ou nenhum dano a experiência do cliente.

Na replicação ativa, todas as instâncias operam simultaneamente processando carga real. Esse modelo dilui o impacto da falha de uma ou mais réplicas, pois as demais continuam absorvendo requisições. Balanceadores de carga distribuindo tráfego uniformemente e consumidores paralelos processando mensagens em tópicos são exemplos mais básicos dessa abordagem.

Esse modelo também pode ser encontrado em replicas de leitura de bancos de dados que possuam em estado transacional, todas os dados escritos nas replicas primárias. E além de possuir um viés de disponibilidade, onde essa réplica é capaz de assumir o papel de escrita em caso de falha na replica princial, pode exercer funcionalidades ativas na [segregação de escrita e leitura]() em diferentes instâncias. 

Esse modelo, entretanto, exige mecanismos consistentes de sincronização de dados, especialmente quando há escrita concorrente. Em bancos de dados com réplicas de leitura promovíveis, a replicação ativa pode tanto aumentar disponibilidade quanto melhorar performance por meio da segregação de leitura e escrita.


## Redundância e Replicação Passiva 

![Passiva](/assets/images/system-design/spof-passiva.drawio.png)

Na replicação passiva, apenas uma instância atua como primária enquanto outra permanece em standby, aguardando falha para assumir. Esse modelo reduz complexidade quando comparado ao ativo-ativo, mas introduz dependência crítica nos mecanismos de detecção e promoção.

Se a falha não for detectada rapidamente ou se a promoção for manual e lenta, o tempo de indisponibilidade pode ser significativo.

## Failover Automático 

![Circuit Breaker](/assets/images/system-design/spof-circuit-breaker.drawio.png)

Failover automático depende de monitoramento confiável, critérios claros de decisão e mecanismos transparentes de redirecionamento de tráfego.

# Disaster Recovery 

O Disaster Recovery é um conjunto de estratégias, processos, arquiteturas e automações projetadas para restaurar sistemas após eventos de grande impacto que ultrapassam o escopo de falhas locais que são corriqueiras para a aplicação. Desastres não são falhas normais. São eventos de grande escala que ultrapassam os limites aceitáveis de operação de um produto, como por exemplo quedas de Cloud Providers, incidentes climáticos, downtimes de componentes críticos e centralizados e etc. 

Diferente da mitigação de SPoFs, que normalmente atua em nível de componente, o Disaster Recovery opera no nível de produto com escopo amplamente sistemico e até mesmo regional. Um SPoF pode derrubar um serviço específico. Um desastre pode comprometer um datacenter inteiro, uma região de nuvem ou até múltiplos serviços simultaneamente. Incêndios, falhas elétricas, corrupção massiva de dados, erros humanos em larga escala, ataques cibernéticos ou falhas generalizadas de provedores são exemplos comuns.

Existem alguns modos de operação de DR's que podemos avaliar para implementar em necessidades do tipo. 

## Ativo-Ativo

![Ativo / Ativo](/assets/images/system-design/ativo-ativo.drawio.png)

Arquiteturas ativo-ativo permitem que múltiplas regiões ou clusters recebam tráfego simultaneamente, elevando significativamente a disponibilidade global. Contudo, essa abordagem amplia drasticamente a complexidade da consistência distribuída. 

Modelos multi-master exigem estratégias explícitas de resolução de conflitos, como last write wins ou estruturas convergentes como CRDTs. A disponibilidade aumentada vem acompanhada de maior esforço operacional e complexidade cognitiva. Em muitos casos, o ativo-ativo distribui o risco, mas não o elimina; apenas torna o impacto menos concentrado.

## Ativo-Passivo

![Ativo / Passivo](/assets/images/system-design/ativo-passivo.drawio.png)

O modelo ativo-passivo mantém uma região primária processando tráfego enquanto outra permanece preparada para assumir em caso de desastre. Essa abordagem equilibra simplicidade e resiliência. Embora menos complexa que o ativo-ativo, ainda protege contra falhas regionais significativas. 

Esse modelo equilibra custo e resiliência, sendo amplamente utilizado em ambientes regulados ou que exigem consistência forte. No entanto, a sincronização contínua de dados precisa ser validada regularmente, e em momento de chaveamento, a região passiva pode lidar com consistencia eventual de dados até que os mecanismos de sincronização estejam atualizados. 

## Pilot Light (Luz Piloto)

![Pilot Light](/assets/images/system-design/pilot-light.drawio.png)

No modelo Pilot Light, apenas os componentes essenciais permanecem ativos na região secundária, como bancos de dados replicando continuamente. Os demais recursos são provisionados sob demanda durante o desastre. Essa estratégia reduz custos operacionais, mas aumenta o tempo de recuperação, pois parte da infraestrutura precisa ser ativada e escalada após o evento.

O modelo Pilot Light assume explicitamente que desastres regionais são eventos raros e que parte da infraestrutura pode ser provisionada sob demanda caso ocorram. Ele reduz custo operacional, mas aumenta o tempo de recuperação. O sucesso dessa estratégia depende muito do nível de automação para acionar o mesmo em caso de falhas, necessitando uma quantidade significativa de testes e simulações de desastres para validar que o warm-up dos recursos em stand-by serão provisionados de forma suficiente e em tempo hábil para chaveamento do tráfego sem impactar demais a experiência de uso do cliente. 

<br>

# Métricas e KPI's de Recuperação

Quando colocamos o marco de que, tanto a eliminação de desastres quanto a inexistência completa de Single Point of Failures são de fato impossíveis, e o trabalho de projetar sistemas de alta disponibilidade operacional passa a ser sobre criar camadas de resiliência e contenção desses eventuais impactos, precisamos metrificar a efetividade das estratégias empregadas ao longo do tempo para comparações, para que identificar se estamos degradando ou melhorando a experiência do sistema. 

Para elaborar essa discussão, precisamos sair do campo qualitativo das estratégias e nos focar nos aspectos quantitativo, governando as estratégias por métricas. As principais métricas que iremos abordar serão o MTTD, MTBF, MTTR, RTO e RPO. Elas não são independentes, e sim formam um sistema matematicamente interligado que determina disponibilidade, risco e impacto das falhas de sistemas de forma mais profissional e embasada. 

## MTTD - Mean Time to Detect

O MTTD (Mean Time to Detect) representa o tempo médio entre o início de uma falha e sua detecção pelo sistema ou equipe operacional, é uma métrica que mede o tempo médio que leva para uma equipe ou sistema identificar que um incidente ou falha ocorreu. Imagine um serviço de e-commerce que sofre um problema na sua base de dados, causando lentidão nas transações dos clientes. O MTTD seria o tempo desde o início dessa lentidão até o momento em que a equipe responsável é acionada para intervenção.

O calculo do MTTD é a soma das diferenças entre a deteção e inicio dos incidentes ao decorrer do tempo dividido pelo numero de incidentes no mesmo período. 

\begin{equation}
MTTD = \frac{\text{Diferença Entre O Inicio e Detecção dos Incidentes}}{\text{Numero De Incidentes}}
\end{equation}

Por exemplo, temos a tabela dos ultimos incidentes de uma aplicação durante um período

| Hora Inicio   | Hora da Deteção   | Tempo Total   |
|---------------|-------------------|---------------|
| 11:00 AM      |  12:00 AM         | 60 min        |
| 05:12 AM      |  05:30 AM         | 18 min        |
| 03:40 PM      |  04:00 PM         | 20 min        |
| 10:12 PM      |  10:33 PM         | 21 min        |
| 09:11 AM      |  10:02 PM         | 51 min        |

<br>

Podemos calcular o MTTD do sistema da seguinte forma:

\begin{equation}
MTTD = \frac{(60 + 18 + 20 + 21 + 51)}{5}
\end{equation}

\begin{equation}
MTTD = \text{34 minutos}
\end{equation}

Ele está diretamente ligado ao investimento de tempo e inteligência de engenharia em observabilidade sistemica, contemplando logs, métricas, traces e alertas que garantam que o time esteja sempre monitorando os indicadores corretos e recebendo notificações com antecedência. 

Um MTTD alto indica ausência de observabilidade em pontos importantes da solução. Em sistemas distribuídos complexos, falhas raramente são binárias no âmbito disponível e não disponível, e sim degradam progressivamente, como aumentos de latência, formação de filas internas, saturação, erros intermitentes e timeouts em cascata. Um MTTD baixo é importante, pois quanto mais rápido uma falha é detectada, mais cedo o processo de recuperação pode ser iniciado. 

## MTTR - Mean Time to Repair

O Mean Time to Repair (MTTR) é o tempo médio necessário para reparar uma falha e restaurar o sistema à operação normal de forma completa, uma métrica que acompanha diretamente o MTTD. Em estratégias de recuperação de desastres, minimizar o MTTR é o indicador que traduz operacionalmente se estamos trabalhando com os pontos de falhas e reduzir o impacto no usuário final.


O calculo do MTTR é a soma das diferenças de tempo entre a recuperação do incidente e deteção do mesmo dividido pelo numero de incidentes no mesmo período.

\begin{equation}
MTTR = \frac{\text{Diferença Entre a Detecção e a Resolução dos Incidentes}}{\text{Numero De Incidentes}}
\end{equation}

Por exemplo: 

| Hora da Deteção   | Hora da Recuperação   | Tempo Total   |
|-------------------|-----------------------|---------------|
| 12:00 AM          |  13:30 AM             |  90 min       |
| 05:30 AM          |  07:15 AM             |  105 min      |
| 04:00 PM          |  04:00 PM             |  132 min      |
| 10:33 PM          |  10:55 PM             |  22 min       |
| 11:02 PM          |  14:15 PM             |  193 min      |


<br>

Podemos calcular o MTTR do sistema da seguinte forma:

\begin{equation}
MTTR = \frac{(90 + 105 + 132 + 22 + 193)}{5}
\end{equation}

\begin{equation}
MTTR = \text{108 minutos}
\end{equation}

Um MTTR baixo significa que o time de operação sabe lidar com as falhas conhecidas e reestabelecer os serviços de forma eficiênte e coordenada de uma forma rápida. Um MTTR alto significa o inverso, que times levam muito tempo para reestabelecer os serviços, sejam pela complexidade operacional envolvida, ou pela inexistência de processos bem definidos e documentados para recuperação de falhas.  

Para reduzir o MTTR, o time de engenharia precisa focar em documentações, runbooks, automações de tarefas de recuperação e self-healing, scripts de rollback, reinicio de serviços, as mesmas ferramentas de diagnótiscos que dão suporte ao MTTD e processos de escalonamento de incidentes e comunicações corporativas fortes e disseminadas culturalmente. 

## MTBF - Mean Time Between Failures

O Mean Time Between Failures (MTBF) é uma métrica que indica o tempo médio esperado entre duas falhas de um mesmo sistema. Basicamente a diferença de tempo entre dois acionamentos graves. É um dos indicadores de confiabilidade mais importantes, pois quanto maior o MTBF, mais confiabilidade temos no sistema em questão, 

Diferente das métricas anteriores, o MTBF considera o intervalo entre o término de um incidente e o início do próximo.

\begin{equation}
MTBF = \frac{\text{Soma dos Tempos de Operação Saudável}}{\text{Número de Falhas}}
\end{equation}

| Ordem | Recuperação Anterior | Próximo Início          | Intervalo    |
| ----- | -------------------- | ----------------------- | ---------    |
| 1     | 07:15 AM             | 09:11 AM                | 116 min      |
| 2     | 02:15 PM             | 03:40 PM                | 85 min       |
| 3     | 06:12 PM             | 10:12 PM                | 240 min      |
| 4     | 10:55 PM             | 05:12 AM (dia seguinte) | 377 min      |

<br>

Podemos calcular o MTBF do sistema da seguinte forma:

\begin{equation}
MTBF = \frac{(116 + 85 + 240 + 377)}{4}
\end{equation}

\begin{equation}
MTBF = 204{,}5 \text{ minutos}
\end{equation}

Um MTBF alto sugere que um sistema é mais estável e exige menos intervenções do time técnico em ambiente produtivo. Um MTBF baixo sugere que existem muitos componentes frágeisou estratégias que precisam de revisão. Esta métrica é fundamental para o planejamento de capacidade, manutenção preventiva e avaliação da qualidade de hardware e software.

## RTO - Recovery Time Objective

O Recovery Time Objective (RTO) é o tempo máximo aceitável que um sistema ou serviço pode ficar indisponível após a detecção de uma falha ou desastre. Esse numero tem interesse contratual, pois vão determinar qual o ferramental, estratégias e investimentos seão necessários para garantir a continuidade operacional. Soluções mais rápidas de recuperação geralmente são mais caras e complexas de implementar. Um RTO de "zero" significa que o sistema deve ser recuperado instantaneamente e os clientes não tem apetite para falhas em nenhum aspecto, o que é extremamente difícil e caro de alcançar. Atingir o RTO envolve projetar sistemas com redundância, automação de failover, backups eficientes e processos de restauração bem testados, identificando e criando fallbacks para o maior numero possível de SPoF's conhecidos.


Uma aplicação bancária transacional pode ter um RTO de 1 hora, significando que, após qualquer tipo de desastre, ela deve estar completamente operacional em no máximo 60 minutos. Já um blog pessoal, site instituciona ou pequenos ecommerces podem ter um RTO de 12, 24 ou 48 horas, pois o impacto de uma indisponibilidade, por mais que exista, é menor. Os dois exemplos guiariam por exemplo, o nível de investimento e engenharia que deve ser inserido na estratégia. Garantir ambientes celulares, multiplos shardings, arquiteturas multi-datacenters, multi-região e multi-cloud em sistemas que possuem RTO's menos exigentes não faz sentido financeiramente. Já ao contrário, pode justiticar o investimento e complexidade. 

## RPO - Recovery Point Objective

O RPO (Recovery Point Objective) define a quantidade máxima de dados que pode ser perdida após um desastre, normalmente é uma métrica relacionada a defasagem entre os dados primários e os backups e lags de replicação. Ela, assim como o RTO, é uma métrica contratual. Essa métrica guia o nível de investimento necessário em backups e estratégias de replicação de dados. Se backups ocorrem a cada 12 horas, tenho um RPO de 12 horas minutos. Se possuo 15 minutos de lag de replicação entre os dados de um sistema primário e secundário, meu RPO é 5 minutos.

Um RPO baixos ou proximos de zero significa que a perda de dados deve ser mínima ou inexistente, exigindo soluções de replicação contínua ou backups muito frequentes. Um RPO de "zero" normalmente implica em replicação síncrona ou soluções de banco de dados distribuídos altamente consistentes entre todas as zonas e regiões secundárias do dado. 

O nível de criticidade do dado guia a necessidade do RPO.  Sistemas financeiros, transacionais, hospitalares de aviação precisam ter acordos de RPO's mais criteriosos. Sistemas como redes sociais, sistemas institucionais e afins, podem lidar com opções mais flexíveis. 


### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)

[Single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure)

[What is a single point of failure?](https://www.ibm.com/docs/en/zos/3.1.0?topic=data-what-is-single-point-failure)

[Why a Single Point of Failure (SPOF) is Scary](https://www.anomali.com/blog/why-single-point-of-failure-is-scary)

[Understanding Single Point Failures: A Guide to System Resilience](https://bryghtpath.com/single-point-failures/)

[Qual a diferença entre MTTR, MTBF, MTTD e MTTF?](https://www-logicmonitor-com.translate.goog/blog/whats-the-difference-between-mttr-mttd-mttf-and-mtbf?_x_tr_sl=en&_x_tr_tl=pt&_x_tr_hl=pt&_x_tr_pto=tc)

[What Is MTTD? The Mean Time to Detect Metric, Explained](https://www.splunk.com/en_us/blog/learn/mean-time-to-detect-mttd.html)

[What Is MTTD (Mean Time to Detect)? A Detailed Explanation](https://www.sentinelone.com/blog/mttd-mean-time-to-detect-detailed-explanation/)