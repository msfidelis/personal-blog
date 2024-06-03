---
layout: post
image: assets/images/system-design/api-gateway-wide.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - API Gateways
---

O objetivo deste capítulo é aproveitar as jornadas de [protocolos de rede](/protocolos-de-rede/), [balanceadores de carga](/load-balancing/), [padrões de comunicações síncronos](/padroes-de-comunicacao-sincronos/), [monolitos e microserviços](/monolitos-microservicos/) para analisarmos os **API Gateways**. Ter a oportunidade de olhar os Gateways como um pattern e detalhar seus conceitos, abstraindo as implementações e desassociando-os de tecnologias específicas, pode nos abrir caminhos para elucidar soluções e sugerir melhorias em arquiteturas complexas de exposição de serviços, tanto interna quanto externamente nas organizações. Além disso, pode gerar insights produtivos para a governança desse tipo de cenário.

<br>

# Definindo API Gateways

Em sistemas modernos, as arquiteturas tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem como uma solução para um problema significativo: como acessar os diversos componentes de forma consistente?

Um API Gateway é uma **camada de abstração entre os clientes e os serviços existentes dentro de uma arquitetura**, oferecendo uma **interface única** e **roteamento entre esses vários serviços**. Ele atua como um **centralizador de comunicações síncronas** entre os microserviços de um ambiente específico. O API Gateway recebe todas as chamadas de API, as encaminha para os serviços internos apropriados com base em regras predefinidas (como basepaths e métodos) e depois retorna as respostas dos serviços aos clientes solicitantes. Resumindo, oferece a experiência ao usuário final da API de consumir diversos serviços como se fosse um só. 

Visto como um padrão, ele busca unificar as comunicações entre cliente e servidor através de um único ponto de entrada conhecido, centralizando funcionalidades comuns entre eles, como autenticação, autorização, cache, firewalls, rate limits, etc.

É importante ressaltar que os Gateways, por padrão, são intermediários primariamente de APIs REST.


## O problema que os API Gateways resolvem?

Vamos propor um cenário. Em um backend monolítico, em ambientes modernos, quando os clientes precisam recuperar alguns dados ou consumir serviços dessa aplicação, eles fazem uma chamada de API para a URL do backend, e um balanceador de carga, que responde primariamente pelo endereço, encaminha a requisição para um dos nodes disponíveis na sua lista de hosts. Até aí, nada novo.

![API Monolito](/assets/images/system-design/api-gateway-monolito.png)

> Exemplo de exposição direta de uma aplicação monolítica

Partindo para um paralelo com microserviços, a dinâmica é praticamente a mesma, porém o cliente efetua a chamada diretamente para o microserviço responsável pela especificidade da sua solicitação, diversificando as opções de chamadas entre várias URLs diferentes.

Vamos melhorar um pouco o cenário, onde todos esses endpoints precisam ser públicos, pois os clientes são Single Page Applications, Aplicações Mobile ou Integrações de Terceiros.

![API Microservices](/assets/images/system-design/api-gateway-microservices.png)

> Exemplo de exposição direta de vários microserviços

A necessidade de disponibilizá-los publicamente se torna algo complexo, uma vez que fica a cargo dos clientes conhecer todos os endpoints disponíveis, cada um com documentações e URLs próprias. Além disso, existe a dificuldade de implementação de mecanismos de segurança pelos times internos, como gestão de autenticação e autorização, onde é necessário garantir que todos eles implementem esses mecanismos da mesma forma, assegurando os mesmos padrões de segurança.

Ainda podemos expandir esse cenário para o ciclo de vida da aplicação, onde seria necessária a substituição de um desses serviços por uma solução mais moderna, desativando o antigo. O esforço para fazer essa mudança iria muito além dos times de tecnologia responsáveis, levando trabalho adicional para os clientes de integração.

Os API Gateways resolvem esse tipo de cenário, pois encapsulam os sistemas internos de um produto ou domínio e fornecem meios de lidar com cada um dos serviços através de seus endpoints.

<br>

# API Gateways em Arquiteturas de Microserviços

Como abordado, em arquiteturas baseadas em microserviços que podem envolver dezenas ou centenas de serviços distintos, os API Gateways simplificam a interação dos clientes com esses serviços. Eles abstraem a complexidade do backend, proporcionando um ponto de entrada único e coeso para todos os serviços disponíveis. Isso significa que os clientes não precisam saber onde cada serviço está localizado ou como eles estão divididos internamente, reduzindo também a complexidade para os clientes.

Basicamente, os API Gateways encapsulam a complexidade dos sistemas distribuídos e expõem endpoints simplificados. Eles podem agrupar vários endpoints e redirecionar as solicitações para diferentes microserviços e sistemas, tudo através de um único ponto de contato.

![API Gateway](/assets/images/system-design/api-gateway.png)

> Exemplo funcional de exposição de vários microserviços através de um API Gateway

Esse tipo de arquitetura permite que cada requisição feita para um `recurso` ou `método` da API descrita no Gateway seja encaminhada para um microserviço diferente. Essa flexibilidade é muito interessante para solucionar problemas de governança e organização de produtos oferecidos internamente ou externamente. Essa abordagem pode facilitar tanto em casos mais simples quanto em casos de roteamento mais complexos.

![API Gateway](/assets/images/system-design/api-gateway-1.png)

> API Gateway redirecionando tráfego para diversos microserviços com base no path-prefix

![API Gateway](/assets/images/system-design/api-gateway-2.png)

> API Gateway redirecionando tráfego para diversos microserviços com base em regras mais específicas de método e path

Uma vez que o sistema é totalmente abstraído por um recurso do gateway, a troca ou substituição desse serviço se torna muito simples. Respeitando os contratos pré-estabelecidos, uma troca de backend em voo, sem muitos impactos, é extremamente possível.


<br>

# API Gateways e Load Balancers

A comparação entre API Gateways, Load Balancers e Proxies Reversos pode surgir de forma natural, uma vez que todas as opções se dispõem a intermediar requisições entre os clientes e um backend conhecido. Além disso, pode-se questionar se os API Gateways, em sua totalidade de implementação, podem em algum momento substituir o uso de balanceadores de carga.

Enquanto balanceadores se concentram em distribuir requisições entre N réplicas da mesma aplicação em diversas camadas de rede, como Layer 7 ou Layer 4, com a possibilidade dessa aplicação ser qualquer tipo de coisa, como uma página na Web, um serviço RPC, banco de dados ou APIs REST, os API Gateways se concentram em criar uma abstração unificada para diversos endpoints que de alguma forma são construídos para lidar com o protocolo HTTP, como APIs REST, Websockets, etc.

Os API Gateways se concentram em resolver problemas de governança em um âmbito muito específico de APIs REST, expondo somente os endpoints selecionados e gerenciando o consumo dos mesmos. Já as outras opções possuem propostas mais abrangentes, que muitas vezes não suprem a necessidade de uma gestão granular proporcionada por um API Gateway.

![API Gateway](/assets/images/system-design/api-gateway-balancer.png)

> API Gateways tendo Load Balancers como Backend

Ambas as soluções podem e são utilizadas em conjunto, com APIs Gateways concentrando seus backends em forma de balanceadores de carga, sejam eles quais forem, mas que abstraem a distribuição de tráfego entre todos os hosts disponíveis, cuidando da checagem de saúde e resiliência dos mesmos.

<br>

# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de tráfego e mecanismo de throttling, modificação de mensagens e gerenciamento de cache.

## Roteamento de Requisições

O roteamento de requisições centralizado é a funcionalidade central dos padrões de design de API Gateway. Ele permite que, com base em informações fornecidas pelo cliente através do próprio protocolo HTTP, o roteamento para o microserviço responsável seja feito de forma correta, mesmo que os clientes não conheçam diretamente os microserviços que existem atrás do API Gateway,


## Autenticação e Autorização

A **autenticação é o processo de verificar a identidade do usuário**, enquanto a **autorização determina quais recursos ou serviços o usuário pode acessar**, baseado em suas permissões. Basicamente, **autenticação diz ao sistema quem você é**, enquanto **autorização diz ao sistema o que você pode fazer**. Muitos API Gateways fornecem uma forma centralizada de validar esse tipo de controle de acesso, eliminando a necessidade de implementar esses processos em todos os microserviços que recebem as requisições diretamente. Abstrair a autenticação e autorização diretamente no API Gateway proporciona uma oportunidade de escalabilidade e clareza arquitetural.

Em muitos casos, os API Gateways precisam contar com um servidor de identidade externo para se integrar com provedores de autenticação e autorização.


## Limitação de Taxa (Rate Limiting) e Throttling

Os API Gateways comumente fazem uso de mecanismos de limitação e controle de uso de seus recursos para evitar sobrecarga em seus sistemas adjacentes, ou até mesmo na própria infraestrutura do gateway. Esses recursos são as implementações de Rate Limiting e Throttling.

O Rate Limiting, ou limitação de taxa, é o processo de **restringir o número de solicitações que um usuário pode fazer a um serviço em um período específico**. É a **prática de controlar a quantidade de recursos usados por uma aplicação ou cliente**. Essa é uma estratégia muito valiosa para prevenir abusos de uso pontuais e proteger os recursos do backend de saturarem e atuarem além da capacidade disponível sem ferir a qualidade. Imagine que você conhece as limitações do serviço de compra de pacotes de backend que responde no basepath `/pacote`. Você sabe que seu serviço atende sem degradar até 100 requisições por segundo e esse é o gargalo limitador desse backend. Você pode utilizar o Rate Limiting para segurar as demais requisições que ultrapassarem os 100 TPS no Gateway e evitar passar o volume excedente para o serviço. As limitações de taxa são medidas preventivas e também podem ser utilizadas como features comerciais de uso das APIs, em que podem ser comercializados rate limits maiores para clientes que têm planos maiores do seu produto.

O Throttling, ou estrangulamento, é a **prática de controlar a quantidade de recursos usados quando os limites são atingidos**, geralmente diminuindo ou bloqueando a taxa de solicitações permitidas quando a mesma é ultrapassada. Pode ser consequência do Rate Limiting quando o mesmo é ultrapassado numa escala global do gateway. O Throttling pode ser ativado de forma temporária, até que o serviço do backend seja estabilizado em caso de saturação dos sistemas adjacentes. Ele pode ser configurado como um recurso do próprio gateway, e não dos subsistemas de backend. Como por exemplo, sabemos que cada cliente pode realizar até 10 requisições no período de 1 segundo. Porém, independentemente dessa taxa ser criada para proteger o sistema destino, o próprio gateway tem suas limitações de escalabilidade e infraestrutura, e pode suportar até 10.000 transações por segundo. Caso a soma de todos os clientes ultrapasse o limite do próprio gateway, uma medida de Throttling pode ser acionada, limitando parcialmente a quantidade de requisições que podem ser atendidas para restabelecer a saúde de toda a malha de serviço.

O Throttling é como um sistema de defesa. Imagine que um componente de uma máquina atinge uma temperatura que pode causar uma pane geral no funcionamento. Uma operação de Throttling restringiria a capacidade de funcionamento da máquina significativamente até que a temperatura diminua. Durante esse meio tempo, a vazão da máquina é reduzida para proteger sua integridade.

Tanto o Rate Limiting quanto o Throttling se baseiam em controlar a quantidade de tráfego, mas o Rate Limiting funciona de forma preventiva, e o Throttling de forma reativa.


## Gerenciamento de APIs e Versionamento

O gerenciamento de APIs envolve a criação, publicação, manutenção e monitoração das APIs. O versionamento é a prática de gerenciar mudanças nas APIs, permitindo que múltiplas versões de uma API coexistam para suportar diferentes clientes e casos de uso ao longo do tempo. Esse tipo de recurso normalmente se dispõe em reescrever a chamada do backend além do path do gateway, como por exemplo:

![API Gateway Versionamento](/assets/images/system-design/api-gateway-version.png)

A capacidade de fazer uma gestão de tráfego entre duas versões do mesmo backend também é uma necessidade verdadeira. API Gateways, de uma forma geral, também podem oferecer uma proposta de release gradativa, como um canary deployment progressivo e controlado para facilitar uma substituição a quente de um serviço por outro, desde que os dois respeitem os mesmos contratos, como por exemplo:

![API Gateway Canary](/assets/images/system-design/api-gateway-canary.png)

<br>

#### Obrigado aos Revisores

* [Tarsila, amor da minha vida](https://twitter.com/tarsilabianca_c/)

* [Pedro Rivero](https://twitter.com/pedrosrtcosta/)

* [Felipe Madureira](https://twitter.com/madfelps/)

* [Kauê Gatto](https://www.linkedin.com/in/kaue-gatto/)

* [André Fernandes](https://x.com/andrenit)

### Referências

[What Is an API Gateway?](https://www.nginx.com/learn/api-gateway/)

[JWT Introduction](https://jwt.io/introduction)

[What Is an API Gateway & How Does It Work?](https://blog.hubspot.com/website/api-gateway)

[API Gateways - Microservices](https://microservices.io/patterns/apigateway.html)

[My experiences with API gateways…](https://mahesh-mahadevan.medium.com/my-experiences-with-api-gateways-8a93ad17c4c4)

[O que é thermal throttling e como corrigir](https://canaltech.com.br/amp/hardware/o-que-e-thermal-throttling/)

[WCF - Throttling e Pooling](http://www.linhadecodigo.com.br/artigo/1996/wcf-throttling-e-pooling.aspx#:~:text=Basicamente%20a%20id%C3%A9ia%20do%20Throttling,do%20servi%C3%A7o%2C%20independente%20de%20endpoints)

[The Ultimate Guide to API Gateways](https://blog.softwareag.com/ultimate-guide-api-gateways/)

[What is API Gateway | System Design ?](https://www.geeksforgeeks.org/what-is-api-gateway-system-design/)

[API Gateway - System Design](https://medium.com/@karan99/system-design-api-gateway-6e6b41de45e3)
