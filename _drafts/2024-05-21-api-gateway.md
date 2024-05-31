---
layout: post
image: assets/images/system-design/escalabilidade-capa.png
author: matheus
featured: false
published: true
categories: [ system-design, engineering, cloud ]
title: System Design - API Gateways
---

O objetivo deste capítulo é aproveitar as jornadas de [protocolos de rede](), [balanceadores de carga](), [monolitos e microserviços]() para analisarmos os **API Gateways**. Ter a oportunidade de olhar os Gateways como um pattern e detalhar seus conceitos abstraindo as implamentações, desassociando os mesmos de tecnologias nominais, pode nos abrir caminhos para elucidar soluções e sugerir melhorias em arquiteturas complexas de exposição de serviços, interna e externamente das organizações, além de gerar insights produtivos para governança desse tipo de cenário.  

<br>

# Definindo API Gateways

Em sistemas modernos, as arquiteturas tendem a se tornar mais complexas, granulares e distribuídas. Neste contexto, os API Gateways surgem como uma solução para um problema significativo: fornecer uma interface consistente para acessar diversos componentes através de um único ponto de contato.

Um API Gateway é uma **camada de abstração entre os clientes e os serviços existentes dentro de uma arquitetura**, oferecendo uma **interface única** e **roteamento entre esses vários serviços**. Ele atua como um **centralizador de comunicações síncronas** entre os microserviços de um ambiente específico. O API Gateway recebe todas as chamadas de API, as encaminha para os serviços internos apropriados com base em regras predefinidas (como basepaths e métodos) e depois retorna as respostas dos serviços aos clientes solicitantes. 

Visto como um padrão, ele busca unificar as comunicações entre cliente e servidor através de um único ponto de entrada conhecido, centralizando funcionalidades comuns entre eles, como autenticação, autorização, cache, firewalls, rate limits, etc.

Importante ressaltar que os Gateways, por padrão, são intermediários primariamente de APIs REST.


## O problema que os API Gateways resolvem?

Vamos propor um cenário. Em um backend monolítico, em ambientes modernos, se os clientes precisassem recuperar alguns dados ou consumir serviços dessa aplicação, eles fariam uma chamada de API para a URL do backend, e um balanceador de carga que responderia primariamente pelo endereço encaminharia a requisição para um dos nodes disponíveis na sua lista de hosts. Até aí, nada novo. 

![API Monolito](/assets/images/system-design/api-gateway-monolito.png)

> Exemplo de exposição direta de uma aplicação monolítica

Partindo para um paralelo com microserviços, a dinâmica é praticamente a mesma, porém o cliente efetuaria a chamada diretamente para o microserviço responsável pela especificidade da sua solicitação, diversificando as opções de chamadas entre várias URLs diferentes.

Vamos melhorar um pouco o cenário, onde todos esses endpoints precisam ser públicos, pois os clientes são Single Page Applications, Aplicações Mobile ou Integrações de Terceiros.

![API Microservices](/assets/images/system-design/api-gateway-microservices.png)

> Exemplo de exposição direta de vários microserviços

A necessidade de disponibilizá-los publicamente se tornaria algo complexo, uma vez que ficaria a cargo dos clientes conhecer todos os endpoints disponíveis e gerenciar cada um deles com documentações e URLs individuais. Além disso, haveria a dificuldade de implementação de mecanismos de segurança pelos times internos, como gestão de autenticação e autorização, onde seria necessário garantir que todos eles implementassem esses mecanismos da mesma forma, assegurando os mesmos padrões de segurança.

Ainda podemos expandir esse cenário para o ciclo de vida da aplicação, onde seria necessária a substituição de um desses serviços por uma solução mais moderna, desativando o antigo. O esforço para fazer essa mudança iria muito além dos times de tecnologia responsáveis, levando trabalho adicional para os clientes de integração.

Os API Gateways resolvem esse tipo de cenário, pois encapsulam os sistemas internos de um produto ou domínio e fornecem meios de lidar com cada um dos serviços através de seus endpoints.

<br>

# API Gateways em Arquiteturas de Microserviços

Como abordado, em arquiteturas baseadas em microserviços que podem envolver dezenas ou centenas de serviços distintos, os API Gateways simplificam a interação dos clientes com esses serviços. Eles abstraem a complexidade do backend, proporcionando um ponto de entrada único e coeso para todos os serviços disponíveis, e pois isso reduzem a complexidade para os clientes. Isso significa que os clientes não precisam saber onde cada serviço está localizado ou como eles estão divididos internamente. 

Basicamente, os API Gateways encapsulam a complexidade dos sistemas distribuídos e expõem endpoints simplificados. Eles podem agrupar vários endpoints e redirecionar as solicitações para diferentes microserviços e sistemas, tudo através de um único ponto de contato.

![API Gateway](/assets/images/system-design/api-gateway.png)

> Exemplo funcional de exposição de vários microserviços através de um API Gateway

Esse tipo de arquitetura te permite fazer com que cada requisição feita para um `recurso` ou `método` da API descrita no Gateway, seja encaminhado pora um microserviço diferente. Esse tipo de flexibilidade é muito interessante para solucionar problemas de governança e organização de produtos oferecidos internamente ou externamente. Essa abordagem pode facilitar tanto em casos mais simples, quanto pra casos de roteamento mais complexos.  

![API Gateway](/assets/images/system-design/api-gateway-1.png)
> API Gateway redirecionando tráfego para diversos microserviços com base no path-prefix

![API Gateway](/assets/images/system-design/api-gateway-2.png)
> API Gateway redirecionando tráfego para diversos microserviços com base em regras mais específicas de método e path

Uma vez que o sistema é totalmente abstraído por um recurso do gateway, a troca ou substituição desse serviço se torna muito simples. Respeitando os contratos pré-estabelecidos, uma troca de backend em vôo sem muitos impactos é extremamente possível. 

<br>

# API Gateways e Load Balancers

A comparação entre API Gateways e Load Balancers e Proxies Reversos pode surgir de forma natural uma vez que todas as opções se dispõe a intermediar requisições entre os clientes e um backend conhecido, e mais ainda se API Gateways em sua totalidade de implementação podem em algum momento substituir o uso de balanceadores de carga. Enquanto balanceadores se concentram em balancear requisições entre N replicas da mesma aplicação em diversas camadas de rede como Layer 7 ou Layer 4, com a possibilidade dessa aplicação ser qualquer tipo de coisa, como uma página na Web, um serviço RPC, banco de dados ou API's REST, os API Gateways se concentram em apenas criar uma abstração unificada para diversos endpoints que de alguma forma são construídos para lidar com o protocolo HTTP, como API's REST, Websockets e etc. 

Os API Gateways se concentram em resolver problemas de governança em um ambito muito especifico de API's REST, fazendo com que os mesmos exponham somente os endpoints selecionados e fazendo gestão de consumo dos mesmos, já as outras opções possuem outras propostas mais abrangentes, e que muitas vezes não suprem a necessidade de uma gestão granular de um API Gateway. 

![API Gateway](/assets/images/system-design/api-gateway-balancer.png)
> API Gateways tendo Load Balancers como Backend

Ambas as soluções, podem e são utilizadas em conjunto, com API's Gateways concentrando seus backends em forma de balanceadores de carga, sejam eles qual forem, mas que abstraem a distribuição de tráfego entre todos as upstreams disponíveis e cuidando da checkagem de saúde e resiliência dos mesmos. 

<br>

# Componentes e Arquitetura de um API Gateway

Esta seção descreve os principais componentes e a estrutura arquitetônica de um API Gateway, destacando como cada parte contribui para a eficiência, segurança e escalabilidade da aplicação. Um API Gateway típico é composto por vários componentes e funcionalidades que trabalham juntos para processar as requisições, como por exemplo **roteamento de requisições**, centralizador de autenticação e autorização, limitador de trafego e mecanismo de throttling, modificação de mensagens e gerenciamento de cachings.

## Roteamento de requisições

O roteamente de requisições centralizada é a funcionalidade central dos padrões de design de API Gateway. Ele permite que com base em informações fornecidas pelo cliente através do próprio protocolo HTTP, que normalmente não conhece diretamente os microserviços que existem atrás do API Gateway, o roteamento para o microserviço responsável seja feito de forma correta. 

## Autenticação e autorização

A **Autenticação é o processo de verificar a identidade do usuário**, enquanto a **autorização determina quais recursos ou serviços o usuário pode acessar**, baseado em suas permissões. Basicamente, **autenticação diz ao sistema quem você é**, enquanto **autorização diz ao sistema o que você pode fazer**. Muitos API Gateways fornecem uma forma centralizada de validar esse tipo de controle de acesso, eliminando a necessidade de implementar esses processos em todos os microserviços que recebem as requisições diretamente. Abstrair a autenticação e autorização diretamente no API Gateway nos proporciona uma oportunidade de escalabilidade e clareza arquitetural.

Em muitos casos, os API Gateways precisam contar com um servidor de identidade externo para se integrar com provedores de autenticação e autorização.


## Limitação de taxa (Rate Limiting) e Throttling

Os API Gateways comumente fazem uso de mecanismos de limitação e controle de uso de seus recursos para evitar sobrecarga em seus sistemas adjacentes, ou até mesmo na propria infraestrutura do gateway. Esses recursos são as implementações de Rate Limiting e Throttling.


O Rate Limiting, ou Limitação de taxa, é o processo de **restringir o número de solicitações que um usuário pode fazer a um serviço em um período específico**, é a **prática de controlar a quantidade de recursos usados por uma aplicação ou cliente**. Essa é uma estratégia muito valiosa para prevenir abusos de uso pontuais e proteger os recursos do backend de saturarem e atuar além da capacidade disponível sem ferir a qualidade. Imagine que você conhece as limitações do serviço de compra de pacotes de backend que responde no basepath `/pacote`. Você sabe que seu serviço atende sem degradar até 100 requisições por segundo e esse é o gargalo limitador desse backend. Você pode utilizar o Rate Limit para segurar as demais requisições que ultrapassarem os 100 TPS no Gateway e evitar passar o volume sobressalente para o serviço. As limitações de taxa são medidas preventivas e também podem ser utilizadas como features comerciais de uso das API's, em que o podem ser comercializados rate limits maiores para clientes que tem planos maiores do seu produto. 

O Throttling, ou estrangulamento, é a **prática de controlar a quantidade de recursos usados quando os limites são atingidos**, geralmente diminuindo ou bloqueando a taxa de solicitações permitidas quando a mesma é ultrapassada. Pode ser consequencia do Rate Limit quando o mesmo é ultrapassado numa escala global do gateway. O throttling pode ser implementado de forma temporária, até que o serviço do backend seja estabilizado em caso de saturação dos sistemas adjacentes. Ele pode ser configurado como um recurso do próprio gateway, e não dos sub sistemas de backend. Como por exemplo, sabemos que cada cliente pode realizar até 10 requisições no período de 1 segundo. Porém independente dessa taxa ser criada para proteger o sistema destino, o próprio gateway tem suas limitações de escalabilidade e infraestrutura, e pode suportar até 10.000 de transações por segundo. Caso a soma de todos os clientes ultrapasse o limite do próprio gateway, uma medida de throttling pode ser acionada, limitando parcialmente a quantidade de requisições que podem ser atentidas para reestabelecer a saúde de toda a malha de serviço. 

Tanto o Rate Limit quando Throttling se baseiam em controlar a quantidade de tráfego, mas o Rate Limit funciona de forma preventiva, e to throttling de forma reativa. 


## Gerenciamento de APIs e Versionamento

O gerenciamento de APIs envolve a criação, publicação, manutenção e monitoração das APIs. O versionamento é a prática de gerenciar mudanças nas APIs, permitindo que múltiplas versões de uma API coexistam para suportar diferentes clientes e casos de uso ao longo do tempo. Esse tipo de recurso normalmente se dispõe em reescrever a chamada do backend além do path do gateway, como por exemplo: 

![API Gateway Versionamento](/assets/images/system-design/api-gateway-version.png)

A capacidade de fazer uma gestão de tráfego entre duas versões do mesmo backend também é uma necessidade verdadeira. API Gateways de uma forma geral também podem oferecer uma proposta de release gradativa, como um canary deployment progressivo e controlado para facilitar uma substituição a quente de um serviço por outro, desde que os dois respeitem os mesmos contratos, como por exemplo: 

![API Gateway Canary](/assets/images/system-design/api-gateway-caanry.png)



### Referências

[What Is an API Gateway?](https://www.nginx.com/learn/api-gateway/)

[JWT Introduction](https://jwt.io/introduction)

