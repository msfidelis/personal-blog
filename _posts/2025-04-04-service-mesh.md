---
layout: post
image: assets/images/system-design/mesh-capa.png
featured: false
published: true
categories: [system-design, engineering, cloud]
title: System Design -  Service Mesh
---

Esse capítulo, assim como vários outros que seguem uma linha mais concisa e resumida, surgiu a partir de um resumo de uma aula que construí sobre o mesmo tema. As inúmeras propostas e abordagens do mercado sobre o que se espera — ou não — de um service mesh me motivaram a reunir esta revisão bibliográfica conceitual, com a proposta, mais uma vez, de colocar os pés no chão e retornar às origens dos patterns de engenharia.

Entendemos que, em diversos níveis, a implementação adequada de service meshes tende a ser altamente benéfica para diferentes tipos de arquiteturas de solução, agregando valor em termos de resiliência, disponibilidade e inteligência para sistemas distribuídos. Portanto, o objetivo final deste capítulo é esclarecer, de uma vez por todas, o que é uma malha de serviço e onde esse tipo de pattern é melhor empregado, abstraindo ao maximo as implementações diretas, focando diretamente no conceito.


<br>

# Definindo Service Mesh

O Service Mesh, ou Malha de Serviço, é, antes de qualquer coisa, um **pattern de networking**. Um Service Mesh existe para **oferecer mecanismos, diretamente na camada de rede, capazes de lidar com a alta complexidade de comunicação** entre diversos microserviços e componentes de um ambiente distribuído, fornecendo funcionalidades de **métricas, observabilidade, segurança, controle e resiliência de forma desacoplada da aplicação**, de maneira padronizada e **transparente**.

![Malha de Serviço](/assets/images/system-design/malha-de-servico.png)

O nome “malha de serviço” faz alusão a uma malha formada por muitos componentes que se comunicam entre si — sejam eles microserviços ou suas dependências diretas — consumidos por diversas fontes a todo momento.

![No-Mesh](/assets/images/system-design/no-mesh.drawio.png)

Atuando diretamente na camada de comunicação e nos protocolos de rede, um Service Mesh permite operar em uma dimensão onde, **em vez de cada serviço da malha implementar isoladamente seus próprios mecanismos de segurança, balanceamento de carga, autenticação, autorização, observabilidade e resiliência — como retries, circuit breakers e service discovery — essas responsabilidades são centralizadas de forma transparente em uma camada de comunicação dedicada a essas finalidades**, sem que a aplicação precise lidar diretamente com elas. Isso pode ocorrer por meio da interceptação do tráfego via proxies ou em camadas mais baixas, diretamente no kernel do sistema.

![With Mesh](/assets/images/system-design/mesh.drawio.png)

O pattern de Service Mesh nos permite **estender as capacidades de conexões simples como TCP, HTTP ou gRPC**. Na maioria dos cenários, o fato de um componente estabelecer conexão com outro para acionar uma funcionalidade ocorre de forma “natural”. Os Service Meshes permitem **interceptar essas conexões e adicionar uma série de comportamentos e funcionalidades adicionais**, elevando os níveis de segurança, resiliência e observabilidade em um nível abstraído da aplicação.

Uma forma simples e direta de entender a proposta do Service Mesh em um ambiente complexo de microserviços é perceber sua capacidade de **tratar a rede como software**, definindo seus comportamentos, mecanismos e níveis de segurança de forma declarativa e configurável.


<br>

# Componentes de um Service Mesh

As implementações de Service Mesh normalmente são **subdivididas em dois componentes principais: Control Plane (Plano de Controle) e Data Plane (Plano de Dados)**. Independentemente do modelo de uso ou da forma como o Service Mesh foi construído, esses dois conceitos tendem a permanecer presentes em algum nível. Ambos são complementares e definem o que, como e onde as regras de rede definidas na malha serão executadas.

![Control Plane Data Plane](/assets/images/system-design/control-plane-data-plane.drawio.png)

Essa separação **permite que as regras de comunicação entre os microserviços sejam gerenciadas de forma centralizada e, em seguida, propagadas para todos os componentes da malha, sem a necessidade de que cada microserviço seja atualizado ou modificado individualmente**, tornando a comunicação completamente segregada e transparente.

## Control Plane (Camada de Controle)

O Control Plane, ou Plano de Controle, **define e armazena, em uma camada persistente, todas as regras criadas para a malha de comunicação**. Quando definimos, por exemplo, uma regra de roteamento para selecionar qual microserviço será responsável por atender determinada requisição baseada em host, header ou path, ou uma autorização para que um serviço se comunique com outro, ou ainda uma política de chaveamento de tráfego entre versões de um mesmo serviço, **essas regras são armazenadas no Control Plane, juntamente com um mecanismo que permite sua consulta imediata pelos agentes do Data Plane, que são os responsáveis por aplicá-las na prática**.

## Data Plane (Camada de Execução)

Uma vez que as políticas estão definidas e disponíveis no Control Plane, **essas regras são encaminhadas aos agentes do Data Plane, que se encarregam de executá-las de fato. Idealmente, o Data Plane deve modificar o comportamento das comunicações de rede de forma totalmente transparente e abstrata para a aplicação, de modo que não seja necessário nenhum tipo de reinicialização ou alteração direta no serviço**.

Os agentes do Data Plane normalmente operam por meio de proxies, que **atuam como intermediários entre os serviços, interceptando chamadas sem que as aplicações estejam cientes dessa camada adicional**. Todas as requisições entre os serviços e suas dependências passam por esses proxies intermediários, que determinam para onde cada requisição deve ser encaminhada, verificam se ela tem autorização para ocorrer e coletam métricas em todas as dimensões possíveis, com base em regras previamente configuradas.


<br>

# Modelos de Service Mesh

## Modelo Client e Server

O modelo Client-Server é, talvez, o **modelo mais rudimentar de Service Mesh, pois exige a implementação direta na aplicação, especificando os endereços do Control Plane para que a aplicação renove, periodicamente, suas configurações e políticas em memória**.

![Client-Server](/assets/images/system-design/sdk.drawio.png)

Esse modelo é implementado por meio de bibliotecas e SDKs distribuídos especificamente para as linguagens utilizadas na aplicação. Nesse cenário, **a responsabilidade de lidar com as atualizações e de implementar os comportamentos desejados no Data Plane recai sobre a própria aplicação**, que executa essas tarefas diretamente em seu tempo de execução.

Normalmente, esse modelo é mais limitado em funcionalidades de resiliência e segurança que operam fora da aplicação, o que o torna menos abstraído e mais acoplado à lógica interna do serviço.


## Sidecars

A **forma mais comum** de implementação do Data Plane é por meio da aplicação de *sidecars* junto à aplicação. Em **ambientes de containers, isso significa implementar um container adicional dentro da menor unidade de medida do orquestrador, que será encarregado de receber as solicitações de entrada e saída de tráfego e decidir como elas serão roteadas para o destino original**. Esse sidecar é **responsável por buscar proativamente as políticas mais atualizadas no Control Plane e aplicar as regras de interceptação sem que a aplicação, de fato, tenha ciência disso**.

Em um exemplo prático utilizando o Kubernetes, **cada pod do serviço recebe um container adicional executando um proxy que intercepta as requisições de entrada e saída de tráfego e toma decisões antes de encaminhá-las para o container da aplicação propriamente dito**. A aplicação recebe esse request já interceptado, autorizado e eventualmente modificado, sem saber que todas essas operações foram realizadas.

![Sidecar](/assets/images/system-design/sidecar.drawio.png)

Resumidamente, toda a comunicação de entrada e saída passa por esse proxy, que aplica regras de balanceamento, retries, autenticação (mTLS), *circuit breaking* e coleta de métricas. Esse tipo de abordagem, apesar de ser a mais comum, **também é a mais custosa do ponto de vista computacional, pois requer um componente adicional alocado em cada uma das réplicas do serviço**.


## Sidecarless / Proxyless

As alternativas *Sidecarless*, ou *Proxyless*, são propostas mais modernas para a implementação de Service Meshes, principalmente por **retomarem a proposta original de serem um pattern focado em networking**. No modelo *proxyless*, as **funções que antes eram desempenhadas pelo proxy sidecar são incorporadas diretamente em componentes de rede ou no kernel, sendo compartilhadas entre os serviços**. Isso **elimina a necessidade de um componente dedicado para cada instância do serviço**, reduzindo o consumo de CPU, memória e a latência adicional introduzida por uma camada intermediária.

![Sidecarless](/assets/images/system-design/sidecarless.drawio.png)

As alternativas *Sidecarless* são, por natureza, **mais econômicas em termos de recursos computacionais e mais performáticas**, pois são construídas diretamente na camada de rede ou operam capturando eventos no kernel do host onde a solução está executando, **injetando trechos de código para tomar decisões sobre chamadas de sistema capturadas**.

Por possuírem uma natureza mais próxima do sistema operacional, **essas soluções tendem a oferecer mais funcionalidades e garantias em camadas mais baixas da rede, como a camada 4 (transporte), enquanto apresentam algumas limitações nas funcionalidades típicas da camada 7 (aplicação) da pilha OSI**. Para suprir a ausência de funcionalidades mais avançadas encontradas no modelo com sidecar, **é comum a adoção de proxies compartilhados que assumem responsabilidades específicas da camada 7, como retries, circuit breakers, controle de requisições, limitação de protocolos, entre outras**.


<br>

# Funcionalidades Comuns dos Service Meshes

Como dito anteriormente, o principal objetivo de se adotar um pattern de malha de serviço é poder adicionar comportamentos diretamente na camada da de comunicação entre as aplicações. e esses comportamentos podem se desdobrar em vários funcionalidades muito conhecidas que trabalham de forma totalmente abstraída e transparente para as aplicações que compõe a malha de servico. Aqui estaremos listando algumas que já apareceram em capítulos anteriores, mas dessa vez sendo abordados diretamente no service mesh. 

## Roteamento de Tráfego Inteligente

Service Meshes permitem definir **regras sofisticadas de roteamento de tráfego** entre serviços. É possível, por exemplo, encaminhar requisições com base em cabeçalhos, paths, versões ou pesos de tráfego. Isso viabiliza estratégias como **deployments canary**, **blue-green**, ou roteamento por contexto, como device, geolocalização ou tipo de cliente.

![Mesh](/assets/images/system-design/Scale-Mesh_Routing.drawio.png)

Uma das principais características de Service Meshs que atuam principalmente em [Layer 7](/protocolos-de-rede/) é a capacidade de **definir e trabalhar com regras complexas e sofisticadas de roteamento entre aplicações**. É possível realizar **roteamento de forma granular**, por exemplo, encaminhar requisições com base em cabeçalhos, paths, versões ou pesos de tráfego. Esse tipo de capacidade nos permite elaborar estratégias mais inteligentes de [Deployment, permitindo a execução de Canary Releases, Blue/Green Deployments, Traffic Mirror](/deployment-strategies/) e etc.

## Balanceamento de Carga Dinâmico 

O [balanceamento de carga](/load-balancing/) é um dos conceitos mais básicos ao se falar de sistemas distribuídos, [performance, capacidade, escalabilidade](/performance-capacidade-escalabilidade/) e [resiliência](/resiliencia). Dentro de um Service Mesh, o balanceamento de carga **deixa de ser responsabilidade de um componente intermediário e centralizado, passando a ser gerenciado diretamente pela própria camada de comunicação**.  

![mesh balancing](/assets/images/system-design/mesh-balancing.drawio.png)

Dessa forma, é possível realizar **checagens de saúde proativas** e aplicar, de forma granular, diversos algoritmos de balanceamento — como **Least Request, Round Robin, IP-Hash e Least Connection** — em cada microserviço de forma isolada, otimizando pontualmente os diferentes tipos de cenários encontrados em ambientes distribuídos. Para que isso funcione de forma eficiente, o Service Mesh deve **possuir funcionalidades adicionais de descoberta de serviço** para que seja possível **registrar os participantes do contexto de cada microserviço**. 


## Observabilidade e Telemetria Transparente

Por ser possível **interceptar e adicionar comportamentos customizados diretamente nas conexões e requisições** entre os componentes da malha, podemos incluir métricas de **latência, taxa de erro, throughput e tempo de resposta** dessas interações de forma mais fidedigna e transparente, sem a necessidade de componentes adicionais ou o risco de métricas tendenciosas.

![Telemetry Mesh](/assets/images/system-design/telemetry-mesh.drawio.png)

Essa mesma capacidade nos permite **gerar spans de tracing distribuído** automaticamente, de forma desacoplada das aplicações. O objetivo é obter **fontes mais confiáveis para troubleshooting, detecção de anomalias e análise de performance em ambientes complexos**.

A Telemetria e a observabilidade de dia zero tende, a ser um dos ganhos mais valiosos e instantâneas das malhas de serviço. 

## Segurança, Autenticação e Autorização

O Control Plane e o Data Plane de um Service Mesh podem dispor de mecanismos para mapear e identificar quais são os membros de determinados grupos de microserviços. A partir disso, durante a interceptação do tráfego, é possível aplicar **controles de acesso granulares**, totalmente gerenciados na camada de comunicação. Com isso, torna-se viável **restringir acessos ou permitir que apenas determinados microserviços possam se comunicar entre si**, bem como consumir endpoints e métodos específicos de forma controlada.

Quando projetamos plataformas que hospedam muitos serviços de diferentes produtos, times ou clientes, esse tipo de controle permite **segregar e isolar cargas de trabalho específicas**, garantindo segurança e isolamento de forma altamente performática e transparente — negando ou permitindo acessos diretamente na camada de rede.


## Criptografia de Tráfego e mTLS

Outra vantagem importante no quesito segurança, ao falarmos de Service Mesh, é a possibilidade de trafegar pacotes utilizando **protocolos de criptografia em ambas as pontas das conexões, de forma transparente e abstraída**. Ao adotar **mTLS por padrão**, é possível garantir que toda a comunicação entre os serviços seja criptografada diretamente em trânsito, impedindo que payloads sensíveis sejam interceptados, alterados ou envenenados por componentes maliciosos — estejam eles dentro ou fora da malha.  

O mTLS também **valida a identidade da origem e do destino antes que a conexão de fato ocorra**, além de permitir a **troca de chaves criptográficas diretamente entre os componentes intermediários**, como os sidecars, **retirando essa responsabilidade da aplicação**.

Uma boa implementação de mTLS no contexto de Service Mesh deve ser a mais transparente possível para as aplicações, **sem exigir configuração manual de certificados ou alterações nas chamadas no nível de código**. O **Control Plane** é responsável por gerenciar a emissão, rotação e revogação dos certificados, enquanto o **Data Plane** deve aplicá-los diretamente nos componentes intermediários — sejam eles instruções no kernel ou proxies em modelos com sidecar — **executando as regras de forma totalmente transparente para os serviços**.


## Resiliência na Camada de Comunicação

Ao atuar diretamente na camada de rede, o Service Mesh pode ajudar **provendo mecanismos nativos e abstraídos para lidar com falhas e instabilidades na comunicação entre os serviços**. De forma totalmente transparente à implementação dos microserviços, é possível aplicar **estratégias de retries customizadas**, com controle sobre a quantidade de tentativas e os intervalos entre elas, **timeouts configuráveis** para evitar conexões presas indefinidamente, **circuit breakers** que interrompem chamadas para destinos com falhas persistentes, e **fallbacks** que permitem a execução de comportamentos alternativos em caso de falhas, sem que as aplicações sequer percebam que esses mecanismos estão em ação.

![Retry Mesh](/assets/images/system-design/retry-mesh.png)

Além disso, podemos também aplicar **injeção de falhas intencionais na comunicação entre microserviços**, com o objetivo de testar e validar as estratégias de resiliência adotadas, promovendo um ambiente mais preparado para permanecer disponível em situações adversas com os patterns de Fault Injection. 

![Mesh Fault Injection](/assets/images/system-design/mesh-fault-injection.drawio.png)


<br>

### Referências

[Service mesh](https://www.redhat.com/pt-br/topics/microservices/what-is-a-service-mesh)

[The Istio service mesh](https://istio.io/latest/about/service-mesh/)

[Dissecting Overheads of Service Mesh Sidecars](https://dl.acm.org/doi/pdf/10.1145/3620678.3624652)

[An Empirical Study of Service Mesh Traffic Management Policies for Microservices](https://dl.acm.org/doi/pdf/10.1145/3620678.3624652)

[Service Mesh Patterns](https://dl.acm.org/doi/pdf/10.1145/3489525.3511686)

[Istio - ZTunnel](https://github.com/istio/ztunnel)

[Service mesh vs. API gateway](https://www.solo.io/topics/service-mesh/service-mesh-vs-api-gateway)

[Introducing Ambient Mesh](https://istio.io/latest/blog/2022/introducing-ambient-mesh/)

[Use the proxyless service mesh feature in gRPC services](https://www.alibabacloud.com/help/en/asm/use-cases/use-the-proxyless-service-mesh-feature-in-grpc-services)

[Proxyless Service Mesh](https://dubbo.apache.org/en/overview/mannual/golang-sdk/tutorial/deploy2/proxyless_service_mesh/)

[What is a Service Mesh?](https://konghq.com/blog/learning-center/what-is-a-service-mesh)

[Service Mesh: O que é e Principais Características](https://www.luisdev.com.br/2022/06/15/service-mesh-o-que-e-principais-caracteristicas/)

[O que é Fault Injection Testing](https://lbodev.com.br/glossario/o-que-e-fault-injection-testing/)