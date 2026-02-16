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

## Ativo-Ativo

![Ativo / Ativo](/assets/images/system-design/ativo-ativo.drawio.png)

Arquiteturas ativo-ativo permitem que múltiplas regiões ou clusters recebam tráfego simultaneamente, elevando significativamente a disponibilidade global. Contudo, essa abordagem amplia drasticamente a complexidade da consistência distribuída.

Modelos multi-master exigem estratégias explícitas de resolução de conflitos, como last write wins ou estruturas convergentes como CRDTs. A disponibilidade aumentada vem acompanhada de maior esforço operacional e complexidade cognitiva.

## Ativo-Passivo

![Ativo / Passivo](/assets/images/system-design/ativo-passivo.drawio.png)

O modelo ativo-passivo mantém uma região primária processando tráfego enquanto outra permanece preparada para assumir em caso de desastre. Essa abordagem equilibra simplicidade e resiliência. Embora menos complexa que o ativo-ativo, ainda protege contra falhas regionais significativas.

## Pilot Light (Luz Piloto)

![Pilot Light](/assets/images/system-design/pilot-light.drawio.png)

No modelo Pilot Light, apenas os componentes essenciais permanecem ativos na região secundária, como bancos de dados replicando continuamente. Os demais recursos são provisionados sob demanda durante o desastre. Essa estratégia reduz custos operacionais, mas aumenta o tempo de recuperação, pois parte da infraestrutura precisa ser ativada e escalada após o evento.

### Referencias 

[Single Point of Failure (SPOF) in System Design](https://levelup.gitconnected.com/single-point-of-failure-spof-in-system-design-c8bbac5af993)

[Single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure)

[What is a single point of failure?](https://www.ibm.com/docs/en/zos/3.1.0?topic=data-what-is-single-point-failure)

[Why a Single Point of Failure (SPOF) is Scary](https://www.anomali.com/blog/why-single-point-of-failure-is-scary)

[Understanding Single Point Failures: A Guide to System Resilience](https://bryghtpath.com/single-point-failures/)