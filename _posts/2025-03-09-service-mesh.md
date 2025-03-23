---
layout: post
image: assets/images/system-design/deploy-capa.png
featured: false
published: true
categories: [system-design, engineering, cloud]
title: System Design -  Service Mesh
---

Esse capítulo, assim como vários outros que seguem uma linha mais concisa e resumida, surgiu a partir de um resumo de uma aula que construí sobre o mesmo tema. As inúmeras propostas e abordagens do mercado sobre o que se espera — ou não — de um service mesh me motivaram a reunir esta revisão bibliográfica conceitual, com a proposta, mais uma vez, de colocar os pés no chão e retornar às origens dos patterns de engenharia.

Entendemos que, em diversos níveis, a implementação adequada de service meshes tende a ser altamente benéfica para diferentes tipos de arquiteturas de solução, agregando valor em termos de resiliência, disponibilidade e inteligência para sistemas distribuídos. Portanto, o objetivo final deste capítulo é esclarecer, de uma vez por todas, o que é uma malha de serviço e onde esse tipo de pattern é melhor empregado.


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
